import { Box, Container, Typography } from '@mui/material';
import SideMenu from './components/layout/SideMenu.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function Dashboard() {
    return (
        <Box sx={{ display: 'flex' }}>
            <SideMenu />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Fleet Overview
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

// renders either the Dashboard or the login form based on auth status
function AppContent() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
