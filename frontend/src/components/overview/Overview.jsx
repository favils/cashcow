import { Box, Typography } from '@mui/material';
import LowCashAlert from '../analytics/LowCashAlert.jsx';
import CoLocationDiscrepancy from '../analytics/CoLocationDiscrepancy.jsx';
import ReliabilityMetrics from '../analytics/ReliabilityMetrics.jsx';
import MaintenanceFlags from '../analytics/MaintenanceFlags.jsx';
import ReportingLines from '../analytics/ReportingLines.jsx';

function Overview() {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Low Cash Alert</Typography>
            <Box sx={{ mb: 4 }}>
                <LowCashAlert />
            </Box>

            <Typography variant="h6" gutterBottom>Co-Location Discrepancy</Typography>
            <Box sx={{ mb: 4 }}>
                <CoLocationDiscrepancy />
            </Box>

            <Typography variant="h6" gutterBottom>Reliability Metrics</Typography>
            <Box sx={{ mb: 4 }}>
                <ReliabilityMetrics />
            </Box>

            <Typography variant="h6" gutterBottom>Maintenance Flags</Typography>
            <Box sx={{ mb: 4 }}>
                <MaintenanceFlags />
            </Box>

            <Typography variant="h6" gutterBottom>Reporting Lines</Typography>
            <Box sx={{ mb: 4 }}>
                <ReportingLines />
            </Box>
        </Box>
    );
}

export default Overview;
