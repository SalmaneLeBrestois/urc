import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function getConversationKey(userId1, userId2) {
    const ids = [String(userId1), String(userId2)].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

export default async (request, response) => {
    // Check method FIRST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        // --- CORRECTION: Explicitly get the body ---
        // Vercel might provide it directly, or we might need to parse.
        // This handles both cases more robustly.
        let messagePayload;
        if (typeof request.body === 'string') {
            try {
                // If it's a string, try parsing JSON
                messagePayload = JSON.parse(request.body);
            } catch (e) {
                return response.status(400).json({ error: 'Invalid JSON body' });
            }
        } else if (typeof request.body === 'object' && request.body !== null) {
            // If it's already an object, use it directly
            messagePayload = request.body;
        } else {
             return response.status(400).json({ error: 'Invalid or missing request body' });
        }
        // --- FIN CORRECTION ---


        if (!messagePayload.targetUserId || !messagePayload.content) {
            return response.status(400).json({ error: 'Missing targetUserId or content' });
        }

        const messageToStore = {
            senderId: user.id,
            content: messagePayload.content,
            timestamp: Date.now(),
        };

        const conversationKey = getConversationKey(user.id, messagePayload.targetUserId);

        await redis.lpush(conversationKey, JSON.stringify(messageToStore));
        await redis.expire(conversationKey, 86400);

        // (Pusher logic will go here)

        response.status(200).json(messageToStore); // Return the created message

    } catch (error) {
        console.log("Erreur dans api/message.js:", error);
        // Send back a more informative error if possible
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        response.status(500).json({ error: errorMessage });
    }
};