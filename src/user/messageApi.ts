import { CustomError, Message } from "../model/common"; // <-- Importer Message

interface MessageData {
    targetUserId: string | number;
    content: string;
}

export async function sendMessage(
    token: string, 
    data: MessageData,
    onSuccess: () => void, // <-- Modifié : ne renvoie rien
    onError: (error: CustomError) => void
) {
    try {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new CustomError(errorData.error || `Erreur ${response.status}`);
        }

        onSuccess(); // <-- Modifié : L'API renvoie "OK"

    } catch (err) {
        const message = (err instanceof Error) ? err.message : "Erreur inconnue.";
        onError(new CustomError(message));
    }
}

// Fonction pour récupérer les messages
export async function getMessages(
    token: string,
    targetUserId: string | number,
    onSuccess: (messages: Message[]) => void, // <-- Utilise le type Message
    onError: (error: CustomError) => void
) {
    try {
        const response = await fetch(`/api/messages?targetUserId=${targetUserId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new CustomError(errorData.error || `Erreur ${response.status}`);
        }

        const messages: Message[] = await response.json(); // <-- Utilise le type Message
        onSuccess(messages);

    } catch (err) {
        const message = (err instanceof Error) ? err.message : "Erreur inconnue.";
        onError(new CustomError(message));
    }
}