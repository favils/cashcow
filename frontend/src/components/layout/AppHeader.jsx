import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';

function AppHeader({ username, role, onLogout }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <SavingsIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                    Cash Cow ATM Management
                </Typography>
                {username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">{username} ({role})</Typography>
                        <Button color="inherit" onClick={onLogout}>Log Out</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;
