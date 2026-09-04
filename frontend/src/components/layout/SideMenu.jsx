import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import { useAuth } from '../../context/AuthContext.jsx';

// inspired by template in material ui docs
// live preview of template here: https://mui.com/material-ui/getting-started/templates/dashboard/?_gl=1*epl76g*_up*MQ..*_ga*MjI3ODIyNjMyLjE3ODg0ODQ3Njk.*_ga_5NXDQLC2ZK*czE3ODg0ODQ3NjgkbzEkZzAkdDE3ODg0ODUyMTAkajUwJGwwJGgw
// code here: https://github.com/mui/material-ui/tree/v9.4.0/docs/data/material/getting-started/templates/dashboard

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
    },
});

export default function SideMenu() {
    const { user, logout } = useAuth();

    return (
        <Drawer variant="permanent">
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Box component="img" src="/logo.png" alt="Cash Cow" sx={{ height: 32 }} />
            </Stack>
            <Divider />
            <MenuContent />
            <Stack
                direction="row"
                sx={{
                    p: 2,
                    gap: 1,
                    alignItems: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Avatar sx={{ width: 36, height: 36 }}>
                    {user?.sub?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ mr: 'auto' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
                        {user?.sub}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {user?.role}
                    </Typography>
                </Box>
                <IconButton aria-label="Logout" onClick={logout}>
                    <LogoutRoundedIcon />
                </IconButton>
            </Stack>
        </Drawer>
    );
}
