import { useEffect, useState } from 'react';
import {
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import apiClient from '../../api/client.js';

const LOW_CASH_THRESHOLD = 20;

function LowCashAlert() {
    const [atms, setAtms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAtms() {
            try {
                const response = await apiClient.get('/atm', {
                    params: { max_cash: LOW_CASH_THRESHOLD },
                });
                setAtms(response.data);
            } catch {
                setError('Could not load low cash ATMs.');
            } finally {
                setLoading(false);
            }
        }
        fetchAtms();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (atms.length === 0) {
        return <Typography>No active ATMs are currently below {LOW_CASH_THRESHOLD}% cash reserve.</Typography>;
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Serial Number</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell align="right">Cash Level</TableCell>
                        <TableCell align="right">Branch ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {atms.map((atm) => (
                        <TableRow key={atm.id}>
                            <TableCell>{atm.serial_number}</TableCell>
                            <TableCell>{atm.model}</TableCell>
                            <TableCell align="right">{atm.cash_level}%</TableCell>
                            <TableCell align="right">{atm.branch_id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default LowCashAlert;
