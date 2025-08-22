import type React from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';

import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetArticleQuery } from '../store/api/newsApi';

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Set page title
  useDocumentTitle(`Article ${id || 'Loading...'}`);

  // Fetch article data
  const {
    data: article,
    isLoading,
    error,
  } = useGetArticleQuery(Number(id), {
    skip: !id || isNaN(Number(id)),
  });

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Alert severity='error' sx={{ mb: 2 }}>
          Failed to load article. Please try again later.
        </Alert>
      </Box>
    );
  }

  // No article found
  if (!article) {
    return (
      <Box>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Article not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        {article.title}
      </Typography>

      {article.description && (
        <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
          {article.description}
        </Typography>
      )}

      {article.content && (
        <Typography variant='body1' sx={{ mb: 2 }}>
          {article.content}
        </Typography>
      )}

      <Typography variant='body2' color='text.secondary'>
        Article ID: {id}
      </Typography>
    </Box>
  );
};
