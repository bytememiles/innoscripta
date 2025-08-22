import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  CalendarToday,
  Category,
  ExpandLess,
  ExpandMore,
  Language,
  LocationOn,
  OpenInNew,
  Person,
  Share,
  Source,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';

import { ROUTES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetArticleQuery } from '../store/api/newsApi';

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Set page title
  useDocumentTitle(`Article ${id || 'Loading...'}`);

  // Fetch article data
  const {
    data: article,
    isLoading,
    error,
  } = useGetArticleQuery(id!, {
    skip: !id,
  });

  // Function to truncate content
  const truncateContent = (content: string, maxLength: number = 500) => {
    if (content.length <= maxLength) return content;

    // Find the last complete word within the limit
    const truncated = content.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    return truncated + '...';
  };

  // Function to clean HTML content and extract text
  const extractTextFromHTML = (htmlContent: string) => {
    // Remove HTML tags and decode HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Function to clean content from truncation artifacts
  const cleanContent = (content: string) => {
    // Remove common truncation patterns like [+99 chars], [...], etc.
    return content
      .replace(/\s*\[\+\d+\s*chars?\]/gi, '') // Remove [+99 chars] patterns
      .replace(/\s*\[\.\.\.\]/gi, '') // Remove [...] patterns
      .replace(/\s*\.\.\.$/gi, '') // Remove trailing ...
      .trim();
  };

  // Get display content (truncated or full)
  const getDisplayContent = (content: string) => {
    if (isContentExpanded) {
      return cleanContent(content);
    }

    const textContent = extractTextFromHTML(content);
    const cleanedContent = cleanContent(textContent);
    return truncateContent(cleanedContent, 500);
  };

  // Check if content needs truncation
  const needsTruncation = (content: string) => {
    const textContent = extractTextFromHTML(content);
    const cleanedContent = cleanContent(textContent);
    return cleanedContent.length > 500;
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton
            variant='rectangular'
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant='text' height={60} width='80%' />
          <Skeleton variant='text' height={40} width='60%' />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant='text' height={24} width='100%' />
          <Skeleton variant='text' height={24} width='90%' />
          <Skeleton variant='text' height={24} width='95%' />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton
            variant='rectangular'
            height={200}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Failed to load article. Please try again later.
        </Alert>
        <Button
          variant='outlined'
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // No article found
  if (!article) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Article not found.
        </Alert>
        <Button
          variant='outlined'
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy • HH:mm');
    } catch {
      return dateString;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Button
          color='inherit'
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none' }}
        >
          Back to Articles
        </Button>
        {article.category && (
          <Chip
            label={article.category.name}
            size='small'
            color='primary'
            variant='outlined'
          />
        )}
        {article.source && (
          <Chip
            label={article.source.name}
            size='small'
            color='secondary'
            variant='outlined'
          />
        )}
      </Breadcrumbs>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        {article.url_to_image && (
          <Box
            sx={{
              position: 'relative',
              height: { xs: 300, md: 400 },
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${article.url_to_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <Box
              sx={{
                p: 4,
                width: '100%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              }}
            >
              <Typography
                variant='h3'
                component='h1'
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  lineHeight: 1.2,
                }}
              >
                {article.title}
              </Typography>
              {article.description && (
                <Typography
                  variant='h6'
                  sx={{
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: 1.4,
                  }}
                >
                  {article.description}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Article Content */}
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Article Metadata */}
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' spacing={2} flexWrap='wrap' sx={{ mb: 3 }}>
                {article.author && (
                  <Chip
                    icon={<Person />}
                    label={article.author}
                    variant='outlined'
                    size='medium'
                  />
                )}
                {article.source && (
                  <Chip
                    icon={<Source />}
                    label={article.source.name}
                    variant='outlined'
                    size='medium'
                    color='primary'
                  />
                )}
                {article.category && (
                  <Chip
                    icon={<Category />}
                    label={article.category.name}
                    variant='outlined'
                    size='medium'
                    color='secondary'
                  />
                )}
                <Chip
                  icon={<CalendarToday />}
                  label={formatDate(article.published_at)}
                  variant='outlined'
                  size='medium'
                />
                {article.language && (
                  <Chip
                    icon={<Language />}
                    label={article.language.toUpperCase()}
                    variant='outlined'
                    size='medium'
                  />
                )}
                {article.country && (
                  <Chip
                    icon={<LocationOn />}
                    label={article.country}
                    variant='outlined'
                    size='medium'
                  />
                )}
              </Stack>

              {/* Action Buttons */}
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Button
                  variant='contained'
                  startIcon={<OpenInNew />}
                  href={article.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ borderRadius: 2 }}
                >
                  Read Full Article
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{ borderRadius: 2 }}
                >
                  Share
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Article Content */}
          {article.content && (
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant='h5'
                  component='h2'
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 3 }}
                >
                  Article Content
                </Typography>

                {/* Content Display */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      maxHeight: isContentExpanded ? 'none' : '300px',
                    }}
                  >
                    {isContentExpanded ? (
                      // Full content with HTML support
                      <Typography
                        variant='body1'
                        sx={{
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                          '& p': { mb: 2 },
                          '& h1, & h2, & h3, & h4, & h5, & h6': {
                            mt: 3,
                            mb: 2,
                            fontWeight: 600,
                          },
                          '& ul, & ol': { pl: 3, mb: 2 },
                          '& li': { mb: 1 },
                          '& blockquote': {
                            borderLeft: '4px solid #667eea',
                            pl: 3,
                            ml: 0,
                            fontStyle: 'italic',
                            color: 'text.secondary',
                          },
                          '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 1,
                          },
                          '& a': {
                            color: 'primary.main',
                            textDecoration: 'none',
                          },
                          '& a:hover': { textDecoration: 'underline' },
                        }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    ) : (
                      // Truncated content with gradient fade
                      <Box sx={{ position: 'relative' }}>
                        <Typography
                          variant='body1'
                          sx={{
                            lineHeight: 1.8,
                            fontSize: '1.1rem',
                            '& p': { mb: 2 },
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                              mt: 3,
                              mb: 2,
                              fontWeight: 600,
                            },
                            '& ul, & ol': { pl: 3, mb: 2 },
                            '& li': { mb: 1 },
                            '& blockquote': {
                              borderLeft: '4px solid #667eea',
                              pl: 3,
                              ml: 0,
                              fontStyle: 'italic',
                              color: 'text.secondary',
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: getDisplayContent(article.content),
                          }}
                        />
                        {/* Gradient fade effect */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60px',
                            background: 'linear-gradient(transparent, white)',
                            pointerEvents: 'none',
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Read More/Less Button */}
                {needsTruncation(article.content) && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant='outlined'
                      startIcon={
                        isContentExpanded ? <ExpandLess /> : <ExpandMore />
                      }
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        },
                      }}
                    >
                      {isContentExpanded ? 'Show Less' : 'Read Full Article'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Article Details */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant='h5'
                component='h2'
                gutterBottom
                sx={{ fontWeight: 600, mb: 3 }}
              >
                Article Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Published Date
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {formatDate(article.published_at)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Language
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.language || 'Not specified'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Country
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.country || 'Not specified'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Source
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.source?.name || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Category
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.category?.name || 'Uncategorized'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        External ID
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.external_id || 'Not available'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Source Information */}
            {article.source && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Source Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Name
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.source.name}
                      </Typography>
                    </Box>
                    {article.source.description && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='text.secondary'
                          gutterBottom
                        >
                          Description
                        </Typography>
                        <Typography variant='body2'>
                          {article.source.description}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Language
                      </Typography>
                      <Typography variant='body2'>
                        {article.source.language}
                      </Typography>
                    </Box>
                    {article.source.country && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='text.secondary'
                          gutterBottom
                        >
                          Country
                        </Typography>
                        <Typography variant='body2'>
                          {article.source.country}
                        </Typography>
                      </Box>
                    )}
                    {article.source.base_url && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='text.secondary'
                          gutterBottom
                        >
                          Website
                        </Typography>
                        <Link
                          href={article.source.base_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {article.source.base_url}
                        </Link>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Category Information */}
            {article.category && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Category Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Name
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {article.category.name}
                      </Typography>
                    </Box>
                    {article.category.description && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='text.secondary'
                          gutterBottom
                        >
                          Description
                        </Typography>
                        <Typography variant='body2'>
                          {article.category.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant='outlined'
                    fullWidth
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: 2 }}
                  >
                    Back to Articles
                  </Button>
                  <Button
                    variant='outlined'
                    fullWidth
                    startIcon={<Share />}
                    onClick={handleShare}
                    sx={{ borderRadius: 2 }}
                  >
                    Share Article
                  </Button>
                  <Button
                    variant='contained'
                    fullWidth
                    startIcon={<OpenInNew />}
                    href={article.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ borderRadius: 2 }}
                  >
                    Read Original
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
