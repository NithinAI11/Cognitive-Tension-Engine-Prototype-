import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { BrainCircuit, Search, Scale, Merge, Database, GitBranch, RotateCcw } from 'lucide-react';

const PipelineVisualizer = ({ activeNode, decision }) => {
    const nodes = [
        { id: 'planner', icon: BrainCircuit, label: 'Ideation' },
        { id: 'contradiction', icon: GitBranch, label: 'Conflict' },
        { id: 'critic', icon: Search, label: 'Critique' },
        { id: 'divergence', icon: Scale, label: 'Tension' },
        { id: 'router', icon: RotateCcw, label: 'OODA Loop' },
        { id: 'synthesizer', icon: Merge, label: 'Synthesis' }
    ];

    return (
        <Box sx={{ 
            p: 3, bgcolor: 'background.paper', borderRadius: 4, mb: 4,
            border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden'
        }}>
            <Box sx={{ position: 'absolute', top: '45%', left: 40, right: 40, height: 2, bgcolor: 'divider', zIndex: 0 }} />
            
            {decision === 'chaos_injection' || decision === 'refine' ? (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ position: 'absolute', top: '30%', left: '20%', right: '20%', height: 40, borderTop: '2px dashed #f59e0b', borderRadius: '50%', zIndex: 0 }}
                />
            ) : null}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {nodes.map((node) => {
                    const isActive = activeNode === node.id;
                    const isRouter = node.id === 'router';
                    
                    return (
                        <Box key={node.id} sx={{ textAlign: 'center', position: 'relative' }}>
                            <motion.div
                                animate={{ 
                                    scale: isActive ? 1.2 : 1,
                                    backgroundColor: isActive ? (isRouter ? '#f59e0b' : '#8b5cf6') : '#f1f5f9',
                                    color: isActive ? '#fff' : '#94a3b8',
                                    boxShadow: isActive ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                                }}
                                style={{ 
                                    width: 48, height: 48, borderRadius: '16px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 8px auto', 
                                    border: isRouter ? '2px solid #f59e0b' : 'none'
                                }}
                            >
                                <node.icon size={20} />
                            </motion.div>
                            <Typography variant="caption" fontWeight={600} sx={{ color: isActive ? 'text.primary' : 'text.secondary' }}>
                                {node.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default PipelineVisualizer;