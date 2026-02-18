import React from 'react';
import { Paper, TextField, Box, Typography, Slider, Fab, Tooltip } from '@mui/material';
import { Send, Zap } from 'lucide-react';

const MegaConsole = ({ query, setQuery, complexity, setComplexity, onRun, disabled }) => {
  return (
    <Box sx={{ 
        position: 'fixed', bottom: 0, left: 80, right: 0, 
        p: 3, display: 'flex', justifyContent: 'center',
        background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', // Fade effect
        zIndex: 50
    }}>
        <Paper sx={{ 
            width: '100%', maxWidth: 900, 
            borderRadius: '24px', 
            border: '1px solid', borderColor: 'primary.light',
            boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.2)',
            p: 1, pl: 3, pr: 1,
            display: 'flex', alignItems: 'center', gap: 2,
            bgcolor: 'background.paper'
        }}>
            <Box sx={{ py: 1, flexGrow: 1 }}>
                <TextField 
                    fullWidth 
                    multiline
                    maxRows={3}
                    variant="standard" 
                    placeholder="Enter a strategic reasoning objective..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{ 
                        disableUnderline: true, 
                        style: { fontSize: '1.1rem', fontFamily: 'Inter', fontWeight: 500 } 
                    }}
                />
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderLeft: '1px solid', borderColor: 'divider', pl: 2 }}>
                <Box sx={{ width: 100 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">DEPTH</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary">{complexity}</Typography>
                    </Box>
                    <Slider 
                        size="small" min={1} max={10} value={complexity} 
                        onChange={(e, v) => setComplexity(v)}
                        sx={{ py: 1 }} 
                    />
                </Box>
                
                <Fab 
                    color="primary" 
                    onClick={onRun}
                    disabled={!query || disabled}
                    sx={{ boxShadow: 'none', borderRadius: '16px', width: 56, height: 56 }}
                >
                    {disabled ? <Zap size={24} className="animate-pulse" /> : <Send size={24} />}
                </Fab>
            </Box>
        </Paper>
    </Box>
  );
};

export default MegaConsole;