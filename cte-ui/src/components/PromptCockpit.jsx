// FILE: cte_ui/src/components/PromptCockpit.jsx
import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Tooltip, IconButton, Collapse, Badge, useTheme } from '@mui/material';
import { Sparkles, Settings2, UserCheck, Layers, Cpu, AlertTriangle, Zap, Check, Aperture, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- VISUAL ASSETS ---

const HudCorner = ({ position, color }) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    return (
        <Box sx={{ 
            position: 'absolute', 
            top: isTop ? 0 : 'auto', bottom: !isTop ? 0 : 'auto',
            left: isLeft ? 0 : 'auto', right: !isLeft ? 0 : 'auto',
            width: 20, height: 20,
            borderTop: isTop ? `2px solid ${color}` : 'none',
            borderBottom: !isTop ? `2px solid ${color}` : 'none',
            borderLeft: isLeft ? `2px solid ${color}` : 'none',
            borderRight: !isLeft ? `2px solid ${color}` : 'none',
            zIndex: 0, opacity: 0.5,
            transition: 'all 0.3s'
        }} />
    );
};

const ModeBadge = ({ icon: Icon, label, active, color, isDark }) => (
    <Box sx={{ 
        display: 'flex', alignItems: 'center', gap: 1, 
        px: 1.5, py: 0.5, borderRadius: '4px',
        bgcolor: active ? (isDark ? `${color}10` : `${color}08`) : 'transparent',
        border: '1px solid', borderColor: active ? (isDark ? `${color}40` : `${color}20`) : 'transparent',
        color: active ? color : 'text.secondary',
        position: 'relative', overflow: 'hidden'
    }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', bgcolor: color }} />
        <Icon size={12} strokeWidth={2.5} />
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '1px', fontSize: '0.65rem', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
            {label}
        </Typography>
    </Box>
);

const SettingToggle = ({ label, options, selected, onSelect, warningThreshold, isDark, theme }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 4, bgcolor: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace' }}>
                {label}
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {options.map((opt) => {
                const isSelected = selected === opt.value;
                const isWarning = warningThreshold && selected === warningThreshold && isSelected;
                
                let bg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                let border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
                let textColor = 'text.secondary';

                if (isSelected) {
                    if (isWarning) {
                        bg = isDark ? 'rgba(67, 20, 7, 0.4)' : '#fff7ed';
                        border = '#f97316';
                        textColor = '#f97316';
                    } else {
                        bg = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)';
                        border = '#8b5cf6';
                        textColor = isDark ? '#a78bfa' : '#7c3aed';
                    }
                }

                return (
                    <Box
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
                        component={motion.div}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        sx={{
                            flex: 1, minWidth: '100px', textAlign: 'center',
                            px: 2, py: 1.5, borderRadius: '2px', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                            bgcolor: bg, color: textColor,
                            border: '1px solid', borderColor: border,
                            position: 'relative',
                            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' 
                        }}
                    >
                        {opt.label}
                        {isSelected && <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, bgcolor: isWarning ? '#f97316' : '#8b5cf6' }} />}
                    </Box>
                );
            })}
        </Box>
    </Box>
);

const PromptCockpit = ({ query, setQuery, onRun }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [isFocused, setIsFocused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const [hitlEnabled, setHitlEnabled] = useState(false);
    const [tempMode, setTempMode] = useState(null); 
    const [depthMode, setDepthMode] = useState("standard");

    const handleRunClick = () => {
        onRun(query, 5, hitlEnabled, tempMode, depthMode);
    };

    const activeConfigCount = (hitlEnabled ? 1 : 0) + (tempMode ? 1 : 0) + (depthMode !== 'standard' ? 1 : 0);
    const glowColor = isFocused ? '#8b5cf6' : 'transparent';

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: '1200px', mx: 'auto', zIndex: 10 }}>
            
            {/* Background Grid Decoration */}
            <Box sx={{ 
                position: 'absolute', inset: -20, zIndex: -1, 
                backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
            }} />

            <Paper 
                elevation={0}
                sx={{ 
                    position: 'relative', zIndex: 1,
                    borderRadius: '16px', 
                    border: '1px solid', 
                    borderColor: isFocused ? 'primary.main' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                    background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: isFocused 
                        ? (isDark ? '0 0 60px -10px rgba(139, 92, 246, 0.2)' : '0 10px 40px -10px rgba(139, 92, 246, 0.15)')
                        : 'none',
                    transition: 'all 0.4s ease'
                }}
            >
                {/* HUD Corners */}
                <HudCorner position="top-left" color={glowColor} />
                <HudCorner position="top-right" color={glowColor} />
                <HudCorner position="bottom-left" color={glowColor} />
                <HudCorner position="bottom-right" color={glowColor} />

                {/* Top Status Rail */}
                <Box sx={{ 
                    px: 3, py: 1.5, 
                    borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <ModeBadge isDark={isDark} icon={Layers} label={depthMode} active={true} color="#3b82f6" />
                        <ModeBadge isDark={isDark} icon={Cpu} label={tempMode || 'AUTO'} active={true} color="#d946ef" />
                        <ModeBadge isDark={isDark} icon={UserCheck} label={hitlEnabled ? 'SUPERVISED' : 'AUTONOMOUS'} active={hitlEnabled} color="#10b981" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.5 }}>
                        <Globe size={12} />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>ONLINE</Typography>
                    </Box>
                </Box>

                {/* Input Core */}
                <Box sx={{ p: 4 }}>
                    <TextField 
                        fullWidth 
                        multiline 
                        minRows={2}
                        maxRows={12}
                        placeholder="ENTER STRATEGIC DIRECTIVE..." 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        variant="standard"
                        InputProps={{ 
                            disableUnderline: true, 
                            style: { 
                                fontSize: '1.75rem', 
                                fontFamily: '"Inter", sans-serif', 
                                fontWeight: 600, 
                                lineHeight: 1.4, 
                                color: isDark ? '#f8fafc' : '#0f172a',
                                letterSpacing: '-0.02em'
                            } 
                        }}
                        sx={{
                            '& .MuiInputBase-input::placeholder': {
                                color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                opacity: 1,
                                fontWeight: 700,
                                letterSpacing: '0.05em'
                            }
                        }}
                    />
                </Box>

                {/* Control Deck */}
                <Box sx={{ 
                    px: 4, py: 2,
                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(241, 245, 249, 0.5)',
                    borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    
                    {/* Settings Trigger */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                         <IconButton 
                            onClick={() => setShowSettings(!showSettings)}
                            sx={{ 
                                borderRadius: '8px', 
                                color: showSettings ? 'primary.main' : 'text.secondary',
                                border: '1px solid', borderColor: showSettings ? 'primary.dark' : 'transparent',
                                bgcolor: showSettings ? (isDark ? 'rgba(139, 92, 246, 0.1)' : 'white') : 'transparent'
                            }}
                        >
                            <Badge variant="dot" color="primary" invisible={!activeConfigCount || showSettings}>
                                <Settings2 size={18} />
                            </Badge>
                        </IconButton>
                        
                        <Tooltip title="Toggle Supervision">
                            <IconButton 
                                onClick={() => setHitlEnabled(!hitlEnabled)}
                                sx={{ 
                                    borderRadius: '8px',
                                    color: hitlEnabled ? '#10b981' : 'text.secondary',
                                    bgcolor: hitlEnabled ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5') : 'transparent',
                                }}
                            >
                                <UserCheck size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Launch Button */}
                    <Button 
                        disabled={!query}
                        onClick={handleRunClick}
                        sx={{ 
                            borderRadius: '2px',
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            letterSpacing: '2px',
                            fontSize: '0.8rem',
                            bgcolor: query ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            color: query ? 'white' : 'text.disabled',
                            px: 5, py: 1.5,
                            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                bgcolor: query ? '#6d28d9' : 'transparent',
                                boxShadow: query ? '0 0 30px rgba(124, 58, 237, 0.4)' : 'none'
                            }
                        }}
                    >
                        Initialize
                        {query && <Sparkles size={16} style={{ marginLeft: 8 }} />}
                    </Button>
                </Box>

                {/* Settings Panel */}
                <Collapse in={showSettings}>
                    <Box sx={{ 
                        p: 4, pt: 2, 
                        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
                        borderTop: '1px solid', borderColor: 'divider'
                    }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6 }}>
                            <SettingToggle 
                                label="Recursion Depth"
                                selected={depthMode}
                                onSelect={setDepthMode}
                                warningThreshold="deep"
                                isDark={isDark}
                                theme={theme}
                                options={[
                                    { value: "quick", label: "QUICK SCAN", desc: "2 Loops (Fast)" },
                                    { value: "standard", label: "STANDARD", desc: "3 Loops (Default)" },
                                    { value: "deep", label: "DEEP RESEARCH", desc: "6+ Loops (Thorough)" },
                                ]}
                            />
                            
                            <SettingToggle 
                                label="Cognitive Temperature"
                                selected={tempMode}
                                onSelect={(val) => setTempMode(prev => prev === val ? null : val)}
                                isDark={isDark}
                                theme={theme}
                                options={[
                                    { value: "precise", label: "LOGIC", desc: "Low Temp (0.2)" },
                                    { value: "balanced", label: "BALANCED", desc: "Mid Temp (0.7)" },
                                    { value: "creative", label: "CHAOS", desc: "High Temp (1.0)" },
                                ]}
                            />
                        </Box>

                         <AnimatePresence>
                            {depthMode === 'deep' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '16px' }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', gap: 1.5, alignItems: 'center', 
                                        p: 1.5, borderRadius: '4px', 
                                        bgcolor: isDark ? 'rgba(124, 45, 18, 0.2)' : '#fff7ed', 
                                        color: '#ea580c',
                                        borderLeft: '4px solid #ea580c'
                                    }}>
                                        <AlertTriangle size={16} />
                                        <Typography variant="caption" fontFamily="'JetBrains Mono', monospace">
                                            WARNING: HIGH COMPUTE LOAD (approx 25k tokens).
                                        </Typography>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Collapse>
            </Paper>
        </Box>
    );
};

export default PromptCockpit;