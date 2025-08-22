import React, { useEffect, useState } from 'react';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';

import { useGetQueueJobsQuery } from '../../store/api/newsApi';

interface Job {
  id: string;
  type: string;
  status: string;
  filters: Record<string, string | undefined>;
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

export const JobMonitoringPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    data: jobsResponse,
    refetch,
    isLoading,
    error,
  } = useGetQueueJobsQuery();

  // Ensure jobs is always an array and extract from response
  const jobs: Job[] = Array.isArray(jobsResponse)
    ? jobsResponse
    : jobsResponse && typeof jobsResponse === 'object' && 'data' in jobsResponse
      ? (jobsResponse as JobsResponse).data
      : [];

  // Auto-refresh every 5 seconds when expanded
  useEffect(() => {
    if (!expanded || !autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, [expanded, autoRefresh, refetch]);

  // If there's an error, don't show the component
  if (error) {
    return null;
  }

  // Additional safety check - ensure jobs is always an array
  if (!Array.isArray(jobs)) {
    return null;
  }

  // Don't show anything if there are no jobs
  if (jobs.length === 0) {
    return null;
  }

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

  const getFilterSummary = (filters: Record<string, string | undefined>) => {
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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant='h6' component='h3'>
            Background Jobs ({activeJobs.length} active)
          </Typography>
          <Box>
            <IconButton
              size='small'
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton size='small' onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {activeJobs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
              Active Jobs
            </Typography>
            {activeJobs.map(job => (
              <Box
                key={job.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography variant='body2' fontWeight='medium'>
                    {getFilterSummary(job.filters)}
                  </Typography>
                  <Chip
                    label={getStatusText(job.status)}
                    color={getStatusColor(job.status)}
                    size='small'
                  />
                </Box>

                {job.progress > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant='determinate'
                      value={job.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {job.progress}% complete
                    </Typography>
                  </Box>
                )}

                <Typography variant='caption' color='text.secondary'>
                  Created: {formatDate(job.created_at)}
                  {job.started_at &&
                    ` • Started: ${formatDate(job.started_at)}`}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Collapse in={expanded}>
          {completedJobs.length > 0 && (
            <Box>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                sx={{ mb: 1 }}
              >
                Recent Completed Jobs
              </Typography>
              <List dense>
                {completedJobs.slice(0, 5).map(job => (
                  <ListItem key={job.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={getFilterSummary(job.filters)}
                      secondary={
                        <Box>
                          <Typography variant='caption' component='div'>
                            {formatDate(job.created_at)}
                            {job.completed_at &&
                              ` • Completed: ${formatDate(job.completed_at)}`}
                            {job.failed_at &&
                              ` • Failed: ${formatDate(job.failed_at)}`}
                          </Typography>
                          {job.error_message && (
                            <Typography
                              variant='caption'
                              color='error'
                              component='div'
                            >
                              Error: {job.error_message}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={getStatusText(job.status)}
                        color={getStatusColor(job.status)}
                        size='small'
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <IconButton
              size='small'
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ alignSelf: 'center' }}
            >
              Auto-refresh every 5 seconds
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
