// FILE: cte_ui/src/components/EvidenceExplorer.jsx
import React from 'react';
import { Box, Typography, Paper, Link, Chip } from '@mui/material';
import { ExternalLink, Search, Globe } from 'lucide-react';

const EvidenceCard = ({ item }) => (
    <Paper sx={{ p: 2, mb: 2, borderLeft: '3px solid', borderColor: 'primary.main', bgcolor: 'background.subtle' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip label={item.contradiction_type} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
            <Chip label={item.source_type} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
        </Box>
        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.9rem' }}>
            {item.content}
        </Typography>
        <Link href={item.source_url} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <Globe size={12} /> {new URL(item.source_url).hostname} <ExternalLink size={12} />
        </Link>
    </Paper>
);

const EvidenceExplorer = ({ evidence }) => {
    return (
        <Box sx={{ height: 400, overflowY: 'auto', pr: 1 }}>
            {evidence.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Search size={32} style={{ opacity: 0.3 }} />
                    <Typography variant="caption" display="block">Waiting for swarm data...</Typography>
                </Box>
            ) : (
                evidence.map((e, i) => <EvidenceCard key={i} item={e} />)
            )}
        </Box>
    );
};

export default EvidenceExplorer;