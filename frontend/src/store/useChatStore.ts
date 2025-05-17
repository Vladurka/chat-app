import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { Message, MessageData, User } from "../types";

let messageHandler: ((msg: Message) => void) | null = null;

interface ChatStore {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;

  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessageData) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (selectedUser: User | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set((state) => ({ messages: [...state.messages, res.data] }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    if (messageHandler) {
      socket.off("newMessage", messageHandler);
    }

    messageHandler = (newMessage: Message) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    };

    socket.on("newMessage", messageHandler);
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (messageHandler && socket) {
      socket.off("newMessage", messageHandler);
      messageHandler = null;
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
