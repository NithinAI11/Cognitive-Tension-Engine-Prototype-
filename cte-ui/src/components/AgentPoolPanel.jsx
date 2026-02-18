import React from 'react';
import { Box, Typography, Grid, Chip, LinearProgress, Tooltip } from '@mui/material';
import { Bot, ShieldAlert, Scale, Database, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AgentCard = ({ type, query, status }) => {
    let Icon = Bot;
    let color = '#8b5cf6';
    if (type === 'Safety') { Icon = ShieldAlert; color = '#ef4444'; }
    if (type === 'Factual') { Icon = Database; color = '#3b82f6'; }
    if (type === 'Resource') { Icon = Scale; color = '#f59e0b'; }
    if (type === 'Causal') { Icon = Clock; color = '#10b981'; }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Box sx={{ 
                p: 2.5, borderRadius: 3, 
                bgcolor: 'background.paper', 
                border: '1px solid', borderColor: 'divider',
                height: 160, // Fixed height for alignment
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': { borderColor: color, transform: 'translateY(-2px)' }
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                        icon={<Icon size={14} />} 
                        label={type.toUpperCase()} 
                        size="small" 
                        sx={{ bgcolor: `${color}15`, color: color, fontWeight: 700, borderRadius: '6px' }} 
                    />
                    {status === 'active' && (
                        <Box className="animate-pulse" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                    )}
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                        DIRECTIVE
                    </Typography>
                    <Tooltip title={query} placement="top">
                        <Typography variant="body2" sx={{ 
                            fontWeight: 500, lineHeight: 1.4, mt: 0.5,
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                            {query}
                        </Typography>
                    </Tooltip>
                </Box>

                {status === 'active' ? (
                    <LinearProgress sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: 'background.subtle', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                ) : (
                    <Box sx={{ mt: 2, height: 4, bgcolor: color, borderRadius: 2, opacity: 0.3 }} />
                )}
            </Box>
        </motion.div>
    );
};

const AgentPoolPanel = ({ configs, isCompleted }) => {
    return (
        <Grid container spacing={2}>
            {configs.map((agent, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                    <AgentCard 
                        type={agent.type} 
                        query={agent.focus_query} 
                        status={isCompleted ? 'done' : 'active'} 
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default AgentPoolPanel;