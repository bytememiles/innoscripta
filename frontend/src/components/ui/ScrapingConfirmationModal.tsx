import React from 'react';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';

import type { ArticleFilters } from '../../types';

interface ScrapingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  filters: ArticleFilters;
  isLoading?: boolean;
  remainingCredits?: number;
  maxCredits?: number;
}

export const ScrapingConfirmationModal: React.FC<
  ScrapingConfirmationModalProps
> = ({
  open,
  onClose,
  onConfirm,
  filters,
  isLoading = false,
  remainingCredits = 5,
  maxCredits = 5,
}) => {
  const getFilterSummary = (filters: ArticleFilters) => {
    const parts = [];
    if (filters.keyword) parts.push(`"${filters.keyword}"`);
    if (filters.category) parts.push(filters.category);
    if (filters.source) parts.push(filters.source);
    if (filters.from_date) parts.push(`from ${filters.from_date}`);
    if (filters.to_date) parts.push(`to ${filters.to_date}`);

    return parts.length > 0 ? parts.join(' • ') : 'General scraping';
  };

  const creditPercentage = (remainingCredits / maxCredits) * 100;
  const isLowCredits = remainingCredits <= 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Confirm News Scraping</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' gutterBottom>
            You're about to initiate a news scraping job with the following
            filters:
          </Typography>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant='body2' fontWeight='medium'>
              {getFilterSummary(filters)}
            </Typography>
          </Box>
        </Box>

        {/* Credit Information */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CreditCardIcon color='primary' fontSize='small' />
            <Typography variant='subtitle2' color='primary'>
              Credit Required: 1
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
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
                {remainingCredits} / {maxCredits}
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={creditPercentage}
              color={isLowCredits ? 'error' : 'primary'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {isLowCredits && (
            <Typography variant='caption' color='error'>
              ⚠️ Low credits remaining. Use wisely!
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>What happens next:</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • A background job will be created to scrape news
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • You can monitor progress in the Job Monitoring panel
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • Estimated completion time: 2-5 minutes
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • 1 credit will be deducted from your account
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          disabled={isLoading || remainingCredits <= 0}
          startIcon={
            isLoading ? <LinearProgress sx={{ width: 16, height: 16 }} /> : null
          }
        >
          {isLoading ? 'Initiating...' : 'Start Scraping'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
