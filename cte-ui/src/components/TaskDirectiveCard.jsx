import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Zap, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskDirectiveCard = ({ query }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ 
                p: 3, mb: 4, borderRadius: 3, 
                bgcolor: '#0f172a', color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}>
                {/* Background Decor */}
                <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, transform: 'rotate(15deg)' }}>
                    <Zap size={120} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ 
                        mt: 0.5,
                        width: 32, height: 32, borderRadius: '8px', 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                        <Zap size={18} color="#facc15" />
                    </Box>
                    
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#94a3b8', letterSpacing: 1, mb: 1, display: 'block' }}>
                            ACTIVE MISSION DIRECTIVE
                        </Typography>
                        <Typography variant="h6" fontWeight={500} sx={{ lineHeight: 1.5, fontFamily: 'Inter', fontStyle: 'italic' }}>
                            "{query}"
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default TaskDirectiveCard;