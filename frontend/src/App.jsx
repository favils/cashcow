import { Container, Typography } from '@mui/material';
import AppHeader from './components/layout/AppHeader.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <>
            <AppHeader username={user?.sub} role={user?.role} onLogout={logout} />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Fleet Overview
                </Typography>
            </Container>
        </>
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
