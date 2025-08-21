import type React from 'react';
import { Box, type BoxProps } from '@mui/material';

interface LogoProps extends Omit<BoxProps, 'component'> {
  height?: number | string;
  width?: number | string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  height = 46,
  width = 'auto',
  alt = 'Innoscripta Logo',
  sx = {},
  ...props
}) => {
  return (
    <Box
      component="img"
      src="/innoscripta-logo-blue.svg"
      alt={alt}
      sx={{
        height,
        width,
        display: 'block',
        ...sx,
      }}
      {...props}
    />
  );
};
