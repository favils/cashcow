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

function CoLocationDiscrepancy() {
    const [discrepancies, setDiscrepancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDiscrepancies() {
            try {
                const response = await apiClient.get('/service/discrepencies');
                setDiscrepancies(response.data);
            } catch {
                setError('Could not load co-location discrepancies.');
            } finally {
                setLoading(false);
            }
        }
        fetchDiscrepancies();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
            <Typography sx={{ mb: 1 }}>
                {discrepancies.length} service call(s) assigned to a technician not co-located with the ATM's branch.
            </Typography>
            {discrepancies.length > 0 && (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Service Call</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">ATM Branch</TableCell>
                                <TableCell align="right">Technician Branch</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {discrepancies.map((row) => (
                                <TableRow key={row.service_id}>
                                    <TableCell>{row.service_id}</TableCell>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell align="right">{row.atm_branch_id}</TableCell>
                                    <TableCell align="right">{row.technician_branch_id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

export default CoLocationDiscrepancy;
