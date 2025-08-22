import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';

import { ROUTES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetArticlesQuery } from '../store/api/newsApi';
import type { Article } from '../types';

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(`${ROUTES.ARTICLE_DETAIL(article.id)}`)}
    >
      {article.url_to_image && (
        <CardMedia
          component='img'
          height='200'
          image={article.url_to_image}
          alt={article.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Typography
          gutterBottom
          variant='h6'
          component='h2'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {article.title}
        </Typography>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {article.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {article.source && (
              <Chip
                label={article.source.name}
                size='small'
                variant='outlined'
                color='primary'
              />
            )}
            {article.category && (
              <Chip
                label={article.category.name}
                size='small'
                variant='outlined'
                color='secondary'
              />
            )}
          </Box>

          <Typography variant='caption' color='text.secondary'>
            {format(new Date(article.published_at), 'MMM dd, yyyy')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const ArticleCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant='rectangular' height={200} />
    <CardContent>
      <Skeleton variant='text' height={32} />
      <Skeleton variant='text' height={32} />
      <Skeleton variant='text' height={20} />
      <Skeleton variant='text' height={20} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant='rounded' width={60} height={24} />
        <Skeleton variant='text' width={80} />
      </Box>
    </CardContent>
  </Card>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Set page title
  useDocumentTitle('Home');

  // Get recent articles for top headlines section
  const {
    data: topHeadlinesData,
    isLoading: headlinesLoading,
    error: headlinesError,
  } = useGetArticlesQuery({ per_page: 6 });

  // Get more recent articles for latest section
  const {
    data: latestArticlesData,
    isLoading: latestLoading,
    error: latestError,
  } = useGetArticlesQuery({ per_page: 12, page: 1 });

  // Extract articles from paginated response
  const topHeadlines = topHeadlinesData?.data || [];
  const latestArticles = latestArticlesData?.data || [];

  // Debug logging
  console.log('topHeadlinesData:', topHeadlinesData);
  console.log('topHeadlines:', topHeadlines);
  console.log('latestArticlesData:', latestArticlesData);
  console.log('latestArticles:', latestArticles);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Welcome to News Aggregator
        </Typography>
        <Typography variant='h6' color='text.secondary'>
          Stay informed with the latest news from trusted sources around the
          world
        </Typography>
      </Box>

      {/* Top Headlines */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h4' component='h2'>
            Top Headlines
          </Typography>
          <Button variant='outlined' onClick={() => navigate(ROUTES.SEARCH)}>
            View All
          </Button>
        </Box>

        {headlinesError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            Failed to load top headlines. Please try again later.
          </Alert>
        )}

        {!headlinesLoading && !Array.isArray(topHeadlines) && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Unexpected data format for top headlines. Please refresh the page.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {headlinesLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Box key={index}>
                  <ArticleCardSkeleton />
                </Box>
              ))
            : Array.isArray(topHeadlines) &&
              topHeadlines.map(article => (
                <Box key={article.id}>
                  <ArticleCard article={article} />
                </Box>
              ))}
        </Box>
      </Box>

      {/* Latest Articles */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h2'>Latest Articles</Typography>
          <Button variant='outlined' onClick={() => navigate(ROUTES.SEARCH)}>
            View All
          </Button>
        </Box>

        {latestError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            Failed to load latest articles. Please try again later.
          </Alert>
        )}

        {!latestLoading && !Array.isArray(latestArticles) && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Unexpected data format for latest articles. Please refresh the page.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {latestLoading
            ? Array.from({ length: 12 }).map((_, index) => (
                <Box key={index}>
                  <ArticleCardSkeleton />
                </Box>
              ))
            : Array.isArray(latestArticles) &&
              latestArticles.map(article => (
                <Box key={article.id}>
                  <ArticleCard article={article} />
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
};
