import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#8b5cf6' : '#a78bfa', // Violet-500 / Violet-400
      light: '#ddd6fe',
      dark: '#7c3aed',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#020617', // Slate-50 / Slate-950
      paper: mode === 'light' ? '#ffffff' : '#0f172a',
      subtle: mode === 'light' ? '#f1f5f9' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { letterSpacing: '-0.02em', fontWeight: 600 },
    h2: { letterSpacing: '-0.02em', fontWeight: 600 },
    h3: { letterSpacing: '-0.02em', fontWeight: 600 },
    h4: { letterSpacing: '-0.02em', fontWeight: 600 },
    h6: { letterSpacing: '-0.01em', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: {
    borderRadius: 20, // Super soft corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          padding: '10px 20px',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'light' 
            ? '0px 2px 8px -2px rgba(0,0,0,0.05), 0px 4px 16px -4px rgba(0,0,0,0.02)' 
            : '0px 0px 0px 1px rgba(255,255,255,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: '8px' },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));