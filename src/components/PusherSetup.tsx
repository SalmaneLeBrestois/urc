// src/components/PusherSetup.tsx
import { useEffect, useRef } from 'react'; // useRef needed
import { useAuthStore } from '../store/authStore';
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { useChatStore } from '../store/chatStore';
import { Message } from '../model/common';

const PUSHER_INSTANCE_ID = '0303f08d-5569-4fbf-9f34-83c94d06a03d'; // Your ID

export const PusherSetup = () => {
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);
    const addMessage = useChatStore((state) => state.addMessage);

    const listenerAttachedRef = useRef(false); // Ref to track listener status

    // --- EFFET 1: Initialisation de Pusher Beams (No changes needed here) ---
    useEffect(() => {
        // ... (Your existing Pusher initialization code) ...
         if (!token || !currentUser || !currentUser.externalId /* ... */) return;
         let beamsClient: PusherPushNotifications.Client | null = null;
         Notification.requestPermission().then((permission) => {
             if (permission !== 'granted') return;
             console.log("PusherSetup [Beams Init]: Initializing...");
             beamsClient = new PusherPushNotifications.Client({ instanceId: PUSHER_INSTANCE_ID });
             const beamsTokenProvider = new PusherPushNotifications.TokenProvider({ url: "/api/beams", headers: { Authorization: "Bearer " + token }});
             const currentBeamsClient = beamsClient; // Capture reference
             const userExternalId = currentUser.externalId; // Capture value
             currentBeamsClient.start()
                 .then(() => currentBeamsClient.setUserId(userExternalId, beamsTokenProvider))
                 .then(() => console.log("PusherSetup [Beams Init]: User ID set:", userExternalId))
                 .catch(e => console.error("PusherSetup [Beams Init]: Failed:", e));
         });
         return () => { if (beamsClient) { beamsClient.stop().catch(console.error); }};
    }, [token, currentUser]);


    // --- EFFET 2: Gestion de l'écouteur du Service Worker ---
    useEffect(() => {
        console.log("PusherSetup [SW Listener Effect]: Running check.");
        const sw = navigator.serviceWorker;

        if (!sw || !sw.controller || listenerAttachedRef.current) {
            console.log(`PusherSetup [SW Listener Effect]: Skipping setup (SW Ready: ${!!sw?.controller}, Listener Attached: ${listenerAttachedRef.current})`);
            return;
        }

        const handleSWMessage = (event: MessageEvent) => {
            console.log("[PusherSetup SW Listener]: Message received from SW:", event.data); // LOG 1
            const messageData = event.data as Message;

            if (messageData && typeof messageData.senderId !== 'undefined' && messageData.content && typeof messageData.timestamp === 'number') {
                const conversationIdFromMessage = `user_${messageData.senderId}`;
                const currentSelectedConversation = useChatStore.getState().selectedConversation;

                console.log(`[PusherSetup SW Listener]: Comparing SW key ${conversationIdFromMessage} vs current ${currentSelectedConversation}`); // LOG 2
                if (currentSelectedConversation === conversationIdFromMessage) {
                    // --- ROBUST DUPLICATE CHECK ---
                    const existingMessages = useChatStore.getState().messages;
                    const alreadyExists = existingMessages.some(msg =>
                        msg.senderId === messageData.senderId &&
                        msg.timestamp === messageData.timestamp && // Check timestamp strictly
                        msg.content === messageData.content     // Check content strictly
                    );
                    // --- END DUPLICATE CHECK ---

                    if (!alreadyExists) {
                        console.log("[PusherSetup SW Listener]: Match & Not Duplicate! Calling addMessage."); // LOG 3
                        addMessage(messageData);
                    } else {
                         console.log("[PusherSetup SW Listener]: Match! But message already exists in store (duplicate check passed). Skipping addMessage."); // LOG 4
                    }
                } else {
                    console.log("[PusherSetup SW Listener]: No match. Not updating UI live."); // LOG 5
                }
            } else {
                console.warn("[PusherSetup SW Listener]: Invalid data format", event.data); // LOG 6
            }
        };

        console.log("PusherSetup [SW Listener Effect]: Attaching listener.");
        sw.addEventListener('message', handleSWMessage);
        listenerAttachedRef.current = true; // Mark as attached

        // Cleanup
        return () => {
            console.log("PusherSetup [SW Listener Cleanup]: Removing listener.");
            sw.removeEventListener('message', handleSWMessage);
            listenerAttachedRef.current = false; // Mark as detached
        };

    // Dependencies: addMessage is stable. Run once SW is ready.
    }, [addMessage]);

    return null;
};