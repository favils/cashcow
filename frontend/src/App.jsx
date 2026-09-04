import { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import SideMenu from './components/layout/SideMenu.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { pagesForRole } from './navigation.jsx';

function Dashboard() {
    const { user } = useAuth();
    const pages = pagesForRole(user?.role);

    const [selected, setSelected] = useState(pages[0].key);
    const page = pages.find((p) => p.key === selected) ?? pages[0];
    const PageComponent = page.component;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <SideMenu selected={selected} onSelect={setSelected} />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
                <Container
                    maxWidth="lg"
                    sx={{
                        mt: 4,
                        mb: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h5" component="h2" gutterBottom>
                        {page.label}
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <PageComponent />
                    </Box>
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
