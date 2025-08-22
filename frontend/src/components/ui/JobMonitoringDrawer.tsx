import React, { useEffect, useState } from 'react';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { useGetQueueJobsQuery } from '../../store/api/newsApi';

interface Job {
  id: string;
  type: string;
  status: string;
  filters: any;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error_message?: string;
  progress: number;
}

interface JobsResponse {
  success: boolean;
  data: Job[];
}

interface JobMonitoringDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const JobMonitoringDrawer: React.FC<JobMonitoringDrawerProps> = ({
  open,
  onClose,
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: jobsResponse, refetch, isLoading } = useGetQueueJobsQuery();

  // Ensure jobs is always an array and extract from response
  const jobs: Job[] = Array.isArray(jobsResponse)
    ? jobsResponse
    : jobsResponse && typeof jobsResponse === 'object' && 'data' in jobsResponse
      ? (jobsResponse as JobsResponse).data
      : [];

  // Auto-refresh every 5 seconds when open
  useEffect(() => {
    if (!open || !autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, [open, autoRefresh, refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'default';
      case 'started':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <ScheduleIcon fontSize='small' />;
      case 'started':
        return <PlayIcon fontSize='small' />;
      case 'in_progress':
        return <PlayIcon fontSize='small' />;
      case 'completed':
        return <CheckIcon fontSize='small' />;
      case 'failed':
        return <ErrorIcon fontSize='small' />;
      case 'cancelled':
        return <CancelIcon fontSize='small' />;
      default:
        return <ScheduleIcon fontSize='small' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued':
        return 'Queued';
      case 'started':
        return 'Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFilterSummary = (filters: any) => {
    const parts = [];
    if (filters.keyword) parts.push(`"${filters.keyword}"`);
    if (filters.category) parts.push(filters.category);
    if (filters.source) parts.push(filters.source);
    if (filters.from_date) parts.push(`from ${filters.from_date}`);
    if (filters.to_date) parts.push(`to ${filters.to_date}`);

    return parts.length > 0 ? parts.join(' • ') : 'General scraping';
  };

  const activeJobs = jobs.filter(job =>
    ['queued', 'started', 'in_progress'].includes(job.status)
  );

  const completedJobs = jobs.filter(job =>
    ['completed', 'failed', 'cancelled'].includes(job.status)
  );

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 800, maxWidth: '90vw' },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant='h5' component='h2'>
            Job Monitoring
          </Typography>
          <Box>
            <Tooltip title='Refresh'>
              <IconButton onClick={() => refetch()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Auto-refresh toggle */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            size='small'
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            startIcon={<RefreshIcon />}
          >
            {autoRefresh ? 'Stop Auto-refresh' : 'Start Auto-refresh'}
          </Button>
          <Typography variant='caption' color='text.secondary'>
            Auto-refresh every 5 seconds
          </Typography>
        </Box>

        {/* Active Jobs Table */}
        {activeJobs.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant='h6' color='primary' sx={{ mb: 2 }}>
              Active Jobs ({activeJobs.length})
            </Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Filters</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Started</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeJobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(job.status)}
                          label={getStatusText(job.status)}
                          color={getStatusColor(job.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' textTransform='capitalize'>
                          {job.type.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ maxWidth: 200 }}>
                          {getFilterSummary(job.filters)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <LinearProgress
                            variant='determinate'
                            value={job.progress}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant='caption'>
                            {job.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {formatDate(job.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {job.started_at ? formatDate(job.started_at) : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Completed Jobs Table */}
        {completedJobs.length > 0 && (
          <Box>
            <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
              Recent Completed Jobs ({completedJobs.length})
            </Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Filters</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedJobs.slice(0, 10).map(job => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(job.status)}
                          label={getStatusText(job.status)}
                          color={getStatusColor(job.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' textTransform='capitalize'>
                          {job.type.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ maxWidth: 200 }}>
                          {getFilterSummary(job.filters)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {formatDate(job.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {job.completed_at
                            ? formatDate(job.completed_at)
                            : job.failed_at
                              ? formatDate(job.failed_at)
                              : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {job.error_message && (
                          <Tooltip title={job.error_message}>
                            <Typography
                              variant='caption'
                              color='error'
                              sx={{ cursor: 'help' }}
                            >
                              {job.error_message.length > 30
                                ? job.error_message.substring(0, 30) + '...'
                                : job.error_message}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* No jobs message */}
        {jobs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant='body1' color='text.secondary'>
              No jobs found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Jobs will appear here when you initiate scraping
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
