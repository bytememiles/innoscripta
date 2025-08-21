import type React from 'react';
import { Box, useTheme } from '@mui/material';

// ==============================|| AUTH ABSTRACT BACKGROUND ||============================== //

export const AuthBackground: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {/* Abstract geometric patterns */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
            },
            '50%': {
              transform: 'translateY(-20px) rotate(180deg)',
            },
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: `linear-gradient(45deg, ${theme.palette.success.light}15, ${theme.palette.info.light}15)`,
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `linear-gradient(90deg, ${theme.palette.warning.light}15, ${theme.palette.error.light}15)`,
          filter: 'blur(25px)',
          animation: 'float 10s ease-in-out infinite',
        }}
      />

      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(${theme.palette.divider}20 1px, transparent 1px),
            linear-gradient(90deg, ${theme.palette.divider}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
        }}
      />
    </Box>
  );
};

export default AuthBackground;
