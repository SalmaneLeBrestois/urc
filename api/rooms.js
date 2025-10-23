import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session.js"; // Use .js extension

export const config = {
    runtime: 'edge', // Edge is fine for simple reads
};

export default async function handler(request) {
    console.log("[API Rooms] Received request");
    try {
        // Check if user is logged in
        const user = await checkSession(request); // Assuming checkSession returns user or null/false
        if (!user) {
            console.log("[API Rooms] Not connected");
            return unauthorizedResponse();
        }
        console.log("[API Rooms] User authenticated");

        // Fetch room ID and name
        const { rows } = await sql`
            SELECT room_id, name
            FROM rooms
            ORDER BY name ASC
        `;
        console.log(`[API Rooms] Found ${rows.length} rooms`);

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        console.error("[API Rooms] CRITICAL ERROR:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
         });
    }
};