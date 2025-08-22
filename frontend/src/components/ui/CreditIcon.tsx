import React, { useState } from 'react';
import {
  CheckCircle as SuccessIcon,
  CreditCard as CreditCardIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

import { useCredits } from '../../hooks/useCredits';

interface CreditIconProps {
  userId?: string;
}

export const CreditIcon: React.FC<CreditIconProps> = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const {
    remaining,
    maxCredits,
    usedThisMonth,
    getCreditStatus,
    getTimeUntilReset,
  } = useCredits(userId);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const creditPercentage = (remaining / maxCredits) * 100;
  const isLowCredits = remaining <= 1;
  const isMediumCredits = remaining <= 2;

  const getCreditColor = () => {
    if (isLowCredits) return 'error';
    if (isMediumCredits) return 'warning';
    return 'success';
  };

  const getCreditIcon = () => {
    if (isLowCredits) return <WarningIcon fontSize='small' color='error' />;
    if (isMediumCredits) return <TimerIcon fontSize='small' color='warning' />;
    return <SuccessIcon fontSize='small' color='success' />;
  };

  return (
    <>
      <IconButton color='inherit' onClick={handleClick} sx={{ ml: 1 }}>
        <Badge
          badgeContent={remaining}
          color={getCreditColor()}
          max={maxCredits}
        >
          <CreditCardIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 350 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='h6'>Search Credits</Typography>
          <Typography variant='body2' color='text.secondary'>
            {getCreditStatus()}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* Credit Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant='body2'>Credits Remaining</Typography>
              <Typography variant='body2' fontWeight='bold'>
                {remaining} / {maxCredits}
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={creditPercentage}
              color={getCreditColor()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Credit Info */}
          <Box sx={{ mb: 2 }}>
            <MenuItem>
              <ListItemIcon>{getCreditIcon()}</ListItemIcon>
              <ListItemText
                primary='Current Status'
                secondary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Chip
                      label={getCreditStatus()}
                      size='small'
                      color={getCreditColor()}
                      variant='outlined'
                    />
                  </Box>
                }
              />
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <InfoIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='Credits Reset'
                secondary={getTimeUntilReset()}
              />
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <InfoIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='Used This Month'
                secondary={`${usedThisMonth} credits`}
              />
            </MenuItem>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Credit Usage Info */}
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            <strong>How credits work:</strong>
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mb: 0.5 }}
          >
            • Each search job costs 1 credit
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mb: 0.5 }}
          >
            • Credits reset monthly
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mb: 0.5 }}
          >
            • Unused credits don't carry over
          </Typography>
        </Box>

        {isLowCredits && (
          <Box
            sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}
          >
            <Typography variant='body2' fontWeight='bold'>
              ⚠️ Low Credits Warning
            </Typography>
            <Typography variant='caption'>
              You're running low on credits. Consider upgrading your plan for
              unlimited searches.
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};
