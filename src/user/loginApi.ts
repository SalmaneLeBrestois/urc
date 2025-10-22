// 1. 'User' n'est plus importé, CustomError vient de common
import {Session, SessionCallback, ErrorCallback, CustomError} from "../model/common";

// 2. CORRECTION de la signature : on ne prend que ce dont on a besoin
export function loginUser(
    authData: { username: string, password: string }, 
    onResult: SessionCallback, 
    onError: ErrorCallback
) {
    (async () => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                // 3. On envoie l'objet authData
                body: JSON.stringify(authData)
            });

            if (response.ok) {
                const session = await response.json() as Session;
                sessionStorage.setItem('token', session.token);
                
                // 4. CORRECTION de la faute de frappe (snake_case)
                sessionStorage.setItem('externalId', session.external_id); 
                
                sessionStorage.setItem('username', session.username || "");
                onResult(session)
            } else {
                const error = await response.json();
                onError(new CustomError(error.error || "Erreur de connexion"));
            }
        } catch (e: any) {
            onError(new CustomError(e.message));
        }
    })();
}