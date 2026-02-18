// FILE: cte_ui/src/components/Sidebar.jsx
import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import { LayoutDashboard, History, Database, Settings, Moon, Sun } from 'lucide-react';
import CTELogo from './CTELogo';

const Sidebar = ({ mode, toggleMode, currentView, onViewChange }) => {
  
  const NavItem = ({ view, icon: Icon, label }) => {
      const isActive = currentView === view;
      return (
        <Tooltip title={label} placement="right">
            <IconButton 
                onClick={() => onViewChange(view)}
                sx={{ 
                    borderRadius: '12px', 
                    bgcolor: isActive ? 'primary.light' : 'transparent', 
                    color: isActive ? 'primary.dark' : 'text.secondary',
                    '&:hover': { bgcolor: isActive ? 'primary.light' : 'action.hover', color: isActive ? 'primary.dark' : 'text.primary' },
                    mb: 1
                }}
            >
                <Icon size={22} />
            </IconButton>
        </Tooltip>
      );
  };

  return (
    <Box sx={{ 
        width: 72, 
        height: '100vh', 
        bgcolor: 'background.paper', 
        borderRight: '1px solid', 
        borderColor: 'divider',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        position: 'fixed', left: 0, top: 0, zIndex: 1200
    }}>
        {/* Branding Icon */}
        <Box sx={{ mb: 2, transform: 'scale(0.9)' }}>
            <CTELogo collapsed={true} />
        </Box>

        <Divider flexItem sx={{ mx: 2, mb: 2 }} />

        {/* Nav Items */}
        <NavItem view="dashboard" icon={LayoutDashboard} label="Mission Control" />
        <NavItem view="history" icon={History} label="Mission Logs" />
        <NavItem view="graph" icon={Database} label="Knowledge Graph" />

        <Box sx={{ flexGrow: 1 }} />

        {/* Bottom Actions */}
        <IconButton onClick={toggleMode} sx={{ borderRadius: '12px', color: 'text.secondary', mb: 1 }}>
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
        
        <IconButton sx={{ borderRadius: '12px', color: 'text.secondary' }}>
            <Settings size={20} />
        </IconButton>
    </Box>
  );
};

export default Sidebar;