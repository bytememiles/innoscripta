import type React from 'react';
import { useEffect } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { removeNotification } from '../../store/slices/uiSlice';

export const NotificationContainer: React.FC = () => {
  const notifications = useAppSelector((state) => state.ui.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Auto-hide notifications after 6 seconds
    notifications.forEach((notification) => {
      if (notification.autoHide) {
        const timeoutId = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 6000);

        return () => clearTimeout(timeoutId);
      }
    });
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHide ? 6000 : null}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type as AlertColor}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};
