import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import * as yup from 'yup';

import { AUTH_REDIRECTS, ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../hooks/redux';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { addNotification } from '../../store/slices/uiSlice';
import type { LoginCredentials } from '../../types';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Set page title
  useDocumentTitle('Sign In');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});
      clearErrors();

      await login(data);

      dispatch(
        addNotification({
          type: 'success',
          message: 'Welcome back! Login successful.',
        })
      );

      // Navigate to intended destination or app
      const from =
        (location.state as any)?.from || AUTH_REDIRECTS.DEFAULT_AUTHENTICATED;
      navigate(from, {
        replace: true,
        state: { fromAuthProcess: true },
      });
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle different types of errors
      if (error.errors) {
        // Validation errors from backend
        setFieldErrors(error.errors);

        // Set form errors for specific fields
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setFormError(field as keyof LoginCredentials, {
              type: 'server',
              message: messages[0],
            });
          }
        });

        setError('Please correct the errors below.');
      } else if (error.message) {
        // Handle specific error messages
        if (error.message.includes('Invalid credentials')) {
          setError(
            'Invalid email or password. Please check your credentials and try again.'
          );
        } else if (error.message.includes('Validation error')) {
          setError('Please check your input and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant='h4' component='h1' textAlign='center' gutterBottom>
        Sign In
      </Typography>

      <Typography
        variant='body2'
        color='text.secondary'
        textAlign='center'
        sx={{ mb: 3 }}
      >
        Welcome back! Please sign in to your account.
      </Typography>

      {/* General error alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Field-specific error alerts */}
      {Object.keys(fieldErrors).length > 0 && (
        <Alert severity='error' sx={{ mb: 2 }}>
          <Box>
            {Object.entries(fieldErrors).map(([field, messages]) => (
              <Box key={field} sx={{ mb: 1 }}>
                <strong>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </strong>{' '}
                {Array.isArray(messages) ? messages.join(', ') : messages}
              </Box>
            ))}
          </Box>
        </Alert>
      )}

      <TextField
        {...register('email')}
        margin='normal'
        required
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        onChange={handleInputChange}
      />

      <TextField
        {...register('password')}
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
        error={!!errors.password}
        helperText={errors.password?.message}
        onChange={handleInputChange}
      />

      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component={RouterLink}
          to={ROUTES.FORGOT_PASSWORD}
          variant='body2'
        >
          Forgot password?
        </Link>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Don't have an account?{' '}
          <Link component={RouterLink} to={ROUTES.REGISTER} variant='body2'>
            Sign up here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
