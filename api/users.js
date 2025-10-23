import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session.js";

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    console.log("[API Users] Handler started");
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("[API Users] Not connected, returning 401");
            return unauthorizedResponse();
        }
        console.log("[API Users] Session check passed");

        // Select user_id (original name) and other needed fields
        const result = await sql`
            SELECT
                user_id,
                username,
                last_login
            FROM users
            ORDER BY username ASC
        `;
        const rows = result.rows;
        const rowCount = result.rowCount;

        console.log(`[API Users] SQL query returned ${rowCount} rows`);
        console.log("[API Users] Raw rows from DB:", rows);

        if (rowCount === 0) {
            console.log("[API Users] No users found, returning empty array");
            return new Response("[]", {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        } else {
            // --- CORRECTION: Explicitly map to the structure expected by the front-end ---
            const usersForJson = rows.map(user => ({
                id: user.user_id, // Map user_id to id here!
                username: user.username,
                last_login: user.last_login instanceof Date ? user.last_login.toISOString() : null
            }));
            // --- FIN CORRECTION ---

            console.log("[API Users] Sending users:", usersForJson);
            return new Response(JSON.stringify(usersForJson), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }
    } catch (error) {
        console.error("[API Users] Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
};