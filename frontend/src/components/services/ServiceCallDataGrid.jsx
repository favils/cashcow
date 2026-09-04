import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress } from '@mui/material';
import apiClient from '../../api/client.js';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', width: 220 },
    { field: 'priority', headerName: 'Priority', width: 110 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'atm_id', headerName: 'ATM ID', width: 100, type: 'number' },
    { field: 'technician_id', headerName: 'Technician ID', width: 130, type: 'number' },
];

function ServiceCallDataGrid() {
    const [serviceCalls, setServiceCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchServiceCalls() {
            try {
                const response = await apiClient.get('/service');
                setServiceCalls(response.data);
            } catch {
                setError('Could not load service call data.');
            } finally {
                setLoading(false);
            }
        }
        fetchServiceCalls();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={serviceCalls}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                showToolbar
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
            />
        </Box>
    );
}

export default ServiceCallDataGrid;
