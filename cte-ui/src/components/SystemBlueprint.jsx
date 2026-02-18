// FILE: cte_ui/src/components/SystemBlueprint.jsx
import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { BrainCircuit, Search, Scale, Merge, Terminal, ShieldCheck, GitBranch, RotateCcw, UserCheck, Activity } from 'lucide-react';

// --- SUB-COMPONENTS ---

const NeuralNode = ({ icon: Icon, label, sub, color, delay, isDark }) => (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
        >
            <Box sx={{ 
                width: 60, height: 60, borderRadius: '50%', 
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'white',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${color}40`,
                position: 'relative'
            }}>
                <Icon size={24} color={color} />
                {/* Orbit Animation */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ 
                        position: 'absolute', inset: -6, borderRadius: '50%', 
                        border: `1px dashed ${color}`, opacity: 0.3 
                    }}
                />
            </Box>
        </motion.div>
        <Typography variant="caption" fontWeight={700} sx={{ mt: 2, letterSpacing: '1px', color: isDark ? 'white' : 'text.primary' }}>
            {label}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: color, fontFamily: '"JetBrains Mono", monospace' }}>
            {sub}
        </Typography>
    </Box>
);

const PipelineConnector = ({ color }) => (
    <Box sx={{ height: 2, flexGrow: 1, bgcolor: `${color}20`, position: 'relative', top: -20, mx: 1 }}>
        <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ width: '40%', height: '100%', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
    </Box>
);

const ProtocolStep = ({ num, title, desc, isDark }) => (
    <Box sx={{ display: 'flex', gap: 2, opacity: 0.9 }}>
        <Typography variant="h3" sx={{ 
            fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, 
            color: 'transparent', WebkitTextStroke: isDark ? '1px rgba(255,255,255,0.2)' : '1px rgba(0,0,0,0.1)',
            opacity: 0.5
        }}>
            {num}
        </Typography>
        <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}>
                {desc}
            </Typography>
        </Box>
    </Box>
);

const CapabilityHex = ({ icon: Icon, title, desc, color, isDark }) => (
    <Box sx={{ 
        p: 2, borderRadius: '8px', 
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: `${color}10`, borderColor: `${color}40` }
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Icon size={16} color={color} />
            <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? '#e2e8f0' : '#334155' }}>
                {title}
            </Typography>
        </Box>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {desc}
        </Typography>
    </Box>
);

// --- MAIN COMPONENT ---

const SystemBlueprint = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{ mt: 8, px: 2 }}>
            
            {/* 1. VISUAL PIPELINE */}
            <Paper sx={{ 
                p: 6, mb: 6, borderRadius: '24px', 
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#fff',
                backgroundImage: isDark 
                    ? 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1), transparent 70%)' 
                    : 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.05), transparent 70%)',
                border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, position: 'relative', zIndex: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Activity size={18} color="#10b981" />
                        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '2px', color: '#10b981' }}>
                            SYSTEM ONLINE
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.secondary' }}>
                        ARCH v2.5.0-BETA
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, flexWrap: 'wrap', gap: 2 }}>
                    <NeuralNode isDark={isDark} icon={BrainCircuit} label="IDEATION" sub="Multi-Agent Gen" color="#8b5cf6" delay={0.1} />
                    <PipelineConnector color="#8b5cf6" />
                    <NeuralNode isDark={isDark} icon={Search} label="CRITIQUE" sub="Adversarial Review" color="#ef4444" delay={0.2} />
                    <PipelineConnector color="#ef4444" />
                    <NeuralNode isDark={isDark} icon={Scale} label="TENSION" sub="Divergence Calc" color="#f59e0b" delay={0.3} />
                    <PipelineConnector color="#f59e0b" />
                    <NeuralNode isDark={isDark} icon={RotateCcw} label="OODA LOOP" sub="Recursive Router" color="#0ea5e9" delay={0.4} />
                    <PipelineConnector color="#0ea5e9" />
                    <NeuralNode isDark={isDark} icon={Merge} label="SYNTHESIS" sub="Dialectical Merge" color="#10b981" delay={0.5} />
                </Box>
                
                {/* Visual Feedback for HITL */}
                <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', opacity: 0.6, display: 'flex', gap: 1 }}>
                     <UserCheck size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                        HITL INTERVENTION ACTIVE ON HIGH ENTROPY
                     </Typography>
                </Box>
            </Paper>

            {/* 2. OPERATIONAL DIRECTIVES & CAPABILITIES */}
            <Grid container spacing={6}>
                
                {/* LEFT: MISSION PROTOCOL */}
                <Grid item xs={12} md={5}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 4, display: 'block', letterSpacing: '2px' }}>
                        Operational Directive
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <ProtocolStep 
                            isDark={isDark} num="01" 
                            title="Define & Configure" 
                            desc="Enter objective. Select 'Deep Research' for maximum verification (6 loops) or enable HITL for manual steering."
                        />
                        <ProtocolStep 
                            isDark={isDark} num="02" 
                            title="Recursive OODA Loop" 
                            desc="The system loops through observation and orientation. If high ambiguity is detected, it pauses for human guidance."
                        />
                        <ProtocolStep 
                            isDark={isDark} num="03" 
                            title="Synthesis & Provenance" 
                            desc="Final output is synthesized only when divergence stabilizes. All decision vectors are logged."
                        />
                    </Box>
                </Grid>

                {/* RIGHT: SYSTEM SPECS */}
                <Grid item xs={12} md={7}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 4, display: 'block', letterSpacing: '2px' }}>
                        Core Capabilities
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <CapabilityHex isDark={isDark} icon={GitBranch} title="Adversarial Logic" desc="Agents are forced to disagree to prevent groupthink." color="#8b5cf6" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CapabilityHex isDark={isDark} icon={RotateCcw} title="Fractal Recursion" desc="Self-correcting OODA loops with chaos injection." color="#0ea5e9" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CapabilityHex isDark={isDark} icon={UserCheck} title="Active Steering" desc="Human-in-the-loop intervention for strategic alignment." color="#10b981" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CapabilityHex isDark={isDark} icon={Terminal} title="Cognitive Persistence" desc="Long-term memory linkage for cross-session recall." color="#f59e0b" />
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </Box>
    );
};

export default SystemBlueprint;