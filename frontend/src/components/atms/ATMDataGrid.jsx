import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_OPTIONS = ['Operational', 'Low Cash', 'MAINTENANCE', 'OFFLINE'];

const STATUS_COLORS = {
    Operational: 'success',
    'Low Cash': 'warning',
    MAINTENANCE: 'warning',
    OFFLINE: 'default',
};

const EMPTY_FORM = { serial_number: '', model: '', cash_level: '', branch_id: '', status: 'Operational' };

function ATMDataGrid() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Operations Admin';

    const [atms, setAtms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formValues, setFormValues] = useState(EMPTY_FORM);

    async function fetchAtms() {
        setLoading(true);
        try {
            const response = await apiClient.get('/atm');
            setAtms(response.data);
            setError(null);
        } catch {
            setError('Could not load ATM data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAtms();
    }, []);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const openCreateDialog = () => {
        setEditingId(null);
        setFormValues(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (atm) => {
        setEditingId(atm.id);
        setFormValues({
            serial_number: atm.serial_number,
            model: atm.model,
            cash_level: atm.cash_level,
            branch_id: atm.branch_id,
            status: atm.status,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formValues,
            cash_level: Number(formValues.cash_level),
            branch_id: Number(formValues.branch_id),
        };
        try {
            if (editingId) {
                await apiClient.put(`/atm/${editingId}`, payload);
            } else {
                await apiClient.post('/atm', payload);
            }
            setDialogOpen(false);
            await fetchAtms();
        } catch {
            setError('Could not save ATM.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/atm/${id}`);
            await fetchAtms();
        } catch {
            setError('Could not delete ATM.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'serial_number', headerName: 'Serial Number', width: 160 },
        { field: 'model', headerName: 'Model', width: 200 },
        { field: 'cash_level', headerName: 'Cash %', width: 100, type: 'number' },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (params) => (
                <Chip label={params.value} color={STATUS_COLORS[params.value] ?? 'default'} size="small" />
            ),
        },
        { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' },
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
                    Add ATM
                </Button>
            )}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGrid
                    rows={atms}
                    columns={columns}
                    showToolbar
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{editingId ? 'Edit ATM' : 'Add ATM'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField label="Serial Number" value={formValues.serial_number} onChange={handleFieldChange('serial_number')} />
                        <TextField label="Model" value={formValues.model} onChange={handleFieldChange('model')} />
                        <TextField label="Cash Level" type="number" value={formValues.cash_level} onChange={handleFieldChange('cash_level')} />
                        <TextField label="Branch ID" type="number" value={formValues.branch_id} onChange={handleFieldChange('branch_id')} />
                        <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
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

export default ATMDataGrid;
