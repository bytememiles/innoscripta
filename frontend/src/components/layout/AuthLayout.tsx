import type React from 'react';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { Box, Grid, IconButton, Typography } from '@mui/material';

import { useTheme as useCustomTheme } from '../../theme/ThemeProvider';
import { AuthBackground, AuthCard } from '../auth';
import { Logo } from '../ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { mode, toggleTheme } = useCustomTheme();

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Abstract Background */}
      <AuthBackground />

      {/* Theme Toggle */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          boxShadow: 2,
        }}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      {/* Main Grid Layout */}
      <Grid container direction='column' justifyContent='flex-end'>
        {/* Logo Section */}
        <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Logo height={46} />
          </Box>
        </Grid>

        {/* Centered Auth Card Section */}
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent='center'
            alignItems='center'
            sx={{
              minHeight: {
                xs: 'calc(100vh - 210px)',
                md: 'calc(100vh - 151px)',
              },
            }}
          >
            <AuthCard>{children}</AuthCard>
          </Grid>
        </Grid>

        {/* Footer Section */}
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              © 2025 News Aggregator. All rights reserved.
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 0.5, opacity: 0.7 }}
            >
              Stay informed with news from multiple trusted sources
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
