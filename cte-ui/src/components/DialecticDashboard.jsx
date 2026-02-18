import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Activity, ShieldAlert, Share2, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
                <Icon size={16} color={color} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: color }}>
                {typeof value === 'number' ? value.toFixed(3) : '0.000'}
            </Typography>
            <Box sx={{ height: 4, width: '100%', bgcolor: 'background.subtle', mt: 1, borderRadius: 2 }}>
                <Box sx={{ height: '100%', width: `${Math.min(Math.abs(value || 0)*100, 100)}%`, bgcolor: color, borderRadius: 2 }} />
            </Box>
        </Paper>
    </motion.div>
);

const DialecticDashboard = ({ divergence, provenance }) => {
    // If we have neither, return null (section hidden)
    if (divergence === undefined && !provenance) return null;

    // Safety fallback for drivers
    const drivers = provenance && Array.isArray(provenance.drivers) ? provenance.drivers : [];
    
    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={20} color="#8b5cf6" />
                <Typography variant="h6" fontWeight={700}>Dialectic Math Engine</Typography>
            </Box>

            <Grid container spacing={2}>
                {/* 1. Global Divergence Score (Always Show) */}
                <Grid item xs={12} md={2}>
                    <MetricCard 
                        label="GLOBAL DIVERGENCE" 
                        value={divergence || 0.0} 
                        icon={Activity} 
                        color="#8b5cf6" 
                        delay={0.1} 
                    />
                </Grid>
                
                {/* 2. Provenance Drivers */}
                {drivers.length > 0 ? (
                    drivers.slice(0, 4).map((d, i) => {
                        let color = '#64748b';
                        let Icon = BarChart3;
                        if(d[0].includes('Risk')) { color = '#ef4444'; Icon = ShieldAlert; }
                        if(d[0].includes('Info')) { color = '#10b981'; Icon = Zap; }
                        if(d[0].includes('Spectral')) { color = '#f59e0b'; Icon = Share2; }
                        
                        return (
                            <Grid item xs={12} md={2} key={d[0]}>
                                <MetricCard 
                                    label={d[0].toUpperCase()} 
                                    value={d[1]} 
                                    icon={Icon} 
                                    color={color} 
                                    delay={0.1 + (i * 0.1)} 
                                />
                            </Grid>
                        )
                    })
                ) : (
                    <Grid item xs={12} md={4}>
                         <Box sx={{ p: 2, height: '100%', border: '1px dashed', borderColor: 'divider', borderRadius: 2, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                Attribution vectors pending...
                            </Typography>
                         </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default DialecticDashboard;