import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';

import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useCancelJobMutation,
  useGetQueueJobsQuery,
} from '../store/api/newsApi';

// Define the job type based on the API response
type JobData = {
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
  updated_at?: string;
};

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Set page title
  useDocumentTitle('Job Monitoring');

  // Fetch jobs data
  const { data: jobs, isLoading, error, refetch } = useGetQueueJobsQuery();
  const [cancelJob] = useCancelJobMutation();

  // Ensure jobsList is always an array
  const jobsList = Array.isArray(jobs) ? jobs : [];

  // Handle job cancellation
  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob(jobId);
      // Refetch jobs to update the list
      refetch();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  // Handle viewing job details and redirect to search with filters
  const handleViewJob = (job: JobData) => {
    if (job.filters && Object.keys(job.filters).length > 0) {
      // Build search params from job filters
      const searchParams = new URLSearchParams();

      if (job.filters.keyword) searchParams.set('keyword', job.filters.keyword);
      if (job.filters.category)
        searchParams.set('category', job.filters.category);
      if (job.filters.source) searchParams.set('source', job.filters.source);
      if (job.filters.from_date)
        searchParams.set('from_date', job.filters.from_date);
      if (job.filters.to_date) searchParams.set('to_date', job.filters.to_date);

      // Navigate to search page with filters
      navigate(`/news/search?${searchParams.toString()}`);
    } else {
      // If no filters, just go to search page
      navigate('/news/search');
    }
  };

  // Get status color for chips
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'queued':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status text for display
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'queued':
        return 'Queued';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  // Format filters for display
  const formatFilters = (filters: any) => {
    if (!filters || Object.keys(filters).length === 0) {
      return 'Default scraping';
    }

    const filterParts = [];
    if (filters.keyword) filterParts.push(`Keyword: ${filters.keyword}`);
    if (filters.category) filterParts.push(`Category: ${filters.category}`);
    if (filters.source) filterParts.push(`Source: ${filters.source}`);
    if (filters.from_date) filterParts.push(`From: ${filters.from_date}`);
    if (filters.to_date) filterParts.push(`To: ${filters.to_date}`);

    return filterParts.join(', ') || 'Default scraping';
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Job Monitoring
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Job Monitoring
        </Typography>
        <Typography color='error'>
          Failed to load jobs. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          pb: isMobile ? 4 : 3, // Extra bottom padding on mobile for better scrolling
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? 2 : 0,
            mb: 3,
          }}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component='h1'
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Job Monitoring
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-end',
              alignSelf: isMobile ? 'center' : 'flex-end',
            }}
          >
            <Tooltip title='Refresh jobs'>
              <IconButton
                onClick={() => refetch()}
                color='primary'
                size={isMobile ? 'large' : 'medium'}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Job Statistics */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 100,
                }}
              >
                <Typography
                  color='textSecondary'
                  gutterBottom
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  Total Jobs
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1.75rem' : '2rem',
                    color: 'primary.main',
                  }}
                >
                  {jobsList?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 100,
                }}
              >
                <Typography
                  color='textSecondary'
                  gutterBottom
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  Completed
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1.75rem' : '2rem',
                    color: 'success.main',
                  }}
                >
                  {jobsList?.filter(job => job.status === 'completed')
                    ?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 100,
                }}
              >
                <Typography
                  color='textSecondary'
                  gutterBottom
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  In Progress
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1.75rem' : '2rem',
                    color: 'info.main',
                  }}
                >
                  {jobsList?.filter(job => job.status === 'in_progress')
                    ?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 100,
                }}
              >
                <Typography
                  color='textSecondary'
                  gutterBottom
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  Queued
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1.75rem' : '2rem',
                    color: 'warning.main',
                  }}
                >
                  {jobsList?.filter(job => job.status === 'queued')?.length ||
                    0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Jobs Table */}
        {!jobsList || jobsList.length === 0 ? (
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              textAlign: 'center',
              mx: isMobile ? 1 : 0, // Add horizontal margin on mobile
            }}
          >
            <Typography
              variant={isMobile ? 'h6' : 'h6'}
              color='textSecondary'
              sx={{ mb: isMobile ? 1 : 1 }}
            >
              No jobs found
            </Typography>
            <Typography
              color='textSecondary'
              variant={isMobile ? 'body2' : 'body1'}
            >
              Jobs will appear here when you initiate news scraping.
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              overflowX: 'auto', // Enable horizontal scrolling only for the table
              overflowY: 'visible',
              // Create a contained scrolling area
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                },
              },
            }}
          >
            <Table
              sx={{
                minWidth: 650, // Fixed minimum width that ensures all columns are readable
                width: '100%',
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Progress
                  </TableCell>
                  <TableCell sx={{ minWidth: 200, fontWeight: 'bold' }}>
                    Filters
                  </TableCell>
                  <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Created
                  </TableCell>
                  <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Completed
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobsList?.map((job: JobData) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {job.type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(job.status)}
                        color={getStatusColor(job.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 100,
                        }}
                      >
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant='determinate'
                            value={job.progress}
                            color={
                              job.status === 'completed' ? 'success' : 'primary'
                            }
                          />
                        </Box>
                        <Typography variant='body2' color='textSecondary'>
                          {job.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ maxWidth: 200 }}>
                        {formatFilters(job.filters)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {formatDate(job.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {formatDate(job.completed_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {job.status === 'queued' && (
                          <Tooltip title='Cancel job'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleCancelJob(job.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title='View details and search with filters'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleViewJob(job)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default JobsPage;
