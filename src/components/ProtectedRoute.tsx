import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircularProgress, Box } from '@mui/material'; // Pour un spinner

export const ProtectedRoute = () => {
    // 1. On récupère le token ET l'état d'hydratation
    const token = useAuthStore((state) => state.token);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);

    // 2. Si on n'a pas encore chargé depuis sessionStorage, on attend
    if (!hasHydrated) {
        // Affiche un spinner centré
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // 3. Une fois chargé, on peut prendre la décision
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};