import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore'; // Importer le chatStore

import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Sidebar } from '../components/Sidebar';
import { MessageList } from '../components/MessageList';

function ChatPage() {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();

    // --- VÉRIFICATION ---
    // Make sure this line only selects the *one* function you need.
    const selectConversation = useChatStore((state) => state.selectConversation);

    // This effect is now safe because 'selectConversation' has a stable reference.
    useEffect(() => {
        if (userId) {
            selectConversation(`user_${userId}`);
        }
    }, [userId, selectConversation]); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ... (le reste de votre component return) ...
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        UBO Relay Chat
                    </Typography>
                    <Button 
                        color="inherit" 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Déconnexion
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                <MessageList />
            </Box>
        </Box>
    );
}

export default ChatPage;