import { useState } from "react";
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// 1. Importer les composants MUI
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login'; // Une icône

export function Login() {
    const [error, setError] = useState({} as CustomError);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);

        // --- CORRECTION ICI ---
        // 1. Récupérer les données
        const username = data.get('login') as string;
        const password = data.get('password') as string;

        // 2. Appeler loginUser avec le bon objet
        loginUser({ username, password },
            (result: Session) => {
                console.log(result);
                setAuth(result.token, result);
                form.reset();
                setError(new CustomError("")); // Utilisez null ici
                navigate('/');
            }, 
            (loginError: CustomError) => {
                console.log(loginError);
                setError(loginError);
            }
        );
        // --- FIN DE LA CORRECTION ---
    };

    return (
        // 2. Container MUI pour centrer le contenu
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    UBO Relay Chat - Connexion
                </Typography>
                
                {/* 3. Remplacer <form> par un <Box> qui agit comme un formulaire */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {/* 4. Remplacer <input> par <TextField> */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login"
                        label="Nom d'utilisateur"
                        name="login"
                        autoComplete="username"
                        defaultValue="test"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        defaultValue="testubo"
                    />

                    {/* 5. Remplacer <button> par <Button> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained" // Style "plein"
                        sx={{ mt: 3, mb: 2 }} // Marge au-dessus (top) et en-dessous (bottom)
                        startIcon={<LoginIcon />} // Ajouter l'icône
                    >
                        Se connecter
                    </Button>

                    {/* 6. Afficher l'erreur avec le composant <Alert> */}
                    {error.message && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error.message}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
}