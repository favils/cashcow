import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress } from '@mui/material';
import apiClient from '../../api/client.js';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'serial_number', headerName: 'Serial Number', width: 160 },
    { field: 'model', headerName: 'Model', width: 200 },
    { field: 'cash_level', headerName: 'Cash %', width: 100, type: 'number' },
    { field: 'status', headerName: 'Status', width: 140 },
    { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' },
];

function ATMDataGrid() {
    const [atms, setAtms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAtms() {
            try {
                const response = await apiClient.get('/atm');
                setAtms(response.data);
            } catch {
                setError('Could not load ATM data.');
            } finally {
                setLoading(false);
            }
        }
        fetchAtms();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={atms}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                showToolbar
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
            />
        </Box>
    );
}

export default ATMDataGrid;
