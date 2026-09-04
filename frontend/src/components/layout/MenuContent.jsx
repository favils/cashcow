import { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';

const navItems = [
    { text: 'Overview', icon: <DashboardRoundedIcon /> },
    { text: 'Branches', icon: <ApartmentRoundedIcon /> },
    { text: 'ATMs', icon: <LocalAtmRoundedIcon /> },
    { text: 'Service Calls', icon: <HandymanRoundedIcon /> },
    { text: 'Diagnostic Reports', icon: <DescriptionRoundedIcon /> },
    { text: 'Technicians', icon: <EngineeringRoundedIcon /> },
];

export default function MenuContent() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <Stack sx={{ flexGrow: 1, p: 1 }}>
            <List dense>
                {navItems.map((item, index) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            selected={index === selectedIndex}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}
