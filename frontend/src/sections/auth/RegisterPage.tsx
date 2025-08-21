import type React from 'react';
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

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { clearError, registerAsync } from '../../store/slices/authSlice';
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

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector(state => state.auth);

  // Set page title
  useDocumentTitle('Create Account');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      dispatch(clearError());
      const result = await dispatch(registerAsync(data));

      if (registerAsync.fulfilled.match(result)) {
        dispatch(
          addNotification({
            type: 'success',
            message: 'Welcome! Your account has been created successfully.',
          })
        );

        // Navigate to intended destination or home
        const from = (location.state as any)?.from || '/';
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled by the reducer
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

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
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
          <Link component={RouterLink} to='/login' variant='body2'>
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
