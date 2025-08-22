import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Cancel as CancelIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../hooks/redux';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useGetCategoriesQuery,
  useGetSourcesQuery,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from '../store/api/newsApi';
import { addNotification } from '../store/slices/uiSlice';
import type { Category, Source, UserPreferences } from '../types';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Set page title
  useDocumentTitle('Profile & Preferences');

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreferences, setEditedPreferences] =
    useState<UserPreferences | null>(null);

  // API queries
  const { data: userPreferences, isLoading: preferencesLoading } =
    useGetUserPreferencesQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: sources } = useGetSourcesQuery();
  const [updatePreferences, { isLoading: isUpdating }] =
    useUpdateUserPreferencesMutation();

  // Initialize edited preferences when data loads
  useEffect(() => {
    if (userPreferences && !editedPreferences) {
      setEditedPreferences(userPreferences);
    }
  }, [userPreferences, editedPreferences]);

  // Handle preference changes
  const handlePreferenceChange = (type: keyof UserPreferences, value: any) => {
    if (!editedPreferences) return;

    setEditedPreferences({
      ...editedPreferences,
      [type]: value,
    });
  };

  // Handle category selection
  const handleCategoryToggle = (categorySlug: string) => {
    if (!editedPreferences) return;

    const currentCategories = editedPreferences.preferred_categories || [];
    const newCategories = currentCategories.includes(categorySlug)
      ? currentCategories.filter(cat => cat !== categorySlug)
      : [...currentCategories, categorySlug];

    handlePreferenceChange('preferred_categories', newCategories);
  };

  // Handle source selection
  const handleSourceToggle = (sourceSlug: string) => {
    if (!editedPreferences) return;

    const currentSources = editedPreferences.preferred_sources || [];
    const newSources = currentSources.includes(sourceSlug)
      ? currentSources.filter(src => src !== sourceSlug)
      : [...currentSources, sourceSlug];

    handlePreferenceChange('preferred_sources', newSources);
  };

  // Save preferences
  const handleSave = async () => {
    if (!editedPreferences) return;

    try {
      // Only send the fields that can be updated
      const updateData = {
        preferred_categories: editedPreferences.preferred_categories,
        preferred_sources: editedPreferences.preferred_sources,
        preferred_authors: editedPreferences.preferred_authors,
        preferred_language: editedPreferences.preferred_language,
        preferred_country: editedPreferences.preferred_country,
        email_notifications: editedPreferences.email_notifications,
        timezone: editedPreferences.timezone,
      };

      await updatePreferences(updateData).unwrap();
      setIsEditing(false);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Preferences updated successfully!',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Failed to update preferences. Please try again.',
        })
      );
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (userPreferences) {
      setEditedPreferences(userPreferences);
    }
    setIsEditing(false);
  };

  // Reset to defaults
  const handleReset = () => {
    if (!userPreferences) return;
    setEditedPreferences(userPreferences);
  };

  if (preferencesLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant='text' width={300} height={48} />
          <Skeleton variant='text' width={500} height={24} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton
                  variant='circular'
                  width={80}
                  height={80}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant='text' width={200} height={32} />
                <Skeleton variant='text' width={150} height={24} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton
                  variant='text'
                  width={200}
                  height={32}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant='rectangular' width='100%' height={200} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!userPreferences) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          Failed to load user preferences. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  const preferences = editedPreferences || userPreferences;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Profile & Preferences
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Customize your news feed and manage your account preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant='h5' component='h2' gutterBottom>
                {user?.name || 'User'}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Member since{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant='h5' component='h3'>
                  News Feed Preferences
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!isEditing ? (
                    <Button
                      variant='outlined'
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant='contained'
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isUpdating}
                      >
                        Save
                      </Button>
                      <Button
                        variant='outlined'
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Email Notifications */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Email Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.email_notifications || false}
                      onChange={e =>
                        handlePreferenceChange(
                          'email_notifications',
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label='Receive email notifications for breaking news'
                />
              </Box>

              {/* Preferred Categories */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Preferred Categories
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Select the categories you're most interested in. Your news
                  feed will prioritize these topics.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories?.map(category => {
                    const isSelected =
                      preferences.preferred_categories?.includes(
                        category.slug
                      ) || false;
                    return (
                      <Chip
                        key={category.id}
                        label={category.name}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() =>
                          isEditing && handleCategoryToggle(category.slug)
                        }
                        sx={{ cursor: isEditing ? 'pointer' : 'default' }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Preferred Sources */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Preferred Sources
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Choose your trusted news sources. Articles from these sources
                  will appear more frequently.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sources?.map(source => {
                    const isSelected =
                      preferences.preferred_sources?.includes(source.slug) ||
                      false;
                    return (
                      <Chip
                        key={source.id}
                        label={source.name}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() =>
                          isEditing && handleSourceToggle(source.slug)
                        }
                        sx={{ cursor: isEditing ? 'pointer' : 'default' }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Language Preferences */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Language Preferences
                </Typography>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Primary Language</InputLabel>
                  <Select
                    value={preferences.preferred_language || 'en'}
                    label='Primary Language'
                    onChange={e =>
                      handlePreferenceChange(
                        'preferred_language',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value='en'>English</MenuItem>
                    <MenuItem value='es'>Spanish</MenuItem>
                    <MenuItem value='fr'>French</MenuItem>
                    <MenuItem value='de'>German</MenuItem>
                    <MenuItem value='it'>Italian</MenuItem>
                    <MenuItem value='pt'>Portuguese</MenuItem>
                    <MenuItem value='ru'>Russian</MenuItem>
                    <MenuItem value='zh'>Chinese</MenuItem>
                    <MenuItem value='ja'>Japanese</MenuItem>
                    <MenuItem value='ko'>Korean</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Time Zone */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Time Zone
                </Typography>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    value={preferences.timezone || 'UTC'}
                    label='Time Zone'
                    onChange={e =>
                      handlePreferenceChange('timezone', e.target.value)
                    }
                  >
                    <MenuItem value='UTC'>
                      UTC (Coordinated Universal Time)
                    </MenuItem>
                    <MenuItem value='America/New_York'>
                      Eastern Time (ET)
                    </MenuItem>
                    <MenuItem value='America/Chicago'>
                      Central Time (CT)
                    </MenuItem>
                    <MenuItem value='America/Denver'>
                      Mountain Time (MT)
                    </MenuItem>
                    <MenuItem value='America/Los_Angeles'>
                      Pacific Time (PT)
                    </MenuItem>
                    <MenuItem value='Europe/London'>London (GMT)</MenuItem>
                    <MenuItem value='Europe/Paris'>Paris (CET)</MenuItem>
                    <MenuItem value='Asia/Tokyo'>Tokyo (JST)</MenuItem>
                    <MenuItem value='Asia/Shanghai'>Shanghai (CST)</MenuItem>
                    <MenuItem value='Australia/Sydney'>Sydney (AEST)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Reset Button */}
              {isEditing && (
                <Box
                  sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}
                >
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={handleReset}
                    disabled={isUpdating}
                  >
                    Reset to Defaults
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
