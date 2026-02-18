import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, Grid, IconButton, LinearProgress, CircularProgress } from '@mui/material';
import { Bot, Maximize2, X, Brain, ShieldAlert, Zap, Scale, Gavel, Quote, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 1. Helper to remove Markdown symbols (#, *) for clean previews
const stripMarkdown = (text) => {
    if (!text) return "";
    return text
        .replace(/#{1,6}\s?/g, '') 
        .replace(/\*\*/g, '')      
        .replace(/\*/g, '')        
        .replace(/`/g, '')         
        .replace(/>/g, '')         
        .trim();
};

// 2. Beautiful Circular Metric for the Modal
const CircleMetric = ({ value, label, color }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress 
                variant="determinate" value={100} size={60} thickness={4} 
                sx={{ color: 'action.hover', position: 'absolute' }} 
            />
            <CircularProgress 
                variant="determinate" value={value * 10} size={60} thickness={4} 
                sx={{ color: color, strokeLinecap: 'round' }} 
            />
            <Typography variant="body2" fontWeight={800} sx={{ position: 'absolute', color: 'text.primary' }}>
                {value}
            </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
            {label}
        </Typography>
    </Box>
);

const DetailedPlanCard = ({ plan, review }) => {
    const [open, setOpen] = useState(false);
    
    // Safety Data
    const s = review?.scores || { logic: 0, assumptions: 0, grounding: 0, risk: 0 };
    const thought = review?.thought || "Analyzing strategic vector...";
    const rationale = review?.rationale || "Processing verdict...";
    const p = plan.perspective || "Neutral";
    
    // Theme Logic
    let accent = '#8b5cf6';
    let Icon = Bot;
    if(p.includes('Accelerationist')) { accent = '#f59e0b'; Icon = Zap; }
    if(p.includes('Skeptic')) { accent = '#ef4444'; Icon = ShieldAlert; }
    if(p.includes('Pragmatist')) { accent = '#3b82f6'; Icon = Scale; }
    
    const avgScore = ((s.logic + s.assumptions + s.grounding + s.risk) / 4).toFixed(1);

    // Markdown styles for the modal content
    const markdownStyles = {
        '& h1, & h2, & h3': { color: 'text.primary', fontWeight: 800, mt: 2, mb: 1 },
        '& p': { color: 'text.secondary', lineHeight: 1.7, mb: 2, fontSize: '0.95rem' },
        '& strong': { color: 'text.primary', fontWeight: 700 },
        '& ul': { pl: 3, mb: 2 },
        '& li': { color: 'text.secondary', mb: 0.5 }
    };

    return (
        <>
            {/* --- CARD DESIGN (Matches IdeationCard) --- */}
            <Paper sx={{ 
                p: 0, height: '100%', display: 'flex', flexDirection: 'column',
                borderRadius: 3, position: 'relative', overflow: 'hidden',
                border: '1px solid', borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }
            }}>
                {/* Header */}
                <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: `${accent}15`, color: accent }}>
                            <Icon size={18} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.primary', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            {p}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, color: accent }}>{avgScore}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 700 }}>SCORE</Typography>
                    </Box>
                </Box>
                
                {/* Preview Content (Thought Bubble) */}
                <Box sx={{ p: 2.5, flexGrow: 1, position: 'relative', bgcolor: 'background.default' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Brain size={12} /> CRITIC'S THOUGHT PROCESS
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.6, fontStyle: 'italic',
                        display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        "{stripMarkdown(thought)}"
                    </Typography>
                </Box>

                {/* Footer Action */}
                <Box sx={{ p: 2, pt: 0, bgcolor: 'background.default' }}>
                    <Button 
                        fullWidth variant="outlined" size="small"
                        onClick={() => setOpen(true)}
                        startIcon={<Maximize2 size={16} />}
                        sx={{ 
                            borderRadius: '12px', borderColor: 'divider', color: 'text.primary', fontWeight: 600,
                            '&:hover': { borderColor: accent, color: accent, bgcolor: `${accent}05` }
                        }}
                    >
                        Read Full Evaluation
                    </Button>
                </Box>
            </Paper>

            {/* --- SINGLE COLUMN BEAUTIFUL MODAL --- */}
            <Dialog 
                open={open} 
                onClose={() => setOpen(false)} 
                maxWidth="sm" 
                fullWidth
                scroll="paper"
                PaperProps={{ sx: { borderRadius: 4, minHeight: '60vh' } }}
            >
                {/* 1. Modal Header */}
                <DialogTitle sx={{ 
                    p: 3, borderBottom: '1px solid', borderColor: 'divider', 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: 'background.paper'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${accent}15`, color: accent }}>
                            <Gavel size={24} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>Evaluation Report</Typography>
                            <Typography variant="caption" color="text.secondary">Reviewing Agent: {p}</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setOpen(false)}><X size={20} /></IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0, bgcolor: 'background.default' }}>
                    
                    {/* 2. Score Dashboard (Hero Section) */}
                    <Box sx={{ 
                        p: 4, bgcolor: 'background.paper', 
                        borderBottom: '1px solid', borderColor: 'divider',
                        display: 'flex', justifyContent: 'center', gap: 4
                    }}>
                        <CircleMetric value={s.logic} label="LOGIC" color="#3b82f6" />
                        <CircleMetric value={s.assumptions} label="ADHERENCE" color="#8b5cf6" />
                        <CircleMetric value={s.grounding} label="EVIDENCE" color="#10b981" />
                        <CircleMetric value={s.risk} label="SAFETY" color="#ef4444" />
                    </Box>

                    {/* 3. Content Flow */}
                    <Box sx={{ p: 4 }}>
                        
                        {/* A. Internal Monologue (Distinct Style) */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
                                INTERNAL CRITIQUE
                            </Typography>
                            <Paper elevation={0} sx={{ 
                                p: 3, borderRadius: 3, 
                                bgcolor: `${accent}08`, borderLeft: `4px solid ${accent}`,
                                display: 'flex', gap: 2 
                            }}>
                                <Quote size={20} color={accent} style={{ flexShrink: 0, marginTop: 4, opacity: 0.6 }} />
                                <Box sx={markdownStyles}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {thought}
                                    </ReactMarkdown>
                                </Box>
                            </Paper>
                        </Box>

                        {/* B. Formal Verdict (Clean Typography) */}
                        <Box>
                            <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
                                FINAL VERDICT & RATIONALE
                            </Typography>
                            <Box sx={{ 
                                ...markdownStyles, 
                                p: 3, bgcolor: 'background.paper', borderRadius: 3, 
                                border: '1px solid', borderColor: 'divider',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {rationale}
                                </ReactMarkdown>
                            </Box>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DetailedPlanCard;