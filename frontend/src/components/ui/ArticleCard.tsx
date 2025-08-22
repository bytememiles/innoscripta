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
  article: Article;
  variant?: 'default' | 'compact';
  showSource?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  maxTitleLines?: number;
  maxDescriptionLines?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
  showSource = true,
  showCategory = true,
  showDate = true,
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
              {showSource && article.source && (
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
