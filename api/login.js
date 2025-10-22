import { db } from '@vercel/postgres';
// 1. IMPORTER LE BON CLIENT REDIS
import { kv } from '@vercel/kv'; 
import {arrayBufferToBase64, stringToArrayBuffer} from "../lib/base64";

export const config = {
    runtime: 'edge',
};

// 2. Plus besoin d'initialiser 'redis', 'kv' l'est déjà
// const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const {username, password} = await request.json();
        
        // Hash correct: 'username + password'
        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();
        // On sélectionne 'user_id as id' pour le front-end
        const {rowCount, rows} = await client.sql`select *, user_id as id from users where username = ${username} and password = ${hashed64}`;
        
        if (rowCount !== 1) {
            const error = {code: "UNAUTHORIZED", message: "Identifiant ou mot de passe incorrect"};
            return new Response(JSON.stringify(error), {
                status: 401,
                headers: {'content-type': 'application/json'},
            });
        } else {
            const token = crypto.randomUUID().toString();
            const userRow = rows[0];

            // L'objet user (camelCase) attendu par le front-end et la session
            const user = {
                id: userRow.id, 
                username: userRow.username, 
                email: userRow.email, 
                externalId: userRow.external_id 
            }
            
            await client.sql`update users set last_login = now() where user_id = ${user.id}`;
            
            // 3. UTILISER LE BON CLIENT 'kv'
            await kv.set(token, user, { ex: 3600 });
            
            const userInfo = {};
            userInfo[user.id] = user;
            
            // 4. UTILISER LE BON CLIENT 'kv'
            await kv.hset("users", userInfo);

            // La réponse (camelCase) attendue par le front-end
            return new Response(JSON.stringify({
                token: token, 
                username: user.username, 
                externalId: user.externalId, 
                id: user.id
            }), {
                status: 200,
                headers: {'content-type': 'application/json'},
            });
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: {'content-type': 'application/json'},
        });
    }
}