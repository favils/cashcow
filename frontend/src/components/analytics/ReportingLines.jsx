import { useState } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import apiClient from '../../api/client.js';

function ReportingLines() {
    const [supervisorId, setSupervisorId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleLookup = async () => {
        setError(null);
        setResult(null);
        try {
            const response = await apiClient.get('/service/supervisor-active-technicians', {
                params: { supervisor_id: supervisorId },
            });
            setResult(response.data);
        } catch {
            setError('Could not load reporting line data for that supervisor ID.');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="Supervisor ID"
                    value={supervisorId}
                    onChange={(event) => setSupervisorId(event.target.value)}
                />
                <Button variant="outlined" onClick={handleLookup}>Look Up</Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {result && (
                <Typography>
                    Supervisor {result.supervisor_id}: {result.active_technician_count} technician(s) with active service calls.
                </Typography>
            )}
        </Box>
    );
}

export default ReportingLines;
