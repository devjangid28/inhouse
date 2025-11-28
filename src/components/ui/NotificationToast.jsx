import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationToast = ({ 
  notifications = [], 
  onDismiss, 
  position = 'top-right',
  maxVisible = 3 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications?.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-6 right-6';
      case 'below-header':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-6 right-6';
      default:
        return 'top-6 right-6';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return { name: 'CheckCircle2', color: 'text-success' };
      case 'error':
        return { name: 'AlertCircle', color: 'text-error' };
      case 'warning':
        return { name: 'AlertTriangle', color: 'text-warning' };
      case 'info':
        return { name: 'Info', color: 'text-primary' };
      case 'loading':
        return { name: 'Loader2', color: 'text-primary animate-spin' };
      default:
        return { name: 'Bell', color: 'text-muted-foreground' };
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/10 backdrop-blur-sm';
      case 'error':
        return 'border-error/30 bg-error/10 backdrop-blur-sm';
      case 'warning':
        return 'border-warning/30 bg-warning/10 backdrop-blur-sm';
      case 'info':
        return 'border-primary/30 bg-primary/10 backdrop-blur-sm';
      case 'loading':
        return 'border-primary/30 bg-primary/10 backdrop-blur-sm';
      default:
        return 'border-border/30 bg-card/80 backdrop-blur-sm';
    }
  };

  const handleDismiss = (notificationId) => {
    if (onDismiss) {
      onDismiss(notificationId);
    }
  };

  if (visibleNotifications?.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-1200 ${getPositionClasses()}`}>
      <div className="space-y-2 w-80 sm:w-96">
        {visibleNotifications?.map((notification) => {
          const icon = getNotificationIcon(notification?.type);
          const styles = getNotificationStyles(notification?.type);
          
          return (
            <div
              key={notification?.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-out animate-slide-in bg-white/90 backdrop-blur-md ${styles}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <Icon 
                  name={icon?.name} 
                  size={18} 
                  className={icon?.color}
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                {notification?.title && (
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {notification?.title}
                  </h4>
                )}
                <p className="text-sm text-muted-foreground">
                  {notification?.message}
                </p>
                {notification?.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {new Date(notification.timestamp)?.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {/* Actions */}
              <div className="flex items-center space-x-1">
                {notification?.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => notification?.action?.onClick()}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {notification?.action?.label}
                  </Button>
                )}
                
                {notification?.dismissible !== false && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDismiss(notification?.id)}
                    className="w-6 h-6 text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Show count if more notifications exist */}
      {notifications?.length > maxVisible && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-1 px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
            <Icon name="Plus" size={12} />
            <span>{notifications?.length - maxVisible} more</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date()?.toISOString(),
      dismissible: true,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss after duration (default 5 seconds)
    if (notification?.duration !== 0) {
      const duration = notification?.duration || 5000;
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }

    return id;
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  };

  const showError = (message, options = {}) => {
    return addNotification({ type: 'error', message, duration: 0, ...options });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  };

  const showLoading = (message, options = {}) => {
    return addNotification({ 
      type: 'loading', 
      message, 
      duration: 0, 
      dismissible: false, 
      ...options 
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};

export default NotificationToast;