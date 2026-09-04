import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const EMPTY_FORM = { name: '', location_region: '', capacity: '', supervisor_id: '' };

function BranchDataGrid() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Operations Admin';

    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formValues, setFormValues] = useState(EMPTY_FORM);

    async function fetchBranches() {
        setLoading(true);
        try {
            const response = await apiClient.get('/branch');
            setBranches(response.data);
            setError(null);
        } catch {
            setError('Could not load branch data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const openCreateDialog = () => {
        setEditingId(null);
        setFormValues(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (branch) => {
        setEditingId(branch.id);
        setFormValues({
            name: branch.name,
            location_region: branch.location_region,
            capacity: branch.capacity,
            supervisor_id: branch.supervisor_id,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formValues,
            capacity: Number(formValues.capacity),
            supervisor_id: Number(formValues.supervisor_id),
        };
        try {
            if (editingId) {
                await apiClient.put(`/branch/${editingId}`, payload);
            } else {
                await apiClient.post('/branch', payload);
            }
            setDialogOpen(false);
            await fetchBranches();
        } catch {
            setError('Could not save branch.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/branch/${id}`);
            await fetchBranches();
        } catch {
            setError('Could not delete branch.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 220 },
        { field: 'location_region', headerName: 'Region', width: 140 },
        { field: 'capacity', headerName: 'Capacity', width: 110, type: 'number' },
        { field: 'supervisor_id', headerName: 'Supervisor ID', width: 130, type: 'number' },
        ...(isAdmin
            ? [{
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                width: 100,
                getActions: (params) => [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditRoundedIcon />}
                        label="Edit"
                        onClick={() => openEditDialog(params.row)}
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteRoundedIcon />}
                        label="Delete"
                        onClick={() => handleDelete(params.row.id)}
                    />,
                ],
            }]
            : []),
    ];

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {isAdmin && (
                <Button variant="outlined" sx={{ mb: 2, alignSelf: 'flex-start' }} onClick={openCreateDialog}>
                    Add Branch
                </Button>
            )}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGrid
                    rows={branches}
                    columns={columns}
                    showToolbar
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{editingId ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField label="Name" value={formValues.name} onChange={handleFieldChange('name')} />
                        <TextField label="Region" value={formValues.location_region} onChange={handleFieldChange('location_region')} />
                        <TextField label="Capacity" type="number" value={formValues.capacity} onChange={handleFieldChange('capacity')} />
                        <TextField label="Supervisor ID" type="number" value={formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BranchDataGrid;
