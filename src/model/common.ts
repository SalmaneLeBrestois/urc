// Ce que l'API /api/login renvoie et ce qui est stocké dans le store
export interface User {
    id: number;
    username: string;
    email?: string; // Email might not always be present (e.g., from /api/users)
    // --- CORRECTION ---
    externalId: string; // Use camelCase to match login API response and Pusher usage
    // --- FIN CORRECTION ---
    created_on?: string; // Optional, might not always be present
    last_login?: string | null; // Optional, might be null or string from /api/users
}

// Session can extend User, adding the token
export interface Session extends User {
    token: string;
    // external_id is no longer needed if User has externalId correctly
}

// Votre classe d'erreur (Correct)
export class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
    }
}

// L'objet Message (Correct)
export interface Message {
    senderId: number | string;
    content: string;
    timestamp: number;
}

// Types de callback (Correct)
export type SessionCallback = (session: Session) => void;
export type ErrorCallback = (error: CustomError) => void;