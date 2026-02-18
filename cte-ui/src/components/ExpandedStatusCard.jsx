import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, GitBranch, Zap, Layers, Activity, AlertTriangle } from 'lucide-react';

const ExpandedStatusCard = ({ iteration, maxIterations, decision, divergence }) => {
    const progress = (iteration / maxIterations) * 100;

    // Logic for styling based on router decision
    let statusConfig = {
        label: 'SYSTEM IDLE',
        color: '#94a3b8',
        bg: '#f1f5f9',
        desc: 'Waiting for task initialization...',
        icon: Activity
    };

    if (decision === 'pending') {
        statusConfig = { label: 'INITIALIZING', color: '#8b5cf6', bg: '#f3e8ff', desc: 'Booting agents...', icon: Activity };
    } else if (decision === 'calculating...') {
        statusConfig = { label: 'OODA LOOP', color: '#f59e0b', bg: '#fef3c7', desc: 'Evaluating strategic divergence...', icon: RotateCcw };
    } else if (decision === 'chaos_injection') {
        statusConfig = { label: 'CHAOS MODE', color: '#ef4444', bg: '#fee2e2', desc: 'Groupthink detected. Injecting radical contrarian.', icon: AlertTriangle };
    } else if (decision === 'refine') {
        statusConfig = { label: 'RECURSIVE REFINEMENT', color: '#3b82f6', bg: '#dbeafe', desc: 'High divergence. Refining arguments for consensus.', icon: GitBranch };
    } else if (decision === 'synthesize') {
        statusConfig = { label: 'SYNTHESIS LOCKED', color: '#10b981', bg: '#d1fae5', desc: 'Consensus reached. Generating final brief.', icon: Layers };
    }

    return (
        <Paper sx={{ 
            p: 3, mb: 4, borderRadius: 4, 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid', borderColor: 'divider',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)'
        }}>
            <Grid container spacing={3} alignItems="center">
                
                {/* Left: Iteration & Progress */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">RECURSION DEPTH</Typography>
                        <Typography variant="caption" fontWeight={800} color="primary.main">{iteration} / {maxIterations}</Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                            height: 8, borderRadius: 4, bgcolor: 'background.subtle',
                            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: statusConfig.color }
                        }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                        Fractal loops ensure depth verification.
                    </Typography>
                </Grid>

                {/* Center: Main Status Indicator */}
                <Grid item xs={12} md={5}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={statusConfig.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ 
                                    width: 50, height: 50, borderRadius: '14px', 
                                    bgcolor: statusConfig.bg, color: statusConfig.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <statusConfig.icon size={24} />
                                </Box>
                                <Box>
                                    <Chip 
                                        label={statusConfig.label} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: statusConfig.bg, color: statusConfig.color, 
                                            fontWeight: 800, borderRadius: '6px', mb: 0.5 
                                        }} 
                                    />
                                    <Typography variant="body2" fontWeight={500} color="text.primary">
                                        {statusConfig.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </AnimatePresence>
                </Grid>

                {/* Right: Divergence Metric */}
                <Grid item xs={12} md={3} sx={{ borderLeft: { md: '1px solid #f1f5f9' }, pl: { md: 3 } }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                        CURRENT DIVERGENCE
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color={divergence > 0.5 ? "error.main" : "text.primary"} sx={{ lineHeight: 1 }}>
                        {divergence ? divergence.toFixed(3) : "0.000"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {divergence < 0.2 ? "Groupthink Risk" : divergence > 0.8 ? "High Conflict" : "Healthy Tension"}
                    </Typography>
                </Grid>

            </Grid>
        </Paper>
    );
};

export default ExpandedStatusCard;