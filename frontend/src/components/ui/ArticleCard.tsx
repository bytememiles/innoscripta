import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';

import { ROUTES } from '../../constants';
import type { Article } from '../../types';

interface ArticleCardProps {
  /** The article data to display */
  article: Article;
  /** Visual variant of the card */
  variant?: 'default' | 'compact';
  /** Whether to show the source information */
  showSource?: boolean;
  /** Whether to show the category information */
  showCategory?: boolean;
  /** Whether to show the publication date */
  showDate?: boolean;
  /** Whether to show the aggregator source (e.g., "via NewsAPI") */
  showAggregator?: boolean;
  /** Maximum number of lines for the title */
  maxTitleLines?: number;
  /** Maximum number of lines for the description */
  maxDescriptionLines?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
  showSource = true,
  showCategory = true,
  showDate = true,
  showAggregator = false,
  maxTitleLines = 2,
  maxDescriptionLines = 3,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(ROUTES.ARTICLE_DETAIL(article.id));
  };

  const isCompact = variant === 'compact';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      {article.url_to_image && (
        <CardMedia
          component='img'
          height={isCompact ? '140' : '200'}
          image={article.url_to_image}
          alt={article.title}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: isCompact ? 2 : 3,
        }}
      >
        {/* Title */}
        <Typography
          gutterBottom
          variant={isCompact ? 'h6' : 'h6'}
          component='h2'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: maxTitleLines,
            WebkitBoxOrient: 'vertical',
            mb: 1,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </Typography>

        {/* Description */}
        {article.description && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: maxDescriptionLines,
              WebkitBoxOrient: 'vertical',
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            {article.description}
          </Typography>
        )}

        {/* Tags and Metadata */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            mt: 'auto',
          }}
        >
          {/* Source and Category Chips */}
          {(showSource || showCategory) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Original Publisher Source */}
              {showSource && article.metadata?.original_data?.source?.name && (
                <Chip
                  label={article.metadata.original_data.source.name}
                  size='small'
                  variant='filled'
                  color='primary'
                  sx={{ fontSize: '0.75rem' }}
                  title='Original publisher'
                />
              )}
              {/* Aggregator Source (if different from original) */}
              {showAggregator &&
                showSource &&
                article.source &&
                article.metadata?.original_data?.source?.name &&
                article.source.name !==
                  article.metadata.original_data.source.name && (
                  <Chip
                    label={`via ${article.source.name}`}
                    size='small'
                    variant='outlined'
                    color='info'
                    sx={{ fontSize: '0.75rem' }}
                    title='Content aggregator'
                  />
                )}
              {/* Fallback to main source if no metadata */}
              {showSource &&
                article.source &&
                !article.metadata?.original_data?.source?.name && (
                  <Chip
                    label={article.source.name}
                    size='small'
                    variant='outlined'
                    color='primary'
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              {showCategory && article.category && (
                <Chip
                  label={article.category.name}
                  size='small'
                  variant='outlined'
                  color='secondary'
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}

          {/* Author and Date */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Author */}
            {article.author && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}
              >
                By {article.author}
              </Typography>
            )}
            {/* Date */}
            {showDate && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.75rem' }}
              >
                {format(new Date(article.published_at), 'MMM dd, yyyy')}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ==============================|| ARTICLE CARD SKELETON ||============================== //

interface ArticleCardSkeletonProps {
  variant?: 'default' | 'compact';
}

export const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const imageHeight = isCompact ? 140 : 200;
  const padding = isCompact ? 2 : 3;

  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant='rectangular' height={imageHeight} />
      <CardContent sx={{ p: padding }}>
        <Skeleton variant='text' height={32} sx={{ mb: 1 }} />
        <Skeleton variant='text' height={32} sx={{ mb: 1 }} />
        <Skeleton variant='text' height={20} sx={{ mb: 2 }} />
        <Skeleton variant='text' height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant='rounded' width={60} height={24} />
          <Skeleton variant='text' width={80} />
        </Box>
      </CardContent>
    </Card>
  );
};

// ==============================|| EXPORTS ||============================== //

export default ArticleCard;
