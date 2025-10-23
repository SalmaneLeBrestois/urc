// src/store/chatStore.ts
import { create } from 'zustand';
import { Message, User } from '../model/common';

// --- Add Room Type ---
export interface Room {
    room_id: number; // Matches the database column name
    name: string;
}
// --- End Add ---

interface ChatState {
  users: User[];
  rooms: Room[]; // <-- Add rooms array state
  messages: Message[];
  selectedConversation: string | null; // e.g., "user_1" or "room_1"

  setUsers: (users: User[]) => void;
  setRooms: (rooms: Room[]) => void; // <-- Add setter action for rooms
  selectConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // --- STATE ---
  users: [],
  rooms: [], // <-- Initialize rooms state
  messages: [],
  selectedConversation: null,

  // --- ACTIONS ---
  setUsers: (users) => set({ users: users }),
  setRooms: (rooms) => set({ rooms: rooms }), // <-- Implement rooms action
  selectConversation: (id) => set({
    selectedConversation: id,
    messages: [] // Clear messages when conversation changes
  }),
  setMessages: (messages) => set({ messages: messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message] // Append new message
  })),
}));