import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
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
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';

import { ArticleCard, ArticleCardSkeleton } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  useGetArticlesQuery,
  useGetCategoriesQuery,
  useGetPersonalizedFeedQuery,
  useGetSourcesQuery,
  useGetUserPreferencesQuery,
} from '../store/api/newsApi';
import type { ArticleFilters } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Use localStorage hook for alert dismissal state
  const [isAlertDismissed, setIsAlertDismissed] = useLocalStorage(
    `personalized_alert_dismissed_${user?.id || 'anonymous'}`,
    false
  );

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

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSource, setSelectedSource] = useState(source);
  const [selectedFromDate, setSelectedFromDate] = useState(fromDate);
  const [selectedToDate, setSelectedToDate] = useState(toDate);

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

  // Handle alert dismissal
  const handleAlertDismiss = () => {
    setIsAlertDismissed(true);
  };

  const {
    data: personalizedResults,
    isLoading: personalizedLoading,
    error: personalizedError,
  } = useGetPersonalizedFeedQuery(
    { perPage: 12, page },
    { skip: !shouldUsePersonalizedFeed }
  );

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useGetArticlesQuery(
    {
      keyword: query,
      category: category || undefined,
      source: source || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      page,
      per_page: 12,
    },
    { skip: shouldUsePersonalizedFeed }
  );

  // Use personalized results when available, otherwise use search results
  const finalResults = shouldUsePersonalizedFeed
    ? personalizedResults
    : searchResults;
  const finalLoading = shouldUsePersonalizedFeed
    ? personalizedLoading
    : searchLoading;
  const finalError = shouldUsePersonalizedFeed
    ? personalizedError
    : searchError;

  const { data: categories } = useGetCategoriesQuery();
  const { data: sources } = useGetSourcesQuery();

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
      keyword: searchInput,
      category: selectedCategory,
      source: selectedSource,
      from_date: selectedFromDate,
      to_date: selectedToDate,
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
        setSelectedCategory(newValue);
        break;
      case 'source':
        setSelectedSource(newValue);
        break;
      case 'from_date':
        setSelectedFromDate(newValue);
        break;
      case 'to_date':
        setSelectedToDate(newValue);
        break;
    }

    updateSearchParams({ [filterType]: newValue });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedSource('');
    setSelectedFromDate('');
    setSelectedToDate('');
    setSearchParams({});
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const articles = finalResults?.data || [];
  const totalPages = finalResults?.last_page || 1;
  const totalResults = finalResults?.total || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Search Articles
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Find the latest news articles by keyword, category, source, and date
        </Typography>
        {shouldUsePersonalizedFeed &&
          hasMeaningfulPreferences &&
          !isAlertDismissed && (
            <Alert
              severity='info'
              sx={{ mt: 2 }}
              onClose={handleAlertDismiss}
              action={
                <Button
                  color='inherit'
                  size='small'
                  onClick={handleAlertDismiss}
                >
                  Got it!
                </Button>
              }
            >
              🎯 Showing personalized content based on your preferences
            </Alert>
          )}
      </Box>

      {/* Search Form */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box component='form' onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems='flex-end'>
            {/* Search Input */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Search Articles'
                placeholder='Enter keywords...'
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
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
                  value={selectedCategory}
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
                  value={selectedSource}
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
                value={selectedFromDate}
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
                value={selectedToDate}
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
                  gap: 2,
                  alignItems: 'flex-end',
                }}
              >
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  startIcon={<SearchIcon />}
                  sx={{ minWidth: 120, height: 56 }}
                >
                  Search
                </Button>
                <Button
                  variant='outlined'
                  size='large'
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ height: 56 }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Active Filters Display */}
      {(query || category || source || fromDate || toDate) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {query && (
              <Chip
                label={`Search: "${query}"`}
                onDelete={() => {
                  setSearchInput('');
                  updateSearchParams({ keyword: '' });
                }}
                color='primary'
              />
            )}
            {category && (
              <Chip
                label={`Category: ${categories?.find(c => c.slug === category)?.name || category}`}
                onDelete={() => {
                  setSelectedCategory('');
                  updateSearchParams({ category: '' });
                }}
                color='secondary'
              />
            )}
            {source && (
              <Chip
                label={`Source: ${sources?.find(s => s.slug === source)?.name || source}`}
                onDelete={() => {
                  setSelectedSource('');
                  updateSearchParams({ source: '' });
                }}
                color='info'
              />
            )}
            {fromDate && (
              <Chip
                label={`From: ${format(new Date(fromDate), 'MMM dd, yyyy')}`}
                onDelete={() => {
                  setSelectedFromDate('');
                  updateSearchParams({ from_date: '' });
                }}
                color='success'
              />
            )}
            {toDate && (
              <Chip
                label={`To: ${format(new Date(toDate), 'MMM dd, yyyy')}`}
                onDelete={() => {
                  setSelectedToDate('');
                  updateSearchParams({ to_date: '' });
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
    </Box>
  );
};

export default SearchPage;
