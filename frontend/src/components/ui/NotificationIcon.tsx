import React, { useState } from 'react';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationIconProps {
  notifications?: Notification[];
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  notifications = [],
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeNotifications = notifications.slice(0, 10); // Show last 10

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon fontSize='small' color='info' />;
      case 'warning':
        return <WarningIcon fontSize='small' color='warning' />;
      case 'success':
        return <SuccessIcon fontSize='small' color='success' />;
      case 'error':
        return <ErrorIcon fontSize='small' color='error' />;
      default:
        return <InfoIcon fontSize='small' />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton color='inherit' onClick={handleClick} sx={{ ml: 1 }}>
        <Badge badgeContent={unreadCount} color='error'>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='h6'>Notifications</Typography>
          <Typography variant='body2' color='text.secondary'>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {activeNotifications.length > 0 ? (
          activeNotifications.map(notification => (
            <MenuItem key={notification.id} sx={{ py: 1.5 }}>
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2'>
                      {notification.message}
                    </Typography>
                    {!notification.read && (
                      <Chip
                        label='New'
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant='caption' color='text.secondary'>
                    {formatTimestamp(notification.timestamp)}
                  </Typography>
                }
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <ListItemIcon>
              <InfoIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='No notifications'
              secondary="You're all caught up!"
            />
          </MenuItem>
        )}

        {activeNotifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant='body2' color='primary' textAlign='center'>
              View all notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};
