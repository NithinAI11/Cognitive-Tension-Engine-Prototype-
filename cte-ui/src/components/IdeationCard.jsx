// FILE: cte_ui/src/components/IdeationCard.jsx
import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Bot, Zap, ShieldAlert, Scale, Maximize2, X, BrainCircuit, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to strip markdown characters for the clean preview
const stripMarkdown = (text) => {
    if (!text) return "";
    return text
        .replace(/#{1,6}\s?/g, '') // Remove Headers
        .replace(/\*\*/g, '')      // Remove Bold
        .replace(/\*/g, '')        // Remove Bullets
        .replace(/`/g, '')         // Remove Code ticks
        .replace(/\[.*?\]\(.*?\)/g, '$1') // Remove Links
        .replace(/>/g, '')         // Remove Blockquotes
        .trim();
};

const IdeationCard = ({ plan }) => {
    const [open, setOpen] = useState(false);
    const p = plan.perspective || "Neutral";
    
    // Theme logic
    let accent = '#8b5cf6'; // Violet (Default)
    let Icon = Bot;
    
    if(p.includes('Accelerationist')) { accent = '#f59e0b'; Icon = Zap; }
    if(p.includes('Skeptic')) { accent = '#ef4444'; Icon = ShieldAlert; }
    if(p.includes('Pragmatist')) { accent = '#3b82f6'; Icon = Scale; }
    if(p.includes('Contrarian') || p.includes('Chaos')) { accent = '#d946ef'; Icon =  BrainCircuit; }

    // Parse Content: Separate Thought from Strategy
    const { thought, strategy } = useMemo(() => {
        const raw = plan.content || "";
        const parts = raw.split("---CORE_STRATEGY---");
        
        if (parts.length > 1) {
            return { thought: parts[0].trim(), strategy: parts[1].trim() };
        }
        // Fallback if separator missing (older runs or error)
        return { thought: "Processing strategic vector...", strategy: raw };
    }, [plan.content]);

    return (
        <>
            <Paper sx={{ 
                p: 0, 
                height: '100%',
                display: 'flex', flexDirection: 'column',
                borderRadius: 3,
                position: 'relative', 
                overflow: 'hidden',
                border: '1px solid', borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }
            }}>
                {/* Header: Persona Identity */}
                <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                            p: 1, borderRadius: '10px', 
                            bgcolor: `${accent}15`, color: accent 
                        }}>
                            <Icon size={18} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            {p}
                        </Typography>
                    </Box>
                </Box>
                
                {/* Internal Thought Section (The "Why") */}
                {thought && (
                    <Box sx={{ 
                        p: 2.5, bgcolor: 'background.subtle', 
                        borderBottom: '1px solid', borderColor: 'divider',
                        display: 'flex', gap: 1.5 
                    }}>
                        <Quote size={16} style={{ flexShrink: 0, marginTop: 4, opacity: 0.4 }} />
                        <Typography variant="body2" sx={{ 
                            fontSize: '0.85rem', fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6,
                            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                            {thought}
                        </Typography>
                    </Box>
                )}

                {/* Plan Preview (Clean Text) */}
                <Box sx={{ p: 2.5, flexGrow: 1, position: 'relative' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        PROPOSED STRATEGY PREVIEW
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ 
                        lineHeight: 1.7, 
                        fontSize: '0.9rem',
                        display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {stripMarkdown(strategy)}
                    </Typography>
                    
                    {/* Fade Gradient */}
                    <Box sx={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, 
                        background: 'linear-gradient(to top, var(--bg-paper) 0%, transparent 100%)',
                        pointerEvents: 'none'
                    }} />
                </Box>

                {/* Action Footer */}
                <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                        fullWidth 
                        variant="outlined"
                        onClick={() => setOpen(true)}
                        startIcon={<Maximize2 size={16} />}
                        sx={{ 
                            borderRadius: '12px', 
                            borderColor: 'divider', 
                            color: 'text.primary',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { borderColor: accent, color: accent, bgcolor: `${accent}05` }
                        }}
                    >
                        Examine Full Plan
                    </Button>
                </Box>
            </Paper>

            {/* Full Content Modal */}
            <Dialog 
                open={open} 
                onClose={() => setOpen(false)} 
                maxWidth="md" 
                fullWidth
                scroll="paper"
                PaperProps={{ sx: { borderRadius: 4, minHeight: '80vh' } }}
            >
                <DialogTitle sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: `${accent}15`, color: accent }}>
                            <Icon size={24} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>{p}</Typography>
                            <Typography variant="caption" color="text.secondary">FULL STRATEGIC DOCUMENTATION</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>
                        <X size={24} />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent dividers sx={{ p: 4 }}>
                    {/* Thought Block in Modal */}
                    <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'background.subtle', borderLeft: `4px solid ${accent}` }}>
                        <Typography variant="subtitle2" fontWeight={700} color={accent} gutterBottom>
                            AGENT REASONING
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
                            {thought}
                        </Typography>
                    </Box>

                    {/* Markdown Content */}
                    <Box sx={{ 
                        '& h1': { fontSize: '1.8rem', fontWeight: 800, mt: 4, mb: 2, color: 'text.primary' },
                        '& h2': { fontSize: '1.4rem', fontWeight: 700, mt: 4, mb: 2, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1 },
                        '& h3': { fontSize: '1.1rem', fontWeight: 700, mt: 3, mb: 1, color: 'text.primary' },
                        '& p': { fontSize: '1rem', lineHeight: 1.8, mb: 2, color: 'text.secondary' },
                        '& ul, & ol': { pl: 3, mb: 2 },
                        '& li': { mb: 1, color: 'text.secondary' },
                        '& strong': { color: 'text.primary', fontWeight: 700 },
                        '& blockquote': { borderLeft: `4px solid ${accent}`, pl: 2, my: 2, fontStyle: 'italic', color: 'text.secondary' }
                    }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {strategy}
                        </ReactMarkdown>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IdeationCard;