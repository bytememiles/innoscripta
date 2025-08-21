import type React from 'react';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

import { useTheme as useCustomTheme } from '../../theme/ThemeProvider';
import { Logo } from '../ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        position: 'relative',
      }}
    >
      {/* Theme Toggle */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      <Container maxWidth='sm'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* Logo and Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <Logo height={46} />
          </Box>

          <Typography
            variant='body1'
            color='text.secondary'
            textAlign='center'
            sx={{ mb: 4 }}
          >
            Stay informed with news from multiple trusted sources
          </Typography>
        </Box>

        {/* Auth Form Container */}
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[8],
          }}
        >
          {children}
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            © 2024 News Aggregator. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
