import type React from 'react';
import { Box, Typography } from '@mui/material';

import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ProfilePage: React.FC = () => {
  // Set page title
  useDocumentTitle('Profile');

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Profile
      </Typography>
      <Typography variant='body1'>
        User profile and preferences will be implemented here.
      </Typography>
    </Box>
  );
};
