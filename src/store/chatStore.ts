import { create } from 'zustand';
// 1. Importer les vrais types
import { Message, User } from '../model/common'; 

// 2. SUPPRIMER CETTE LIGNE
// type User = any; 

interface ChatState {
  users: User[]; // <-- 3. Utiliser le vrai type
  messages: Message[];
  selectedConversation: string | null;
  
  setUsers: (users: User[]) => void;
  selectConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // --- STATE ---
  users: [],
  messages: [],
  selectedConversation: null,

  // --- ACTIONS ---
  setUsers: (users) => set({ users: users }),
  
  selectConversation: (id) => set({ 
    selectedConversation: id, 
    messages: [] 
  }),
  
  setMessages: (messages) => set({ messages: messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
}));