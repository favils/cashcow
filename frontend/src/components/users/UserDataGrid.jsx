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
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../../api/client.js';

const ROLE_OPTIONS = ['Operations Admin', 'Field Technician', 'Auditor'];

const EMPTY_FORM = { username: '', password: '', role: 'Auditor' };

function UserDataGrid() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formValues, setFormValues] = useState(EMPTY_FORM);

    const [editingId, setEditingId] = useState(null);
    const [editRole, setEditRole] = useState('Auditor');

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await apiClient.get('/auth/users');
            setUsers(response.data);
            setError(null);
        } catch {
            setError('Could not load users.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const openCreateDialog = () => {
        setFormValues(EMPTY_FORM);
        setDialogOpen(true);
    };

    const handleCreate = async () => {
        try {
            await apiClient.post('/auth/register', formValues);
            setDialogOpen(false);
            await fetchUsers();
        } catch {
            setError('Could not create user.');
        }
    };

    const openEditDialog = (userRow) => {
        setEditingId(userRow.id);
        setEditRole(userRow.role);
    };

    const handleRoleSave = async () => {
        try {
            await apiClient.patch(`/auth/users/${editingId}`, { role: editRole });
            setEditingId(null);
            await fetchUsers();
        } catch {
            setError('Could not update user role.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/auth/users/${id}`);
            await fetchUsers();
        } catch {
            setError('Could not delete user.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'username', headerName: 'Username', width: 200 },
        { field: 'role', headerName: 'Role', width: 180 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<EditRoundedIcon />}
                    label="Edit Role"
                    onClick={() => openEditDialog(params.row)}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteRoundedIcon />}
                    label="Delete"
                    onClick={() => handleDelete(params.row.id)}
                />,
            ],
        },
    ];

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Button variant="outlined" sx={{ mb: 2, alignSelf: 'flex-start' }} onClick={openCreateDialog}>
                Add User
            </Button>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    showToolbar
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField label="Username" value={formValues.username} onChange={handleFieldChange('username')} />
                        <TextField label="Password" type="password" value={formValues.password} onChange={handleFieldChange('password')} />
                        <TextField select label="Role" value={formValues.role} onChange={handleFieldChange('role')}>
                            {ROLE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editingId !== null} onClose={() => setEditingId(null)}>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Role"
                        value={editRole}
                        onChange={(event) => setEditRole(event.target.value)}
                        sx={{ mt: 1, minWidth: 250 }}
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRoleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UserDataGrid;
