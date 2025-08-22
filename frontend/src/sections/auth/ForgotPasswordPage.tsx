import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
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

import { API_ENDPOINTS, ROUTES } from '../../constants';
import { useAppDispatch } from '../../hooks/redux';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiService } from '../../services/api';
import { addNotification } from '../../store/slices/uiSlice';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

interface FormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set page title
  useDocumentTitle('Forgot Password');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email: data.email,
      });

      setIsSubmitted(true);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Password reset link has been sent to your email.',
        })
      );
    } catch (error: any) {
      console.error('Password reset error:', error);

      // Handle different types of errors
      if (error.message) {
        if (error.message.includes('email not found')) {
          setError(
            'No account found with this email address. Please check the email or create a new account.'
          );
        } else if (error.message.includes('too many attempts')) {
          setError(
            'Too many password reset attempts. Please wait a few minutes before trying again.'
          );
        } else if (error.message.includes('Validation error')) {
          setError('Please check your email address and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Check Your Email
        </Typography>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          We've sent a password reset link to your email address. Please check
          your inbox and follow the instructions to reset your password.
        </Typography>

        <Alert severity='info' sx={{ mb: 3 }}>
          Didn't receive the email? Check your spam folder or try again.
        </Alert>

        <Button
          variant='outlined'
          onClick={() => setIsSubmitted(false)}
          sx={{ mr: 2 }}
        >
          Try Again
        </Button>

        <Link component={RouterLink} to={ROUTES.LOGIN}>
          <Button variant='text'>Back to Sign In</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant='h4' component='h1' textAlign='center' gutterBottom>
        Forgot Password
      </Typography>

      <Typography
        variant='body2'
        color='text.secondary'
        textAlign='center'
        sx={{ mb: 3 }}
      >
        Enter your email address and we'll send you a link to reset your
        password.
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
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
      />

      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Remember your password?{' '}
          <Link component={RouterLink} to={ROUTES.LOGIN} variant='body2'>
            Back to Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
