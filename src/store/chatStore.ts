import { create } from 'zustand';
// Nous aurons besoin de ces types, vous pouvez les créer dans src/model/common.ts
// import { User, Message } from '../model/common';

// Pour l'instant, utilisons 'any' pour la simplicité
type User = any;
type Message = any;

interface ChatState {
  users: User[];
  messages: Message[];
  selectedConversation: string | null; // ex: "user_ID_123" ou "room_ID_456"
  
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
  
  selectConversation: (id) => set({ selectedConversation: id, messages: [] }), // Vide les messages lors du changement
  
  setMessages: (messages) => set({ messages: messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
}));