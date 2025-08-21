import type React from 'react';
import { Box, Card, type CardProps } from '@mui/material';

interface AuthCardProps extends CardProps {
  children: React.ReactNode;
}

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

export const AuthCard: React.FC<AuthCardProps> = ({ children, ...other }) => (
  <Card
    sx={{
      maxWidth: { xs: 400, lg: 475 },
      margin: { xs: 1, sm: 1.5, md: 2 },
      width: '100%',
      '& > *': {
        flexGrow: 1,
        flexBasis: '50%',
      },
      borderRadius: 3,
      boxShadow: theme => theme.shadows[16],
      border: theme => `1px solid ${theme.palette.divider}20`,
      backdropFilter: 'blur(10px)',
      background: theme =>
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(255, 255, 255, 0.9)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme => theme.shadows[20],
      },
    }}
    {...other}
  >
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
  </Card>
);

export default AuthCard;
