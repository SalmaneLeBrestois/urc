// Ce que l'API /api/login renvoie
export interface Session {
    id: number; // <-- CORRECTION (pour Sidebar et Login)
    username: string;
    email: string;
    external_id: string; // Doit être snake_case
    created_on: string;
    last_login: string;
    token: string;
}

// Le type User (utilisé dans les stores)
export interface User {
    id: number; // <-- CORRECTION (pour Sidebar)
    username: string;
    email: string;
    external_id: string;
    created_on: string;
    last_login: string;
}

// Votre classe d'erreur
export class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
    }
}

// --- CORRECTION (pour loginApi.ts) ---
// Ajout des types de callback manquants
export type SessionCallback = (session: Session) => void;
export type ErrorCallback = (error: CustomError) => void;
// --- FIN DES CORRECTIONS ---