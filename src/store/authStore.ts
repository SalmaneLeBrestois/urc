import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Assurez-vous d'importer vos types
import { Session, User } from '../model/common'; 

// 1. Définir l'interface du State
interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean; // <-- NOUVEL ÉTAT
  setAuth: (newToken: string, newUser: Session | User) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void; // <-- NOUVELLE ACTION
}

export const useAuthStore = create(
  persist<AuthState>( // 2. Appliquer l'interface
    (set) => ({
      // --- STATE ---
      token: null,
      user: null,
      _hasHydrated: false, // <-- Valeur par défaut

      // --- ACTIONS ---
      setAuth: (newToken, newUser) => set({
        token: newToken,
        user: newUser as User // Adapter si 'Session' et 'User' sont différents
      }),
      logout: () => set({ 
        token: null, 
        user: null 
      }),
      setHasHydrated: (value) => set({
        _hasHydrated: value
      }),
    }),
    {
      // --- CONFIGURATION ---
      name: 'auth-storage', 
      storage: createJSONStorage(() => sessionStorage), 
      
      // 3. Quand la réhydratation est finie, on met à jour l'état
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      }
    }
  )
);