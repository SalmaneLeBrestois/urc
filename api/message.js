import { getConnecterUser, triggerNotConnected } from "../lib/session.js";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function getConversationKey(userId1, userId2) {
    const ids = [String(userId1), String(userId2)].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

export default async (request, response) => {
    console.log("[API Message WRITE] Received request"); // LOG 1
    if (request.method !== 'POST') {
        console.log("[API Message WRITE] Invalid method:", request.method); // LOG 2
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        console.log("[API Message WRITE] Authenticating user..."); // LOG 3
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("[API Message WRITE] Authentication failed (user null or undefined)"); // LOG 4
            triggerNotConnected(response);
            return;
        }
        console.log("[API Message WRITE] Authenticated user:", user.username, "(ID:", user.id, ")"); // LOG 5

        console.log("[API Message WRITE] Parsing body..."); // LOG 6
        let messagePayload = request.body;
        // Robust body parsing (adjust if needed)
         if (typeof request.body === 'string') {
            try { messagePayload = JSON.parse(request.body); } catch (e) { console.error("[API Message WRITE] Invalid JSON body string:", e); return response.status(400).json({ error: 'Invalid JSON body' }); }
        } else if (typeof request.body === 'object' && request.body !== null) {
            messagePayload = request.body;
        } else { console.error("[API Message WRITE] Invalid or missing body type:", typeof request.body); return response.status(400).json({ error: 'Invalid or missing request body' });}
        console.log("[API Message WRITE] Body parsed:", messagePayload); // LOG 7

        if (!messagePayload.targetUserId || !messagePayload.content) {
            console.error("[API Message WRITE] Validation failed: Missing targetUserId or content", messagePayload); // LOG 8
            return response.status(400).json({ error: 'Missing targetUserId or content' });
        }

        const messageToStore = {
            senderId: user.id,
            content: messagePayload.content,
            timestamp: Date.now(),
        };
        const conversationKey = getConversationKey(user.id, messagePayload.targetUserId);
        console.log(`[API Message WRITE] Target key: ${conversationKey}`); // LOG 9
        console.log(`[API Message WRITE] Message to store:`, messageToStore); // LOG 10

        console.log(`[API Message WRITE] Calling redis.lpush...`); // LOG 11
        await redis.lpush(conversationKey, JSON.stringify(messageToStore));
        console.log(`[API Message WRITE] redis.lpush finished.`); // LOG 12
        console.log(`[API Message WRITE] Calling redis.expire...`); // LOG 13
        await redis.expire(conversationKey, 86400);
        console.log(`[API Message WRITE] redis.expire finished.`); // LOG 14

        response.status(200).json(messageToStore);

    } catch (error) {
        console.error("[API Message WRITE] CRITICAL ERROR:", error); // LOG 15
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        response.status(500).json({ error: errorMessage });
    }
};