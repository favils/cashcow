import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';

const focusedFieldSx = {
    '& .Mui-focused fieldset': { borderColor: 'black' },
};

function LoginForm() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        try {
            await login(username, password);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Incorrect username or password');
            } else {
                setError('Something went wrong logging in, please try again shortly');
            }
        }
    };

    return (
        <>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Box component="img" src="/logo.png" sx ={{ width: '30vw', mr: 5 }}/>
            <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: 4, width: 320 }}>
                <Typography variant="h6" gutterBottom>
                    Login
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    sx={focusedFieldSx}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    sx={focusedFieldSx}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, background: 'black'}}>
                    Log In
                </Button>
            </Paper>
        </Box>
        </>
        
    );
}

export default LoginForm;
