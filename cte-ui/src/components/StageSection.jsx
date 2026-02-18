import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const StageSection = ({ title, description, icon: Icon, isActive, isCompleted, children }) => {
    // Determine Line Color
    const lineColor = isCompleted ? '#10b981' : isActive ? '#8b5cf6' : 'rgba(0,0,0,0.1)';

    return (
        <Box sx={{ display: 'flex', gap: 4, position: 'relative', mb: 2 }}>
            
            {/* The Timeline Rail */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                {/* Icon Bubble */}
                <motion.div 
                    animate={{ 
                        backgroundColor: isActive ? '#8b5cf6' : isCompleted ? '#10b981' : '#f1f5f9',
                        color: isActive || isCompleted ? 'white' : '#94a3b8',
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive ? '0 0 0 4px rgba(139, 92, 246, 0.2)' : 'none'
                    }}
                    style={{ 
                        width: 40, height: 40, borderRadius: '12px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    <Icon size={20} />
                </motion.div>
                
                {/* Vertical Line */}
                <motion.div 
                    animate={{ backgroundColor: lineColor }}
                    style={{ width: 2, flexGrow: 1, minHeight: 80, marginTop: 8, marginBottom: 8 }}
                />
            </Box>

            {/* The Content */}
            <Box sx={{ flexGrow: 1, pb: 6 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" color={isActive ? 'primary.main' : 'text.primary'} fontWeight={700}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>

                    {/* Active Processing Indicator */}
                    {isActive && !isCompleted && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.light', px: 1.5, py: 0.5, borderRadius: 4 }}>
                            <CircularProgress size={12} thickness={6} sx={{ color: 'primary.dark' }} />
                            <Typography variant="caption" fontWeight={700} color="primary.dark">
                                PROCESSING
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Main Payload (Cards, etc.) */}
                <Box sx={{ mb: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default StageSection;