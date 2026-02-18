import React from 'react';
import { Box, Typography, IconButton, Collapse, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { BrainCircuit, Search, Scale, Merge, GitBranch, RotateCcw, Zap, ChevronRight, X } from 'lucide-react';

const steps = [
    { id: 'planner', label: 'Ideation', icon: BrainCircuit, desc: 'Generative Consensus' },
    { id: 'contradiction', label: 'Conflict Analysis', icon: GitBranch, desc: 'Detecting Logic Gaps' },
    { id: 'swarm', label: 'Swarm Retrieval', icon: Zap, desc: 'Evidence Gathering' },
    { id: 'critic', label: 'Meta-Critique', icon: Search, desc: 'Scoring & Risk' },
    { id: 'divergence', label: 'Tension Engine', icon: Scale, desc: 'Math Verification' },
    { id: 'router', label: 'OODA Router', icon: RotateCcw, desc: 'Recursive Logic' },
    { id: 'synthesizer', label: 'Final Synthesis', icon: Merge, desc: 'Strategic Brief' }
];

const VerticalFlowPanel = ({ activeNode, decision, iteration, maxIterations, divergence, onClose }) => {
    
    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider'
        }}>
            {/* Header with Collapse Button */}
            <Box sx={{ 
                p: 2, px: 3, 
                borderBottom: '1px solid', borderColor: 'divider', 
                bgcolor: 'background.subtle',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1 }}>
                    SYSTEM TELEMETRY
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <ChevronRight size={18} />
                </IconButton>
            </Box>

            {/* Vertical Timeline */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, position: 'relative' }}>
                <Box sx={{ position: 'relative' }}>
                    {/* Vertical Line */}
                    <Box sx={{ position: 'absolute', left: 23, top: 20, bottom: 20, width: 2, bgcolor: 'divider', zIndex: 0 }} />

                    {steps.map((step, index) => {
                        const isActive = activeNode === step.id;
                        const activeIndex = steps.findIndex(s => s.id === activeNode);
                        const isPassed = activeIndex > index;
                        
                        let nodeColor = isActive ? '#8b5cf6' : isPassed ? '#10b981' : '#cbd5e1';
                        if (isActive && step.id === 'router') nodeColor = '#f59e0b'; 
                        
                        return (
                            <Box key={step.id} sx={{ position: 'relative', mb: 4, display: 'flex', gap: 2 }}>
                                {/* Icon Bubble */}
                                <motion.div 
                                    initial={false}
                                    animate={{ scale: isActive ? 1.1 : 1, backgroundColor: isActive ? 'white' : 'background.paper' }}
                                    style={{ 
                                        width: 48, height: 48, borderRadius: '16px', 
                                        border: `2px solid ${nodeColor}`, backgroundColor: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 1, position: 'relative', boxShadow: isActive ? `0 0 15px ${nodeColor}60` : 'none',
                                        flexShrink: 0
                                    }}
                                >
                                    <step.icon size={20} color={nodeColor} />
                                    {/* Spinner for Router */}
                                    {isActive && step.id === 'router' && (decision === 'refine' || decision === 'chaos_injection') && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            style={{ position: 'absolute', right: -6, top: -6 }}
                                        >
                                            <RotateCcw size={16} color="#f59e0b" fill="#f59e0b" />
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Text & Inline Metrics */}
                                <Box sx={{ pt: 0.5, flexGrow: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700} color={isActive ? 'text.primary' : 'text.secondary'}>
                                        {step.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        {step.desc}
                                    </Typography>
                                    
                                    {/* --- INLINE METRICS INJECTION --- */}
                                    
                                    {/* 1. Tension Engine: Show Divergence Score */}
                                    {step.id === 'divergence' && divergence > 0 && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                            <Chip 
                                                label={`Div: ${divergence.toFixed(4)}`} 
                                                size="small" 
                                                sx={{ 
                                                    height: 20, fontSize: 10, fontWeight: 700, 
                                                    bgcolor: divergence > 0.5 ? '#fef2f2' : '#f0fdf4', 
                                                    color: divergence > 0.5 ? '#ef4444' : '#10b981',
                                                    border: '1px solid', borderColor: 'inherit'
                                                }} 
                                            />
                                        </motion.div>
                                    )}

                                    {/* 2. Router: Show Decision & Iteration */}
                                    {step.id === 'router' && iteration !== undefined && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                <Chip 
                                                    label={`Loop ${iteration}/${maxIterations}`} 
                                                    size="small" 
                                                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#fef3c7', color: '#b45309' }} 
                                                />
                                                {decision && decision !== 'pending' && (
                                                    <Chip 
                                                        label={decision.toUpperCase()} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, fontSize: 10, fontWeight: 700, 
                                                            bgcolor: decision === 'chaos_injection' ? '#450a0a' : '#172554', 
                                                            color: 'white' 
                                                        }} 
                                                    />
                                                )}
                                            </Box>
                                        </motion.div>
                                    )}

                                    {/* Active Processing Tag */}
                                    {isActive && step.id !== 'divergence' && step.id !== 'router' && (
                                        <Chip label="PROCESSING" size="small" sx={{ mt: 0.5, height: 20, fontSize: 9, fontWeight: 800, bgcolor: `${nodeColor}15`, color: nodeColor }} />
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

export default VerticalFlowPanel;