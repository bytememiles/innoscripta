import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

import { Logo } from '../components/ui/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Set page title
  useDocumentTitle('Page Not Found');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <Logo height={64} sx={{ mb: 2 }} />
      <Typography
        variant='h1'
        component='h1'
        sx={{ fontSize: '6rem', fontWeight: 'bold' }}
      >
        404
      </Typography>
      <Typography variant='h4' component='h2' gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant='contained' onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};
