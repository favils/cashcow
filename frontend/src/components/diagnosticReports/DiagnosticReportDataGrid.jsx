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
    Link,
    Stack,
    TextField,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const EMPTY_FORM = { service_call_id: '', notes: '' };

function DiagnosticReportDataGrid() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Operations Admin';
    const isTechnician = user?.role === 'Field Technician';
    const canUpload = isAdmin || isTechnician;

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formValues, setFormValues] = useState(EMPTY_FORM);
    const [file, setFile] = useState(null);

    async function fetchReports() {
        setLoading(true);
        try {
            const response = await apiClient.get('/diagnostic-report');
            setReports(response.data);
            setError(null);
        } catch {
            setError('Could not load diagnostic reports.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const openUploadDialog = () => {
        setFormValues(EMPTY_FORM);
        setFile(null);
        setDialogOpen(true);
    };

    const handleUpload = async () => {
        const data = new FormData();
        data.append('service_call_id', formValues.service_call_id);
        data.append('notes', formValues.notes);
        data.append('file', file);

        try {
            await apiClient.post('/diagnostic-report', data);
            setDialogOpen(false);
            await fetchReports();
        } catch {
            setError('Could not upload diagnostic report.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/diagnostic-report/${id}`);
            await fetchReports();
        } catch {
            setError('Could not delete diagnostic report.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'service_call_id', headerName: 'Service Call ID', width: 140, type: 'number' },
        { field: 'notes', headerName: 'Notes', width: 240 },
        { field: 'created_at', headerName: 'Created', width: 180 },
        {
            field: 'file_url',
            headerName: 'File',
            width: 120,
            renderCell: (params) => (
                <Link href={params.value} target="_blank" rel="noopener">View</Link>
            ),
        },
        ...(isAdmin
            ? [{
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                width: 80,
                getActions: (params) => [
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
            {canUpload && (
                <Button variant="outlined" sx={{ mb: 2, alignSelf: 'flex-start' }} onClick={openUploadDialog}>
                    Upload Report
                </Button>
            )}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <DataGrid
                    rows={reports}
                    columns={columns}
                    showToolbar
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Upload Diagnostic Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField
                            label="Service Call ID"
                            type="number"
                            value={formValues.service_call_id}
                            onChange={handleFieldChange('service_call_id')}
                        />
                        <TextField label="Notes" value={formValues.notes} onChange={handleFieldChange('notes')} />
                        <Button variant="outlined" component="label">
                            {file ? file.name : 'Choose File'}
                            <input type="file" hidden onChange={(event) => setFile(event.target.files[0])} />
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpload} disabled={!file || !formValues.service_call_id}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DiagnosticReportDataGrid;
