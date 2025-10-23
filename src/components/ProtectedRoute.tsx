// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // Your auth store
import { CircularProgress, Box } from '@mui/material'; // For loading spinner

export const ProtectedRoute = () => {
    // Get token and hydration status from the store
    const token = useAuthStore((state) => state.token);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);

    // If the store hasn't loaded from sessionStorage yet, show loading
    if (!hasHydrated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Once loaded, check for token:
    // If token exists, render the child route (<Outlet /> represents ChatPage, etc.)
    // If no token, redirect to the login page
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};