import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { pagesForRole } from '../../navigation.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MenuContent({ selected, onSelect }) {
    const { user } = useAuth();
    const pages = pagesForRole(user?.role);

    return (
        <Stack sx={{ flexGrow: 1, p: 1 }}>
            <List dense>
                {pages.map((page) => (
                    <ListItem key={page.key} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            selected={page.key === selected}
                            onClick={() => onSelect(page.key)}
                        >
                            <ListItemIcon>{page.icon}</ListItemIcon>
                            <ListItemText primary={page.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}
