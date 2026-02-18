import React from 'react';
import { Box, Typography } from '@mui/material';
import { Activity } from 'lucide-react';

const DivergenceStrip = ({ score }) => {
  // Create 24 bars for the visualizer
  const bars = Array.from({ length: 24 });
  const intensity = Math.min(score / 5, 1); // Normalize 0 to 1

  return (
    <Box sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: 4, 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
        <Box sx={{ 
            width: 56, height: 56, borderRadius: '16px', 
            bgcolor: intensity > 0.6 ? '#fee2e2' : '#f0f9ff', 
            color: intensity > 0.6 ? '#ef4444' : '#0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Activity size={28} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>Cognitive Divergence</Typography>
                <Typography variant="subtitle2" color={intensity > 0.6 ? 'error.main' : 'primary.main'}>
                    {score.toFixed(4)}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: 32 }}>
                {bars.map((_, i) => {
                    // Generate a "wave" pattern based on score
                    const isActive = i / 24 < intensity;
                    const height = 12 + Math.random() * 20;
                    
                    return (
                        <Box 
                            key={i}
                            sx={{
                                flex: 1,
                                height: isActive ? `${height}px` : '4px',
                                bgcolor: isActive 
                                    ? (intensity > 0.6 ? '#ef4444' : '#8b5cf6') 
                                    : 'action.hover',
                                borderRadius: 4,
                                transition: 'all 0.5s ease'
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    </Box>
  );
};

export default DivergenceStrip;