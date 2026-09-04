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
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'Critical'];
const STATUS_OPTIONS = ['Pending', 'In-Progress', 'Completed', 'Failed'];

const PRIORITY_COLORS = { Low: 'default', Medium: 'warning', Critical: 'error' };
const STATUS_COLORS = { Pending: 'default', 'In-Progress': 'info', Completed: 'success', Failed: 'error' };

const EMPTY_FORM = { title: '', priority: 'Low', status: 'Pending', atm_id: '', technician_id: '' };

function ServiceCallDataGrid() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Operations Admin';
    const isTechnician = user?.role === 'Field Technician';

    const [serviceCalls, setServiceCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formValues, setFormValues] = useState(EMPTY_FORM);

    const [statusDialogId, setStatusDialogId] = useState(null);
    const [statusValue, setStatusValue] = useState('Pending');

    async function fetchServiceCalls() {
        setLoading(true);
        try {
            const response = await apiClient.get('/service');
            setServiceCalls(response.data);
            setError(null);
        } catch {
            setError('Could not load service call data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchServiceCalls();
    }, []);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const openCreateDialog = () => {
        setEditingId(null);
        setFormValues(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (serviceCall) => {
        setEditingId(serviceCall.id);
        setFormValues({
            title: serviceCall.title,
            priority: serviceCall.priority,
            status: serviceCall.status,
            atm_id: serviceCall.atm_id,
            technician_id: serviceCall.technician_id,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formValues,
            atm_id: Number(formValues.atm_id),
            technician_id: Number(formValues.technician_id),
        };
        try {
            if (editingId) {
                await apiClient.put(`/service/${editingId}`, payload);
            } else {
                await apiClient.post('/service', payload);
            }
            setDialogOpen(false);
            await fetchServiceCalls();
        } catch {
            setError('Could not save service call.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/service/${id}`);
            await fetchServiceCalls();
        } catch {
            setError('Could not delete service call.');
        }
    };

    const openStatusDialog = (serviceCall) => {
        setStatusDialogId(serviceCall.id);
        setStatusValue(serviceCall.status);
    };

    const handleStatusSave = async () => {
        try {
            await apiClient.patch(`/service/${statusDialogId}/status`, { status: statusValue });
            setStatusDialogId(null);
            await fetchServiceCalls();
        } catch {
            setError('Could not update service call status.');
        }
    };

    const canChangeStatus = isAdmin || isTechnician;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Title', width: 220 },
        {
            field: 'priority',
            headerName: 'Priority',
            width: 110,
            renderCell: (params) => (
                <Chip label={params.value} color={PRIORITY_COLORS[params.value] ?? 'default'} size="small" />
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Chip label={params.value} color={STATUS_COLORS[params.value] ?? 'default'} size="small" variant="outlined" />
            ),
        },
        { field: 'atm_id', headerName: 'ATM ID', width: 100, type: 'number' },
        { field: 'technician_id', headerName: 'Technician ID', width: 130, type: 'number' },
        ...(isAdmin || canChangeStatus
            ? [{
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                width: 130,
                getActions: (params) => [
                    ...(canChangeStatus ? [
                        <GridActionsCellItem
                            key="status"
                            icon={<SyncRoundedIcon />}
                            label="Change Status"
                            onClick={() => openStatusDialog(params.row)}
                        />,
                    ] : []),
                    ...(isAdmin ? [
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
                    ] : []),
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
                    Add Service Call
                </Button>
            )}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGrid
                    rows={serviceCalls}
                    columns={columns}
                    showToolbar
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{editingId ? 'Edit Service Call' : 'Add Service Call'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField label="Title" value={formValues.title} onChange={handleFieldChange('title')} />
                        <TextField select label="Priority" value={formValues.priority} onChange={handleFieldChange('priority')}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="ATM ID" type="number" value={formValues.atm_id} onChange={handleFieldChange('atm_id')} />
                        <TextField label="Technician ID" type="number" value={formValues.technician_id} onChange={handleFieldChange('technician_id')} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={statusDialogId !== null} onClose={() => setStatusDialogId(null)}>
                <DialogTitle>Change Status</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Status"
                        value={statusValue}
                        onChange={(event) => setStatusValue(event.target.value)}
                        sx={{ mt: 1, minWidth: 250 }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogId(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStatusSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ServiceCallDataGrid;
