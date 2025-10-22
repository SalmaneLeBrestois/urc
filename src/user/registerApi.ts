// Contenu de src/user/registerApi.ts
import { CustomError } from "../model/CustomError";

// L'interface pour les données d'inscription
interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export async function registerUser(
    data: RegisterData, 
    onSuccess: () => void, 
    onError: (error: CustomError) => void
) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new CustomError(errorData.error || `Erreur ${response.status}`);
        }

        onSuccess();

    } catch (err) {
        if (err instanceof CustomError) {
            onError(err);
        } else {
            // Assurons-nous que err a une propriété 'message'
            const message = (err instanceof Error) ? err.message : "Une erreur inconnue est survenue.";
            onError(new CustomError(message));
        }
    }
}