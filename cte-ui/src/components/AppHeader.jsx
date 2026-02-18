// FILE: cte_ui/src/components/AppHeader.jsx
import React from 'react';
import { Box, Typography, Button, Chip, Divider, Fade } from '@mui/material';
import { Plus, Activity, Cpu, Thermometer, Sliders, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CTELogo from './CTELogo';

const ConfigBadge = ({ icon: Icon, label, value, color = 'default' }) => (
    <Box sx={{ 
        display: 'flex', alignItems: 'center', gap: 0.8, 
        bgcolor: 'background.paper', px: 1.5, py: 0.5, borderRadius: '8px',
        border: '1px solid', borderColor: 'divider',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
        <Icon size={14} color={color} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}:</Typography>
        <Typography variant="caption" fontWeight={700} color="text.primary">{value}</Typography>
    </Box>
);

const AppHeader = ({ status, latestLog, onNewTask, showNewTask, config }) => {
  return (
    <Box sx={{ 
        display: 'flex', flexDirection: 'column',
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 1000,
        transition: 'all 0.3s ease'
    }}>
        <Box sx={{ 
            height: 64, px: 4, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <CTELogo />
                <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />
                <Chip 
                    icon={<Activity size={14} />} 
                    label={status} 
                    size="small" 
                    color={status === 'IDLE' ? 'default' : status === 'COMPLETE' ? 'success' : 'primary'}
                    sx={{ fontWeight: 700, borderRadius: '6px', height: 24 }}
                />
                <AnimatePresence mode='wait'>
                    {latestLog && (
                        <motion.div
                            key={latestLog.msg}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{latestLog.node?.toUpperCase()}</span>
                                {latestLog.msg}
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
            <Box>
                {showNewTask && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Button 
                            variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={onNewTask}
                            sx={{ borderRadius: '8px', fontWeight: 600, border: '1px solid', borderColor: 'divider', color: 'text.primary' }}
                        >
                            New Task
                        </Button>
                    </motion.div>
                )}
            </Box>
        </Box>
        {showNewTask && config && (
            <Fade in={true}>
                <Box sx={{ 
                    px: 4, pb: 2, pt: 0,
                    display: 'flex', alignItems: 'center', gap: 2,
                    overflowX: 'auto'
                }}>
                    <ConfigBadge icon={Cpu} label="MODE" value={config.nature || "General"} color="#8b5cf6" />
                    {config.config && (
                        <>
                            <ConfigBadge icon={Thermometer} label="TEMP" value={config.config.temperature} color="#ef4444" />
                            <ConfigBadge icon={Sliders} label="TOP-P" value={config.config.top_p} color="#f59e0b" />
                            <ConfigBadge icon={Shield} label="PENALTY" value={config.config.frequency_penalty > 0 ? "Active" : "None"} color="#10b981" />
                        </>
                    )}
                </Box>
            </Fade>
        )}
    </Box>
  );
};

export default AppHeader;