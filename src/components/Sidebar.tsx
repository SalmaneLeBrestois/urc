import React, { useEffect } from 'react';
import { Box, Typography, List, ListItemText, ListItemButton, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getUsers } from '../user/userApi'; // Assuming this API call is correct
import { CustomError } from '../model/CustomError';

export function Sidebar() {
    const navigate = useNavigate();
    
    // --- CORRECTION 1 ---
    // We MUST select primitive values (token, user) separately.
    // Selecting an object like ({ token, user }) causes re-renders on *every* store change.
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);

    // --- CORRECTION 2 ---
    // Same fix for the chat store. Select each function/value separately.
    const users = useChatStore((state) => state.users);
    const setUsers = useChatStore((state) => state.setUsers);
    const selectConversation = useChatStore((state) => state.selectConversation);

    useEffect(() => {
        if (token) {
            getUsers(
                token, 
                (fetchedUsers) => {
                    setUsers(fetchedUsers); // This is now safe
                },
                (error: CustomError) => {
                    console.error(error.message);
                    if (error.message.includes("401")) {
                        useAuthStore.getState().logout(); 
                        navigate('/login');
                    }
                }
            );
        }
    // These dependencies are now stable and will not cause a loop
    }, [token, setUsers, navigate]); 

    const handleUserSelect = (userId: number) => { 
    // --- FIN CORRECTION ---
        // Stocker dans le store
        selectConversation(`user_${userId}`); 
        // Modifier l'URL
        navigate(`/messages/user/${userId}`);
    };

const formatLastLogin = (dateString: string | null | undefined): string => {    if (!dateString) return "Jamais connecté"; // Gère null ou ""
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { // Vérifie validité
             return "Date invalide";
        }
        return `Vu le ${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
    } catch (e) {
        return "Erreur date";
    }
    };

    if (!currentUser) return <CircularProgress />; 

    return (
        <Box 
            sx={{
                width: 280,
                height: '100%',
                bgcolor: '#f5f5f5',
                borderRight: '1px solid #e0e0e0'
            }}
        >
            <Typography variant="h6" sx={{ p: 2 }}>
                Discussions
            </Typography>
            <List>
                {users
                    .filter(user => user.id !== currentUser.id) 
                    .map((user) => (
                        <ListItemButton key={user.id} onClick={() => handleUserSelect(user.id)}>
                            <ListItemText 
                                primary={user.username} 
                                secondary={formatLastLogin(user.last_login)} 
                            />
                        </ListItemButton>
                    ))
                }
            </List>
        </Box>
    );
}