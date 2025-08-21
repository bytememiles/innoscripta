import type React from 'react';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// ==============================|| LOADING COMPONENT ||============================== //

const Loader: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1301,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    }}
  >
    <CircularProgress />
  </Box>
);

// ==============================|| LOADABLE COMPONENT WRAPPER ||============================== //

export const Loadable = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={<Loader />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
