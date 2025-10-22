import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { Redis } from '@upstash/redis';
// const PushNotifications = require("@pusher/push-notifications-server");

// 1. Initialize Redis
const redis = Redis.fromEnv();

// Helper function to create a sorted conversation key
function getConversationKey(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return; // Important: stop execution
        }

        const message = await request.body;

        // --- CORRECTION: TODO Completed ---
        
        // 2. Validate message payload (basic)
        if (!message.targetUserId || !message.content) {
            return response.status(400).json({ error: 'Missing targetUserId or content' });
        }

        // 3. Create the message object to be stored
        const messageToStore = {
            senderId: user.id, // ID of the user sending the message
            content: message.content,
            timestamp: Date.now(),
        };

        // 4. Generate the conversation key
        const conversationKey = getConversationKey(user.id, message.targetUserId);

        // 5. Push the message to the Redis list
        await redis.lpush(conversationKey, JSON.stringify(messageToStore));
        
        // 6. Set the conversation to expire in 24 hours (86400 seconds)
        // This ensures the cache doesn't grow indefinitely
        await redis.expire(conversationKey, 86400);

        // TODO: Add Pusher notification logic here (next step in TP)

        // --- FIN CORRECTION ---

        response.status(200).send("OK");
    } catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
};