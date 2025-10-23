import { getConnecterUser, unauthorizedResponse } from "../lib/session";
import { Redis } from '@upstash/redis';

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

// --- CORRECTION: Types retirés ---
function getConversationKey(userId1, userId2) {
    const ids = [String(userId1), String(userId2)].sort();
    return `chat:${ids[0]}:${ids[1]}`;
}

// --- CORRECTION: Type 'Request' retiré ---
export default async function handler(request) {
// --- FIN CORRECTION ---
    try {
        const user = await getConnecterUser(request);
        if (!user) {
            return unauthorizedResponse();
        }

        const url = new URL(request.url);
        const targetUserId = url.searchParams.get('targetUserId');

        if (!targetUserId) {
            return new Response(JSON.stringify({ error: "Missing targetUserId" }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        const conversationKey = getConversationKey(user.id, targetUserId);

        const messagesStrings = await redis.lrange(conversationKey, 0, -1);
        const messages = messagesStrings.map(msg => JSON.parse(msg));

        return new Response(JSON.stringify(messages), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error("Erreur dans api/messages.js:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
};