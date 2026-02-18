import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const LiveLogHUD = ({ logs }) => {
    // Show only last 5 logs
    const recentLogs = logs.slice(-5);

    return (
        <Box sx={{ position: 'fixed', bottom: 120, right: 32, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 1, pointerEvents: 'none' }}>
            <AnimatePresence>
                {recentLogs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        layout
                    >
                        <Box sx={{ 
                            bgcolor: 'rgba(15, 23, 42, 0.8)', 
                            backdropFilter: 'blur(8px)',
                            color: 'white', 
                            p: 1.5, px: 2, 
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxWidth: 300
                        }}>
                            <Box sx={{ 
                                width: 6, height: 6, borderRadius: '50%', 
                                bgcolor: log.node === 'critic' ? '#ef4444' : '#10b981' 
                            }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {log.node || 'SYSTEM'}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                                    {log.msg}
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </AnimatePresence>
        </Box>
    );
};

export default LiveLogHUD;