import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import WorkIcon from '@mui/icons-material/Work';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';

import { ArticleCard, ArticleCardSkeleton } from '../components/ui';
import { JobMonitoringDrawer } from '../components/ui/JobMonitoringDrawer';
import { ScrapingConfirmationModal } from '../components/ui/ScrapingConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  useGetCategoriesQuery,
  useGetFilteredArticlesQuery,
  useGetPersonalizedFeedQuery,
  useGetSourcesQuery,
  useGetUserPreferencesQuery,
  useInitiateScrapingMutation,
} from '../store/api/newsApi';
import type { ArticleFilters, FilteredArticlesResponse } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use localStorage hook for alert dismissal state
  const [_isAlertDismissed, setIsAlertDismissed] = useLocalStorage(
    `personalized_alert_dismissed_${user?.id || 'anonymous'}`,
    false
  );

  // Use credits hook for credit management
  const {
    deductCredit,
    hasCredits,
    remaining: remainingCredits,
  } = useCredits(user?.id);

  const isInitialLoad = useRef(true);

  // Set page title
  useDocumentTitle('Search Articles');

  // Get query parameters
  const query = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const source = searchParams.get('source') || '';
  const fromDate = searchParams.get('from_date') || '';
  const toDate = searchParams.get('to_date') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // State for form inputs (separate from search params)
  const [formInputs, setFormInputs] = useState({
    keyword: query || '',
    category: category || '',
    source: source || '',
    fromDate: fromDate || '',
    toDate: toDate || '',
  });

  // State for search params (what's actually being searched)
  const [_searchParamsState, setSearchParamsState] = useState({
    keyword: query || '',
    category: category || '',
    source: source || '',
    from_date: fromDate || '',
    to_date: toDate || '',
    page: page || '1',
  });

  // Scraping confirmation state
  const [showScrapingModal, setShowScrapingModal] = useState(false);
  const [scrapingFilters, setScrapingFilters] = useState<ArticleFilters>({});

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Job monitoring drawer state
  const [showJobMonitoring, setShowJobMonitoring] = useState(false);

  // API queries - use personalized feed for authenticated users when no specific filters are applied
  const hasSpecificFilters = Boolean(
    query || category || source || fromDate || toDate
  );
  const shouldUsePersonalizedFeed = Boolean(user && !hasSpecificFilters);

  // Listen for preference changes from the store
  const { data: userPreferences } = useGetUserPreferencesQuery(undefined, {
    skip: !user,
  });

  // Check if user has meaningful preferences
  const hasMeaningfulPreferences =
    userPreferences &&
    ((userPreferences.preferred_categories &&
      userPreferences.preferred_categories.length > 0) ||
      (userPreferences.preferred_sources &&
        userPreferences.preferred_sources.length > 0) ||
      (userPreferences.preferred_authors &&
        userPreferences.preferred_authors.length > 0));

  // Get personalized feed for authenticated users when no filters applied
  const {
    data: personalizedResults,
    isLoading: personalizedLoading,
    error: personalizedError,
  } = useGetPersonalizedFeedQuery(
    { perPage: 12, page },
    { skip: !shouldUsePersonalizedFeed }
  );

  // Use filtered results for search functionality
  const {
    data: filteredResults,
    isLoading: filteredLoading,
    error: filteredError,
  } = useGetFilteredArticlesQuery(
    {
      keyword: query,
      category: category || undefined,
      source: source || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      page,
      per_page: 12,
      sort_by: query ? 'relevance' : 'published_at', // Use relevance only when there's a keyword
      sort_order: 'desc',
    },

    { skip: shouldUsePersonalizedFeed } // ✅ Skip filtered search when using personalized feed
  );

  // Get categories and sources
  const { data: categories } = useGetCategoriesQuery();
  const { data: sources } = useGetSourcesQuery();

  // Scraping mutation
  const [initiateScraping, { isLoading: isScraping }] =
    useInitiateScrapingMutation();

  // Use personalized results when available, otherwise use filtered results
  const finalResults = shouldUsePersonalizedFeed
    ? personalizedResults
    : filteredResults;
  const finalLoading = shouldUsePersonalizedFeed
    ? personalizedLoading
    : filteredLoading;
  const finalError = shouldUsePersonalizedFeed
    ? personalizedError
    : filteredError;

  // Extract articles and pagination info
  const articles = finalResults?.data || [];
  const totalPages = finalResults?.last_page || 1;
  const totalResults = finalResults?.total || 0;

  // Check if we should show scraping modal (no results and scraping available)
  const shouldShowScrapingModal =
    articles.length === 0 &&
    (finalResults as FilteredArticlesResponse)?.scraping_available === true &&
    !shouldUsePersonalizedFeed;

  // Reset alert when preferences change (but not on initial load)
  useEffect(() => {
    if (
      userPreferences &&
      shouldUsePersonalizedFeed &&
      !isInitialLoad.current
    ) {
      // Only reset if we have meaningful preferences, personalized feed is active, and it's not the initial load
      if (hasMeaningfulPreferences && user) {
        // Clear the dismissed state when preferences are updated
        setIsAlertDismissed(false);
      }
    }
    if (userPreferences && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [userPreferences?.updated_at, user]);

  // Show scraping modal when no results found
  useEffect(() => {
    if (shouldShowScrapingModal) {
      const currentFilters: ArticleFilters = {
        keyword: query,
        category: category || undefined,
        source: source || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      };
      setScrapingFilters(currentFilters);
      setShowScrapingModal(true);
    }
  }, [shouldShowScrapingModal, query, category, source, fromDate, toDate]);

  // Handle scraping confirmation
  const handleScrapingConfirm = async () => {
    // Check if user has credits available
    if (!hasCredits()) {
      setNotification({
        open: true,
        message:
          'No credits available. Please wait for credits to reset or upgrade your plan.',
        severity: 'error',
      });
      return;
    }

    try {
      // Deduct one credit for the scraping job
      const creditUsed = deductCredit();
      if (!creditUsed) {
        setNotification({
          open: true,
          message: 'Failed to deduct credit. Please try again.',
          severity: 'error',
        });
        return;
      }

      const result = await initiateScraping(scrapingFilters).unwrap();
      setShowScrapingModal(false);

      // Show success notification with credit info
      setNotification({
        open: true,
        message: `Scraping job initiated successfully! Job ID: ${result.job_id}. Credit used: 1 (${remainingCredits - 1} remaining)`,
        severity: 'success',
      });

      // Reset search page to default status
      setFormInputs({
        keyword: '',
        category: '',
        source: '',
        fromDate: '',
        toDate: '',
      });
      setSearchParamsState({
        keyword: '',
        category: '',
        source: '',
        from_date: '',
        to_date: '',
        page: '1',
      });

      // Clear URL search params
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('page', '1');
      setSearchParams(newSearchParams);

      // Refetch the filtered results after a short delay
      setTimeout(() => {
        // This will trigger a refetch of the filtered articles
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to initiate scraping:', error);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to initiate scraping job. Please try again later.',
        severity: 'error',
      });
    }
  };

  // Update search params when form changes
  const updateSearchParams = (newParams: Partial<ArticleFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (Object.keys(newParams).some(key => key !== 'page')) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({
      keyword: formInputs.keyword,
      category: formInputs.category,
      source: formInputs.source,
      from_date: formInputs.fromDate,
      to_date: formInputs.toDate,
    });
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof ArticleFilters,
    value: string
  ) => {
    const newValue = value;

    switch (filterType) {
      case 'category':
        setFormInputs(prev => ({ ...prev, category: newValue }));
        break;
      case 'source':
        setFormInputs(prev => ({ ...prev, source: newValue }));
        break;
      case 'from_date':
        setFormInputs(prev => ({ ...prev, fromDate: newValue }));
        break;
      case 'to_date':
        setFormInputs(prev => ({ ...prev, toDate: newValue }));
        break;
    }

    // Don't update search params here - only update form inputs
    // Search params will be updated when search button is clicked
  };

  // Clear all filters
  const clearFilters = () => {
    setFormInputs({
      keyword: '',
      category: '',
      source: '',
      fromDate: '',
      toDate: '',
    });
    setSearchParamsState({
      keyword: '',
      category: '',
      source: '',
      from_date: '',
      to_date: '',
      page: '1',
    });

    // Clear URL search params
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        pb: isMobile ? 4 : 3, // Extra bottom padding on mobile for better scrolling
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* Title and Description */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component='h1'
            gutterBottom
          >
            Search Articles
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            color='text.secondary'
            sx={{ mb: isMobile ? 2 : 0 }}
          >
            Find news articles using keywords, filters, and advanced search
            options
          </Typography>
        </Box>

        {/* Job Monitoring Button - Responsive Layout */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? 2 : 0,
            mb: 2,
          }}
        >
          <Button
            variant='outlined'
            startIcon={<WorkIcon />}
            onClick={() => {
              if (isMobile) {
                navigate('/news/jobs');
              } else {
                setShowJobMonitoring(true);
              }
            }}
            fullWidth={isMobile}
            sx={{
              minWidth: isMobile ? 'auto' : 140,
              height: isMobile ? 48 : 40,
            }}
          >
            {isMobile ? 'View Job Monitoring' : 'Job Monitoring'}
          </Button>
        </Box>

        {/* Credit Display - Responsive */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 1 : 2,
            mb: 2,
            p: isMobile ? 2 : 0,
            bgcolor: isMobile ? 'background.paper' : 'transparent',
            borderRadius: isMobile ? 1 : 0,
            border: isMobile ? 1 : 0,
            borderColor: isMobile ? 'divider' : 'transparent',
          }}
        >
          <Typography
            variant={isMobile ? 'body2' : 'body2'}
            color='text.secondary'
            sx={{ fontWeight: isMobile ? 500 : 400 }}
          >
            Credits remaining:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${remainingCredits}/5`}
              color={
                remainingCredits <= 1
                  ? 'error'
                  : remainingCredits <= 2
                    ? 'warning'
                    : 'success'
              }
              variant='outlined'
              size={isMobile ? 'medium' : 'small'}
            />
            {remainingCredits <= 1 && (
              <Typography
                variant={isMobile ? 'body2' : 'caption'}
                color='error'
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: isMobile ? '0.875rem' : '0.75rem',
                }}
              >
                ⚠️ Low credits - use wisely!
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Job Monitoring Panel - Only show on desktop */}
      {!isMobile && (
        <JobMonitoringDrawer
          open={showJobMonitoring}
          onClose={() => setShowJobMonitoring(false)}
        />
      )}

      {/* Search Form */}
      <Card
        sx={{
          mb: 4,
          p: isMobile ? 2 : 3,
          '& .MuiCardContent-root': {
            p: isMobile ? 2 : 3,
          },
        }}
      >
        <Box component='form' onSubmit={handleSearch}>
          <Grid container spacing={isMobile ? 2 : 3} alignItems='flex-end'>
            {/* Search Input */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Search Articles'
                placeholder='Enter keywords...'
                value={formInputs.keyword}
                onChange={e =>
                  setFormInputs(prev => ({ ...prev, keyword: e.target.value }))
                }
                sx={{ '& .MuiInputBase-root': { height: 56 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formInputs.category}
                  label='Category'
                  onChange={e => handleFilterChange('category', e.target.value)}
                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  {categories?.map(cat => (
                    <MenuItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Source Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  value={formInputs.source}
                  label='Source'
                  onChange={e => handleFilterChange('source', e.target.value)}
                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                >
                  <MenuItem value=''>All Sources</MenuItem>
                  {sources?.map(src => (
                    <MenuItem key={src.id} value={src.slug}>
                      {src.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Filters */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='date'
                label='From Date'
                value={formInputs.fromDate}
                onChange={e => handleFilterChange('from_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { height: 56 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='date'
                label='To Date'
                value={formInputs.toDate}
                onChange={e => handleFilterChange('to_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { height: 56 } }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 2,
                  alignItems: isMobile ? 'stretch' : 'flex-end',
                }}
              >
                <Button
                  type='submit'
                  variant='contained'
                  size={isMobile ? 'large' : 'large'}
                  startIcon={<SearchIcon />}
                  fullWidth={isMobile}
                  sx={{
                    minWidth: isMobile ? 'auto' : 120,
                    height: isMobile ? 48 : 56,
                    order: isMobile ? 1 : 1, // Search button first on mobile
                  }}
                >
                  Search
                </Button>
                <Button
                  variant='outlined'
                  size={isMobile ? 'large' : 'large'}
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  fullWidth={isMobile}
                  sx={{
                    height: isMobile ? 48 : 56,
                    order: isMobile ? 2 : 2, // Clear button second on mobile
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Active Filters Display */}
      {(formInputs.keyword ||
        formInputs.category ||
        formInputs.source ||
        formInputs.fromDate ||
        formInputs.toDate) && (
        <Box
          sx={{
            mb: 3,
            p: isMobile ? 2 : 0,
            bgcolor: isMobile ? 'background.paper' : 'transparent',
            borderRadius: isMobile ? 1 : 0,
            border: isMobile ? 1 : 0,
            borderColor: isMobile ? 'divider' : 'transparent',
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h6'}
            gutterBottom
            sx={{ mb: isMobile ? 2 : 1 }}
          >
            Active Filters:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: isMobile ? 1.5 : 1,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            {formInputs.keyword && (
              <Chip
                label={`Search: "${formInputs.keyword}"`}
                onDelete={() => {
                  setFormInputs(prev => ({ ...prev, keyword: '' }));
                  // Don't update search params here - only update form inputs
                }}
                color='primary'
              />
            )}
            {formInputs.category && (
              <Chip
                label={`Category: ${categories?.find(c => c.slug === formInputs.category)?.name || formInputs.category}`}
                onDelete={() => {
                  setFormInputs(prev => ({ ...prev, category: '' }));
                  // Don't update search params here - only update form inputs
                }}
                color='secondary'
              />
            )}
            {formInputs.source && (
              <Chip
                label={`Source: ${sources?.find(s => s.slug === formInputs.source)?.name || formInputs.source}`}
                onDelete={() => {
                  setFormInputs(prev => ({ ...prev, source: '' }));
                  // Don't update search params here - only update form inputs
                }}
                color='info'
              />
            )}
            {formInputs.fromDate && (
              <Chip
                label={`From: ${format(new Date(formInputs.fromDate), 'MMM dd, yyyy')}`}
                onDelete={() => {
                  setFormInputs(prev => ({ ...prev, fromDate: '' }));
                  // Don't update search params here - only update form inputs
                }}
                color='success'
              />
            )}
            {formInputs.toDate && (
              <Chip
                label={`To: ${format(new Date(formInputs.toDate), 'MMM dd, yyyy')}`}
                onDelete={() => {
                  setFormInputs(prev => ({ ...prev, toDate: '' }));
                  // Don't update search params here - only update form inputs
                }}
                color='success'
              />
            )}
          </Box>
        </Box>
      )}

      {/* Results Summary */}
      {!finalLoading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' color='text.secondary'>
            {totalResults > 0
              ? `Found ${totalResults} article${totalResults !== 1 ? 's' : ''}`
              : 'No articles found'}
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {finalError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to load search results. Please try again.
        </Alert>
      )}

      {/* Articles Grid */}
      <Grid container spacing={3}>
        {finalLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <ArticleCardSkeleton />
              </Grid>
            ))
          : articles.map(article => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            size='large'
          />
        </Box>
      )}

      {/* No Results Message */}
      {!finalLoading && articles.length === 0 && !finalError && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h5' color='text.secondary' gutterBottom>
            No articles found
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      )}

      {/* Scraping Confirmation Modal */}
      <ScrapingConfirmationModal
        open={showScrapingModal}
        onClose={() => setShowScrapingModal(false)}
        onConfirm={handleScrapingConfirm}
        filters={scrapingFilters}
        isLoading={isScraping}
        remainingCredits={remainingCredits}
        maxCredits={5}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchPage;
