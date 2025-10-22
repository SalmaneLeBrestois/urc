import React from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// 1. Assurez-vous que le mot-clé "export" est bien là
export function MessageList() {
    // Plus tard, nous récupérerons les messages depuis le 'useChatStore'
    const messages = [
        { id: 1, sender: 'Autre', content: 'Salut !' },
        { id: 2, sender: 'Moi', content: 'Coucou !' },
    ];

    return (
        <Box 
            sx={{ 
                flex: 1, // Prend toute la place restante
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* 1. Header (conversation sélectionnée) */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
                <Typography variant="h6">Nom de l'utilisateur</Typography>
            </Box>

            {/* 2. Zone des messages */}
            <Box 
                sx={{ 
                    flex: 1, 
                    p: 2, 
                    overflowY: 'auto', // Scroll
                    bgcolor: '#fafafa'
                }}
            >
                {messages.map((msg) => (
                    <Box key={msg.id} sx={{ 
                        mb: 1, 
                        textAlign: msg.sender === 'Moi' ? 'right' : 'left' 
                    }}>
                        <Typography variant="caption">{msg.sender}</Typography>
                        <Box sx={{ 
                            p: 1, 
                            bgcolor: msg.sender === 'Moi' ? '#e1f5fe' : '#fff',
                            borderRadius: 2,
                            display: 'inline-block'
                        }}>
                            {msg.content}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* 3. Champ de saisie */}
            <Box 
                component="form" 
                sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e0e0e0', 
                    bgcolor: 'white',
                    display: 'flex'
                }}
            >
                <TextField fullWidth placeholder="Écrire un message..." size="small" />
                <IconButton color="primary" type="submit">
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}