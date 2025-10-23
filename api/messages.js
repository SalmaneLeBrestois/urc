import { getConnecterUser, unauthorizedResponse } from "../lib/session.js";
import { Redis } from '@upstash/redis';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

function getConversationKey(userId1, userId2) {
    const ids = [String(userId1), String(userId2)].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

export default async function handler(request) {
    console.log("[API Messages READ] Received request");
    try {
        const user = await getConnecterUser(request);
        if (!user) { return unauthorizedResponse(); }

        const url = new URL(request.url);
        const targetUserId = url.searchParams.get('targetUserId');
        if (!targetUserId) { /* ... handle missing ID ... */ }

        const conversationKey = getConversationKey(user.id, targetUserId);
        console.log(`[API Messages READ] Target key: ${conversationKey}`);

        console.log(`[API Messages READ] Calling redis.lrange...`);

        // --- CORRECTION: Retirer le type ': any[]' ---
        const messages = await redis.lrange(conversationKey, 0, -1);
        // --- FIN CORRECTION ---
        console.log(`[API Messages READ] redis.lrange returned ${messages.length} items.`);

        // Le client @upstash/redis parse déjà, donc 'messages' est un tableau d'objets.
        // Pas besoin de JSON.parse ici.

        console.log(`[API Messages READ] Final messages:`, messages);

        return new Response(JSON.stringify(messages), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error("[API Messages READ] CRITICAL ERROR:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};