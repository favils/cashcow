import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import Overview from './components/overview/Overview.jsx';
import ATMDataGrid from './components/atms/ATMDataGrid.jsx';
import BranchDataGrid from './components/branches/BranchDataGrid.jsx';
import ServiceCallDataGrid from './components/services/ServiceCallDataGrid.jsx';

export const PAGES = [
    { key: 'atms', label: 'ATMs', icon: <LocalAtmRoundedIcon />, component: ATMDataGrid },
    { key: 'branches', label: 'Branches', icon: <ApartmentRoundedIcon />, component: BranchDataGrid },
    { key: 'services', label: 'Service Calls', icon: <HandymanRoundedIcon />, component: ServiceCallDataGrid },
    { key: 'reporting', label: 'Reporting', icon: <AssessmentRoundedIcon />, component: Overview },
];
