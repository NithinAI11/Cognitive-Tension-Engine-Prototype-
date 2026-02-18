import React, { useState } from 'react';
import { Modal, Box, Typography, IconButton, Fade, Backdrop, Tabs, Tab, Snackbar, Alert, Grid, Chip, Tooltip, Link, CircularProgress } from '@mui/material';
import { X, Sparkles, Copy, Download, BrainCircuit, Activity, FileText, Lock, ShieldCheck, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CitationBadge = ({ id, evidence }) => {
    const index = parseInt(id) - 1;
    const source = evidence && evidence[index];

    if (!source) return <Chip label={`[${id}]`} size="small" variant="outlined" sx={{ mx: 0.5, height: 18, fontSize: 10, verticalAlign: 'middle' }} />;

    return (
        <Tooltip 
            arrow placement="top"
            title={
                <Box sx={{ p: 1, maxWidth: 300 }}>
                    <Typography variant="caption" fontWeight={700} display="block" gutterBottom>{source.title || "Source Evidence"}</Typography>
                    <Typography variant="body2" fontSize={11} paragraph sx={{ opacity: 0.8 }}>{source.content.substring(0, 150)}...</Typography>
                    <Link href={source.source_url} target="_blank" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10 }}>
                        <ExternalLink size={10} /> {new URL(source.source_url).hostname}
                    </Link>
                </Box>
            }
        >
            <Chip 
                label={id} size="small" clickable onClick={() => window.open(source.source_url, '_blank')}
                sx={{ mx: 0.5, height: 20, width: 20, fontSize: 10, fontWeight: 700, bgcolor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', '&:hover': { bgcolor: '#0284c7', color: 'white' }, verticalAlign: 'middle' }} 
            />
        </Tooltip>
    );
};

const ModernTable = (props) => (
    <Box sx={{ width: '100%', overflowX: 'auto', my: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} {...props} />
    </Box>
);

const SynthesisModal = ({ open, onClose, content, provenance, divergence, evidence }) => {
  const [copied, setCopied] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => setTabValue(newValue);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content || ""], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `CTE_Strategic_Brief.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderContentWithCitations = (text) => {
      if (!text) return null;
      const parts = text.split(/(\[\[\d+\]\])/g);
      return parts.map((part, i) => {
          const match = part.match(/\[\[(\d+)\]\]/);
          if (match) return <CitationBadge key={i} id={match[1]} evidence={evidence} />;
          return part;
      });
  };

  const components = {
      h1: ({node, ...props}) => <Typography variant="h4" fontWeight={800} sx={{ mt: 2, mb: 3, pb: 2, borderBottom: '2px solid #0f172a', background: '-webkit-linear-gradient(45deg, #0f172a 30%, #334155 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} {...props} />,
      h2: ({node, ...props}) => <Typography variant="h6" fontWeight={700} sx={{ mt: 5, mb: 2, color: '#334155', display: 'flex', alignItems: 'center', gap: 1, '&:before': { content: '""', width: 6, height: 24, bgcolor: 'primary.main', borderRadius: 4, mr: 1 } }} {...props} />,
      h3: ({node, ...props}) => <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3, mb: 1, color: '#475569' }} {...props} />,
      table: ModernTable,
      thead: props => <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }} {...props} />,
      th: props => <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }} {...props} />,
      tr: props => <tr style={{ borderBottom: '1px solid #f1f5f9' }} {...props} />,
      td: props => <td style={{ padding: '16px', color: '#334155', lineHeight: 1.6 }} {...props} />,
      // FIXED: Use 'div' instead of 'p' to avoid nesting errors with Chips
      p: ({node, children, ...props}) => (
          <Typography component="div" variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: '#475569' }} {...props}>
              {React.Children.map(children, child => (typeof child === 'string' ? renderContentWithCitations(child) : child))}
          </Typography>
      ),
      li: ({node, children, ...props}) => (
          <Box component="li" sx={{ mb: 1, color: '#475569', lineHeight: 1.6 }} {...props}>
               {React.Children.map(children, child => (typeof child === 'string' ? renderContentWithCitations(child) : child))}
          </Box>
      )
  };

  // Safe Drivers Check
  const drivers = provenance && Array.isArray(provenance.drivers) ? provenance.drivers : [];

  return (
    <>
    <Modal
        open={open} onClose={onClose} closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500, sx: { backdropFilter: 'blur(8px)', bgcolor: 'rgba(9, 9, 11, 0.8)' } } }}
    >
        <Fade in={open}>
            <Box sx={{ position: 'absolute', top: '5%', left: '10%', right: '10%', bottom: '5%', bgcolor: 'background.paper', borderRadius: 4, outline: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 2, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'primary.light', color: 'primary.main' }}><Sparkles size={20} /></Box>
                        <Box><Typography variant="subtitle1" fontWeight={800}>Strategic Intelligence Brief</Typography><Typography variant="caption" color="text.secondary">Confidential • Generated by CTE Swarm</Typography></Box>
                    </Box>
                    <Tabs value={tabValue} onChange={handleChange} sx={{ minHeight: 0 }}>
                        <Tab icon={<FileText size={16}/>} iconPosition="start" label="Brief" sx={{ minHeight: 0, fontWeight: 600 }} />
                        <Tab icon={<BrainCircuit size={16}/>} iconPosition="start" label="System Internals" sx={{ minHeight: 0, fontWeight: 600 }} />
                    </Tabs>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleDownload} size="small"><Download size={18} /></IconButton>
                        <IconButton onClick={handleCopy} size="small"><Copy size={18} /></IconButton>
                        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#f8fafc', p: 4 }}>
                    {tabValue === 0 && (
                        <Box sx={{ maxWidth: 900, mx: 'auto', bgcolor: 'white', p: 8, pt: 6, borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', minHeight: '100%' }}>
                            {content ? (<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>) : (<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, opacity: 0.5 }}><CircularProgress size={40} sx={{ mb: 2 }} /><Typography variant="body2">Rendering Strategic Brief...</Typography></Box>)}
                        </Box>
                    )}
                    {tabValue === 1 && (
                        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                            <Box sx={{ mb: 3, p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}><Activity size={20} /> Dialectic Math Verification</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>The "Executive Decision" was synthesized using a Shapley attribution model.</Typography>
                                {drivers.length > 0 ? (
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {drivers.map(([key, val]) => (
                                            <Grid item xs={6} md={3} key={key}>
                                                <Box sx={{ p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">{key}</Typography>
                                                    <Typography variant="h5" fontWeight={800} color={val > 0 ? 'success.main' : 'error.main'}>{val > 0 ? '+' : ''}{Number(val).toFixed(3)}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : <Typography variant="body2" color="error" sx={{ bgcolor: '#fee2e2', p: 1, borderRadius: 1 }}>Provenance Data Not Found in Record</Typography>}
                            </Box>
                             <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}><ShieldCheck size={20} /> System Certification</Typography>
                                <Typography variant="body2" color="text.secondary"><b>Divergence Score:</b> {divergence ? divergence.toFixed(4) : "0.0000"}</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Fade>
    </Modal>
    <Snackbar open={copied} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="success" sx={{ width: '100%', borderRadius: 3 }}>Copied to clipboard</Alert></Snackbar>
    </>
  );
};

export default SynthesisModal;