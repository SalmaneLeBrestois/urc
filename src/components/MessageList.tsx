import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { sendMessage, getMessages } from '../user/messageApi'; 
import { CustomError, Message } from '../model/common'; // <-- Importer Message

export function MessageList() {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // --- LE FIX (PARTIE 1) ---
    // On sélectionne chaque "slice" (partie) du store SÉPARÉMENT.
    // C'est la correction la plus importante pour éviter la boucle.
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);

    const selectedConversation = useChatStore((state) => state.selectedConversation);
    const messages = useChatStore((state) => state.messages);
    const setMessages = useChatStore((state) => state.setMessages);
    const addMessage = useChatStore((state) => state.addMessage);
    // --- FIN DU FIX ---

    // 💡 Effet pour CHARGER les messages quand la conversation change
    useEffect(() => {
        if (selectedConversation && token) {
            const targetUserId = selectedConversation.split('_')[1];
            
            getMessages(
                token,
                targetUserId,
                (fetchedMessages) => {
                    // Les messages de Redis sont LPUSH (récents en premier)
                    // On les inverse pour les afficher (anciens en premier)
                    setMessages(fetchedMessages.reverse());
                },
                (error) => console.error("Erreur de chargement:", error.message)
            );
        } else {
             setMessages([]); // Vider si pas de sélection
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConversation, token]); // On ignore l'avertissement pour 'setMessages'

    // 💡 Effet pour l'auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 💡 Fonction pour ENVOYER un message
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConversation || !token || !currentUser) return;

        const targetUserId = selectedConversation.split('_')[1];

        // Mise à jour "Optimiste"
        const optimisticMessage: Message = {
            senderId: currentUser.id,
            content: content,
            timestamp: Date.now()
        };
        addMessage(optimisticMessage);
        setNewMessage(""); // Vider le champ

        // Appel API en arrière-plan
        sendMessage(
            token,
            { targetUserId: targetUserId, content: content },
            () => {
                console.log("Message confirmé par le serveur");
            },
            (error: CustomError) => {
                console.error("Erreur d'envoi:", error.message);
                // (Ici, on pourrait retirer le message optimiste)
            }
        );
    };

    return (
        <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
                <Typography variant="h6">
                    {selectedConversation ? `Chat avec ${selectedConversation}` : "Sélectionnez une conversation"}
                </Typography>
            </Box>

            {/* Zone des messages (dynamique) */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#fafafa' }}>
                {messages.map((msg: Message, index: number) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                        <Box key={index} sx={{ 
                            mb: 1, 
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start'
                        }}>
                            <Box sx={{ 
                                p: 1, 
                                bgcolor: isMe ? '#e1f5fe' : '#fff',
                                borderRadius: 2,
                                maxWidth: '70%',
                                boxShadow: 1,
                            }}>
                                {msg.content}
                            </Box>
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            {/* Champ de saisie */}
            <Box 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white', display: 'flex' }}
            >
                <TextField 
                    fullWidth 
                    placeholder="Écrire un message..." 
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!selectedConversation}
                />
                <IconButton color="primary" type="submit" disabled={!selectedConversation || !newMessage.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}