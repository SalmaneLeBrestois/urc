// src/components/Sidebar.tsx
import React, { useEffect } from 'react';
// Import Divider for visual separation
import { Box, Typography, List, ListItemText, ListItemButton, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
// Import Room type from chatStore
import { useChatStore, Room } from '../store/chatStore';
import { getUsers } from '../user/userApi';
import { getRooms } from '../user/roomApi'; // <-- Import the new API function
import { CustomError, User } from '../model/common'; // Import User type

export function Sidebar() {
    const navigate = useNavigate();

    // Get auth state
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);

    // Get chat state and actions
    const users = useChatStore((state) => state.users);
    const setUsers = useChatStore((state) => state.setUsers);
    const rooms = useChatStore((state) => state.rooms); // <-- Get rooms from store
    const setRooms = useChatStore((state) => state.setRooms); // <-- Get action to set rooms
    const selectConversation = useChatStore((state) => state.selectConversation);

    // Effect for fetching users (mostly unchanged)
    useEffect(() => {
        if (token) {
            getUsers(token, setUsers, (error: CustomError) => {
                 console.error("[Sidebar Effect] getUsers Error:", error.message);
                 if (error.message.includes("401")) { useAuthStore.getState().logout(); navigate('/login'); }
            });
        } else {
            setUsers([]); // Clear users if logged out
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate]); // Removed setUsers from dependency (it's stable)

    // --- Effect for fetching rooms ---
    useEffect(() => {
        if (token) {
            console.log("[Sidebar Effect] Fetching rooms...");
            getRooms(token, setRooms, (error: CustomError) => {
                console.error("[Sidebar Effect] getRooms Error:", error.message);
                // Optionally handle 401 error here too if needed
            });
        } else {
            console.log("[Sidebar Effect] No token, clearing rooms.");
            setRooms([]); // Clear rooms if logged out
        }
    }, [token, setRooms]); // Depends on token and the stable setRooms function
    // --- End fetch rooms effect ---

    // --- Unified Click Handler for users and rooms ---
    const handleSelect = (type: 'user' | 'room', id: number) => {
        const conversationId = `${type}_${id}`; // Create ID like "user_1" or "room_1"
        console.log(`[Sidebar handleSelect] Selecting: ${conversationId}`);
        selectConversation(conversationId); // Update the store
        navigate(`/messages/${type}/${id}`); // Navigate to the correct URL
    };
    // --- End Unified Handler ---

    // Date formatting function (unchanged)
    const formatLastLogin = (dateString: string | null | undefined): string => {
        if (!dateString) return "Jamais connecté";
        try { const date = new Date(dateString); if (isNaN(date.getTime())) return "Date invalide"; return `Vu le ${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`; } catch (e) { return "Erreur date"; }
    };

    // Show loading spinner if user data isn't ready
    if (!currentUser) {
         console.log("[Sidebar Render] Waiting for currentUser...");
         return <CircularProgress />;
    }

    // Filter out the current user AFTER checking currentUser exists
    const filteredUsers = users.filter(user => user && typeof user.id === 'number' && user.id !== currentUser.id);

    return (
        <Box
            sx={{
                width: 280,
                height: '100%',
                bgcolor: '#f5f5f5',
                borderRight: '1px solid #e0e0e0',
                display: 'flex', // Use flexbox for layout
                flexDirection: 'column', // Stack title and list vertically
            }}
        >
            <Typography variant="h6" sx={{ p: 2, flexShrink: 0 }}> {/* Prevent title from shrinking */}
                Discussions
            </Typography>
            {/* Make the List scrollable */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List disablePadding> {/* disablePadding recommended for scrollable lists */}
                    {/* --- Display Users --- */}
                    {filteredUsers.map((user: User) => (
                        <ListItemButton key={`user-${user.id}`} onClick={() => handleSelect('user', user.id)}>
                            <ListItemText
                                primary={user.username}
                                secondary={formatLastLogin(user.last_login)}
                            />
                        </ListItemButton>
                    ))}

                    {/* --- Separator and Rooms --- */}
                    <Divider sx={{ my: 1 }} /> {/* Visual separator */}
                    <Typography variant="overline" sx={{ px: 2, display: 'block', color: 'text.secondary' }}>
                        Salons
                    </Typography>
                    {rooms.map((room: Room) => ( // Iterate over rooms from store
                        <ListItemButton key={`room-${room.room_id}`} onClick={() => handleSelect('room', room.room_id)}>
                            <ListItemText primary={room.name} />
                        </ListItemButton>
                    ))}
                    {/* --- End Rooms --- */}
                </List>
            </Box>
        </Box>
    );
}