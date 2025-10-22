import { CustomError } from "../model/CustomError";
import { User } from "../model/common"; // Assurez-vous d'avoir ce type

export async function getUsers(
    token: string, 
    onSuccess: (users: User[]) => void, 
    onError: (error: CustomError) => void
) {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                // L'étape cruciale : envoyer le token d'authentification
                'Authorization': `Bearer ${token}` 
            }
        });

        // Gérer l'erreur 401
        if (response.status === 401) {
            throw new CustomError("Non autorisé (401). Avez-vous envoyé le token ?");
        }
        if (!response.ok) {
            throw new CustomError(`Erreur lors de la récupération des utilisateurs (${response.status})`);
        }
        
        const users: User[] = await response.json();
        onSuccess(users);
        
    } catch (err) {
        if (err instanceof CustomError) {
            onError(err);
        } else {
            const message = (err instanceof Error) ? err.message : "Erreur inconnue.";
            onError(new CustomError(message));
        }
    }
}