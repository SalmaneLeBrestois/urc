import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';


function ChatPage() {
    // 3. Récupérer l'action logout et le hook navigate
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();      // 4. Vider le store (et le sessionStorage)
        navigate('/login'); // 5. Rediriger vers le login
    };

    return (
        <div>
            <h1>UBO Relay Chat</h1>
            <p>La messagerie s'affichera ici.</p>
            
            <Button 
                variant="contained" 
                color="error" 
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
            >
                Déconnexion
            </Button>
        </div>
    );
}

export default ChatPage;