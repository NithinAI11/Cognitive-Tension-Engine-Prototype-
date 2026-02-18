import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, GitBranch, Zap, Layers } from 'lucide-react';

const RecursiveStatusHUD = ({ iteration, maxIterations, decision, activeNode }) => {
    const progress = (iteration / maxIterations) * 100;
    
    let decisionColor = '#94a3b8';
    let decisionIcon = GitBranch;
    let label = 'AWAITING ROUTER';

    if (decision === 'chaos_injection') {
        decisionColor = '#ef4444';
        decisionIcon = Zap;
        label = 'CHAOS INJECTION';
    } else if (decision === 'refine') {
        decisionColor = '#f59e0b';
        decisionIcon = RotateCcw;
        label = 'RECURSIVE REFINEMENT';
    } else if (decision === 'synthesize') {
        decisionColor = '#10b981';
        decisionIcon = Layers;
        label = 'FINAL SYNTHESIS';
    }

    return (
        <Box sx={{
            position: 'fixed',
            top: 80,
            right: 32,
            width: 300,
            zIndex: 1100,
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            p: 2.5,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RotateCcw size={16} color="#94a3b8" />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                        FRACTAL DEPTH
                    </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="white">
                    {iteration} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {maxIterations}</span>
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: decisionColor, borderRadius: 3 }
                    }} 
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <GitBranch size={16} color="#94a3b8" />
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                    STRATEGIC VECTOR
                </Typography>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <Chip 
                        icon={<Box component={decisionIcon} size={14} color="inherit" />}
                        label={label}
                        sx={{ 
                            width: '100%', 
                            justifyContent: 'flex-start',
                            bgcolor: `${decisionColor}20`, 
                            color: decisionColor, 
                            fontWeight: 800,
                            border: `1px solid ${decisionColor}40`,
                            borderRadius: 2,
                            height: 36
                        }} 
                    />
                </motion.div>
            </AnimatePresence>

            {activeNode && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        ACTIVE NODE
                    </Typography>
                    <Typography variant="body2" color="white" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="animate-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                        {activeNode.toUpperCase()}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default RecursiveStatusHUD;