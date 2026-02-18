// FILE: cte_ui/src/components/CTELogo.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const CTELogo = ({ collapsed = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="12" fill="#8b5cf6" fillOpacity="0.2"/>
      <path d="M20 10V30" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M10 20H30" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="6" fill="#8b5cf6"/>
      <circle cx="10" cy="10" r="2" fill="#8b5cf6"/>
      <circle cx="30" cy="30" r="2" fill="#8b5cf6"/>
    </svg>
    {!collapsed && (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: -0.5, color: 'text.primary' }}>
                CTE
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'primary.main' }}>
                ENGINE
            </Typography>
        </Box>
    )}
  </Box>
);

export default CTELogo;