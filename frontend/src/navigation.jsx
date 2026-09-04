import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import Overview from './components/overview/Overview.jsx';
import ATMDataGrid from './components/atms/ATMDataGrid.jsx';
import BranchDataGrid from './components/branches/BranchDataGrid.jsx';
import ServiceCallDataGrid from './components/services/ServiceCallDataGrid.jsx';
import DiagnosticReportDataGrid from './components/diagnosticReports/DiagnosticReportDataGrid.jsx';
import UserDataGrid from './components/users/UserDataGrid.jsx';

// omit `roles` to allow every role; otherwise list the roles allowed to see the page
export const PAGES = [
    { key: 'atms', label: 'ATMs', icon: <LocalAtmRoundedIcon />, component: ATMDataGrid },
    { key: 'branches', label: 'Branches', icon: <ApartmentRoundedIcon />, component: BranchDataGrid },
    { key: 'services', label: 'Service Calls', icon: <HandymanRoundedIcon />, component: ServiceCallDataGrid },
    { key: 'diagnostic-reports', label: 'Diagnostic Reports', icon: <DescriptionRoundedIcon />, component: DiagnosticReportDataGrid },
    { key: 'reporting', label: 'Reporting', icon: <AssessmentRoundedIcon />, component: Overview },
    { key: 'users', label: 'Users', icon: <PeopleRoundedIcon />, component: UserDataGrid, roles: ['Operations Admin'] },
];

export function pagesForRole(role) {
    return PAGES.filter((page) => !page.roles || page.roles.includes(role));
}
