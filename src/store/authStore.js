import { create } from 'zustand';
// On importe le middleware 'persist' pour le sessionStorage
import { persist, createJSONStorage } from 'zustand/middleware';

// Créez votre store
export const useAuthStore = create(
  // persist() enveloppe votre store
  persist(
    (set) => ({
      // --- NOTRE STATE (les données) ---
      token: null,  // Le token de session
      user: null,   // Les infos de l'utilisateur (on en aura besoin plus tard)

      // --- NOS ACTIONS (les fonctions pour modifier le state) ---

      // Action pour sauvegarder le token et l'utilisateur
      setAuth: (newToken, newUser) => set({
        token: newToken,
        user: newUser
      }),

      // Action pour se déconnecter
      logout: () => set({ 
        token: null, 
        user: null 
      }),
    }),
    {
      // --- CONFIGURATION DE LA PERSISTANCE ---
      name: 'auth-storage', // Nom de la clé dans le session storage
      
      // On spécifie explicitement sessionStorage (par défaut, c'est localStorage)
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);