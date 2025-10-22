// On importe React (pour corriger 'React' is not defined)
import React, { useState } from "react"; 

// On importe registerUser (pour corriger 'registerUser' is not defined)
import { registerUser } from "../user/registerApi"; 
import { CustomError } from "../model/CustomError";
import { useNavigate, Link as RouterLink } from "react-router-dom";

// Imports MUI
import { Button, TextField, Container, Typography, Box, Alert, Link } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export function RegisterPage() {
    // Syntaxe TypeScript correcte
    const [error, setError] = useState<CustomError | null>(null); 
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); // Reset error
        const data = new FormData(event.currentTarget);
        
        const username = data.get('login') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        // Appel à l'API (on va créer registerApi.ts juste après)
        registerUser({ username, email, password },
            () => {
                // Succès ! On redirige vers le login
                navigate('/login');
            },
            (registerError: CustomError) => {
                // Afficher l'erreur (ex: "utilisateur existe déjà")
                setError(registerError);
            }
        );
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Inscription
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login"
                        label="Nom d'utilisateur"
                        name="login"
                        autoComplete="username"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse Email"
                        name="email"
                        autoComplete="email"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        startIcon={<PersonAddIcon />}
                    >
                        Créer mon compte
                    </Button>

                    {/* On vérifie error (et non error.message) car il peut être null */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error.message}
                        </Alert>
                    )}

                    <Link component={RouterLink} to="/login" variant="body2">
                        {"Déjà un compte ? Connectez-vous"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
}