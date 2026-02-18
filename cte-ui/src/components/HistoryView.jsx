import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip, CircularProgress, IconButton } from '@mui/material';
import { FileText, Clock, ChevronRight, Scale } from 'lucide-react';
import SynthesisModal from './SynthesisModal';

const HistoryView = () => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRun, setSelectedRun] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/api/runs')
            .then(res => res.json())
            .then(data => {
                setRuns(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("History fetch error:", err);
                setLoading(false);
            });
    }, []);

    const handleOpenRun = (run) => {
        // If details are missing (because list endpoint is lightweight), fetch full details
        if (!run.details) {
            fetch(`http://localhost:8000/api/runs/${run.id}`)
                .then(res => res.json())
                .then(fullData => {
                    setSelectedRun(fullData);
                    setModalOpen(true);
                });
        } else {
            setSelectedRun(run);
            setModalOpen(true);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 4, color: 'text.primary' }}>Mission Logs</Typography>
            
            <Grid container spacing={3}>
                {runs.map((run) => (
                    <Grid item xs={12} key={run.id}>
                        <Paper 
                            onClick={() => handleOpenRun(run)}
                            sx={{ 
                                p: 3, borderRadius: 3, 
                                display: 'flex', alignItems: 'center', gap: 3,
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderColor: 'primary.main' },
                                border: '1px solid', borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ 
                                width: 56, height: 56, borderRadius: '16px', 
                                bgcolor: 'primary.light', color: 'primary.main',
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                            }}>
                                <FileText size={24} />
                            </Box>
                            
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', mb: 0.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {run.task}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Chip icon={<Clock size={12} />} label={new Date(run.timestamp).toLocaleString()} size="small" sx={{ fontSize: 11, height: 20 }} />
                                    {run.metrics && (
                                        <Chip 
                                            icon={<Scale size={12} />} 
                                            label={`Divergence: ${run.metrics.divergence?.toFixed(3) || 'N/A'}`} 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ fontSize: 11, height: 20 }}
                                        />
                                    )}
                                </Box>
                            </Box>

                            <IconButton>
                                <ChevronRight size={20} color="#94a3b8" />
                            </IconButton>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {selectedRun && (
                <SynthesisModal 
                    open={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    content={selectedRun.synthesis}
                    provenance={selectedRun.provenance} // Only if saved in DB schema
                    divergence={selectedRun.metrics?.divergence}
                    evidence={selectedRun.details?.research_evidence || []} // Needs details populated
                />
            )}
        </Box>
    );
};

export default HistoryView;