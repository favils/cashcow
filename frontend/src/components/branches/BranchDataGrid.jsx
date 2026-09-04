import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress } from '@mui/material';
import apiClient from '../../api/client.js';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 220 },
    { field: 'location_region', headerName: 'Region', width: 140 },
    { field: 'capacity', headerName: 'Capacity', width: 110, type: 'number' },
    { field: 'supervisor_id', headerName: 'Supervisor ID', width: 130, type: 'number' },
];

function BranchDataGrid() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBranches() {
            try {
                const response = await apiClient.get('/branch');
                setBranches(response.data);
            } catch {
                setError('Could not load branch data.');
            } finally {
                setLoading(false);
            }
        }
        fetchBranches();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={branches}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                showToolbar
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
            />
        </Box>
    );
}

export default BranchDataGrid;
