import { getConnecterUser, triggerNotConnected } from "../lib/session.js"; // Ensure .js extension
import { Redis } from '@upstash/redis';
// Use import for ES module compatibility in Vercel Serverless
import PushNotifications from "@pusher/push-notifications-server";

const redis = Redis.fromEnv();

// Initialize Pusher Beams client (make sure env variables are set)
let beamsClient;
if (process.env.PUSHER_INSTANCE_ID && process.env.PUSHER_SECRET_KEY) {
    beamsClient = new PushNotifications({ // Use 'new' if required by the library
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });
} else {
    console.error("API Message: PUSHER_INSTANCE_ID or PUSHER_SECRET_KEY environment variables are not defined!");
}

// Function to generate consistent Redis key for conversations
function getConversationKey(userId1, userId2) {
    const ids = [String(userId1), String(userId2)].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

// Vercel Serverless Function handler (request, response)
export default async (request, response) => {
    console.log("[API Message WRITE] Received request");
    if (request.method !== 'POST') {
        console.log("[API Message WRITE] Invalid method:", request.method);
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        console.log("[API Message WRITE] Authenticating user...");
        const user = await getConnecterUser(request); // Sender info
        if (user === undefined || user === null) {
            console.log("[API Message WRITE] Authentication failed");
            triggerNotConnected(response); // Use Serverless response function
            return;
        }
        console.log("[API Message WRITE] Authenticated user:", user.username, "(ID:", user.id, ")");

        console.log("[API Message WRITE] Parsing body...");
        let messagePayload = request.body; // Vercel often pre-parses for Serverless
         // Add robust parsing just in case
         if (typeof request.body === 'string') {
            try { messagePayload = JSON.parse(request.body); } catch (e) { console.error("[API Message WRITE] Invalid JSON body string:", e); return response.status(400).json({ error: 'Invalid JSON body' }); }
        } else if (typeof request.body === 'object' && request.body !== null) {
            messagePayload = request.body;
        } else { console.error("[API Message WRITE] Invalid or missing body type:", typeof request.body); return response.status(400).json({ error: 'Invalid or missing request body' });}
        console.log("[API Message WRITE] Body parsed:", messagePayload);

        // Validate required fields
        if (!messagePayload.targetUserId || !messagePayload.content) {
            console.error("[API Message WRITE] Validation failed: Missing targetUserId or content", messagePayload);
            return response.status(400).json({ error: 'Missing targetUserId or content' });
        }

        // Prepare message object for storage
        const messageToStore = {
            senderId: user.id,
            content: messagePayload.content,
            timestamp: Date.now(),
        };
        const conversationKey = getConversationKey(user.id, messagePayload.targetUserId);
        console.log(`[API Message WRITE] Target key: ${conversationKey}`);
        console.log(`[API Message WRITE] Message to store:`, messageToStore);

        // --- Store message in Redis ---
        console.log(`[API Message WRITE] Calling redis.lpush...`);
        await redis.lpush(conversationKey, JSON.stringify(messageToStore)); // Store as JSON string
        console.log(`[API Message WRITE] redis.lpush finished.`);
        console.log(`[API Message WRITE] Calling redis.expire...`);
        await redis.expire(conversationKey, 86400); // Set 24h expiration
        console.log(`[API Message WRITE] redis.expire finished.`);
        // --- End Redis storage ---

        // --- Send Pusher Notification ---
        console.log("[API Message WRITE] Attempting Pusher notification...");
        if (beamsClient) {
            // Get target user details (including externalId) from Redis hash 'users'
            const targetUser = await redis.hget("users", messagePayload.targetUserId);

            if (targetUser && targetUser.externalId) {
                console.log(`[API Message WRITE] Found target user for Pusher: ${targetUser.externalId}`);

                // Construct full deep_link URL
                const host = request.headers['host'] || 'localhost:3000'; // Get host from headers
                const protocol = host.startsWith('localhost') ? 'http' : 'https';
                const fullDeepLink = `${protocol}://${host}/messages/user/${user.id}`; // Link opens chat *with the sender*
                console.log(`[API Message WRITE] Generated deep_link: ${fullDeepLink}`);

                try {
                    // Publish notification to the target user's externalId
                    const publishResponse = await beamsClient.publishToUsers(
                        [targetUser.externalId], // Array of recipient externalIds
                        {
                            web: {
                                notification: {
                                    title: `Nouveau message de ${user.username}`, // Sender's name
                                    body: messageToStore.content, // Message content
                                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                                    deep_link: fullDeepLink // Correct full URL
                                },
                                // Send the full message object in the data payload
                                data: messageToStore
                            },
                        }
                    );
                    console.log("[API Message WRITE] Pusher publish successful:", publishResponse.publishId);
                } catch (publishError) {
                     console.error("[API Message WRITE] Pusher publish error:", publishError);
                     // Log error but don't stop the response
                }
            } else {
                console.warn(`[API Message WRITE] Target user ${messagePayload.targetUserId} not found in 'users' hash or missing externalId for Pusher notification.`);
            }
        } else {
             console.warn("[API Message WRITE] beamsClient not initialized, notification skipped.");
        }
        // --- End Pusher Notification ---

        // Send the stored message back to the client as confirmation
        response.status(200).json(messageToStore);

    } catch (error) {
        console.error("[API Message WRITE] CRITICAL ERROR:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        response.status(500).json({ error: errorMessage });
    }
};