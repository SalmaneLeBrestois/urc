import { db } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
        return response.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    try {
        const client = await db.connect();

        const { rows: existingUsers } = await client.sql`
            SELECT 1 FROM users WHERE username = ${username} OR email = ${email}
        `;

        if (existingUsers.length > 0) {
            await client.end();
            return response.status(409).json({ error: "Ce nom d'utilisateur ou cet email est déjà pris." });
        }

        // --- CORRECTION ---
        // On utilise 'username + password' pour être cohérent avec l'API de login
        const hash = crypto
            .createHash('sha256')
            .update(username + password) // <-- CORRIGÉ
            .digest('base64');
        // --- FIN CORRECTION ---

        const externalId = crypto.randomUUID().toString();

        await client.sql`
            INSERT INTO users (username, email, password, external_id, created_on, last_login)
            VALUES (${username}, ${email}, ${hash}, ${externalId}, NOW(), NOW())
        `;
        
        await client.end();
        return response.status(201).json({ message: "Utilisateur créé avec succès." });

    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        return response.status(500).json({ error: "Erreur serveur." });
    }
}