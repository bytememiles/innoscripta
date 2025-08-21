import type React from 'react';
import { Box, Typography } from '@mui/material';

import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const SearchPage: React.FC = () => {
  // Set page title
  useDocumentTitle('Search');

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Search
      </Typography>
      <Typography variant='body1'>
        Search functionality will be implemented here.
      </Typography>
    </Box>
  );
};
