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
import type { RegisterCredentials } from '../../types';

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Set page title
  useDocumentTitle('Create Account');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<RegisterCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});
      clearErrors();

      await registerUser(data);

      dispatch(
        addNotification({
          type: 'success',
          message: 'Welcome! Your account has been created successfully.',
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
      console.error('Registration error:', error);

      // Handle different types of errors
      if (error.errors) {
        // Validation errors from backend
        setFieldErrors(error.errors);

        // Set form errors for specific fields
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setFormError(field as keyof RegisterCredentials, {
              type: 'server',
              message: messages[0],
            });
          }
        });

        setError('Please correct the errors below.');
      } else if (error.message) {
        // Handle specific error messages
        if (error.message.includes('email has already been taken')) {
          setError(
            'An account with this email already exists. Please use a different email or sign in.'
          );
        } else if (error.message.includes('Validation error')) {
          setError('Please check your input and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Registration failed. Please try again.');
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
        Create Account
      </Typography>

      <Typography
        variant='body2'
        color='text.secondary'
        textAlign='center'
        sx={{ mb: 3 }}
      >
        Join us today and stay updated with the latest news.
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
        {...register('name')}
        margin='normal'
        required
        fullWidth
        id='name'
        label='Full Name'
        name='name'
        autoComplete='name'
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        onChange={handleInputChange}
      />

      <TextField
        {...register('email')}
        margin='normal'
        required
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
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
        autoComplete='new-password'
        error={!!errors.password}
        helperText={errors.password?.message}
        onChange={handleInputChange}
      />

      <TextField
        {...register('password_confirmation')}
        margin='normal'
        required
        fullWidth
        name='password_confirmation'
        label='Confirm Password'
        type='password'
        id='password_confirmation'
        autoComplete='new-password'
        error={!!errors.password_confirmation}
        helperText={errors.password_confirmation?.message}
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
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Already have an account?{' '}
          <Link component={RouterLink} to={ROUTES.LOGIN} variant='body2'>
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
