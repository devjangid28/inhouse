import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickAccessPanel = ({ recentActivity = [], className = '' }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'Task Board',
      description: 'Manage tasks visually',
      icon: 'Kanban',
      path: '/task-board-management',
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Budget Calculator',
      description: 'Estimate event costs',
      icon: 'Calculator',
      path: '/budget-calculator',
      color: 'bg-accent/10 text-accent'
    },
    {
      label: 'Marketing Hub',
      description: 'Create promotional content',
      icon: 'Megaphone',
      path: '/marketing-materials',
      color: 'bg-secondary/10 text-secondary'
    },
    {
      label: 'Event Timeline',
      description: 'View detailed schedule',
      icon: 'Calendar',
      path: '/event-plan-details',
      color: 'bg-warning/10 text-warning'
    }
  ];

  const mockRecentActivity = recentActivity?.length > 0 ? recentActivity : [
    {
      id: 1,
      action: 'Generated event timeline',
      timestamp: new Date(Date.now() - 1800000)?.toISOString(),
      icon: 'Calendar',
      type: 'success'
    },
    {
      id: 2,
      action: 'Created 12 tasks',
      timestamp: new Date(Date.now() - 3600000)?.toISOString(),
      icon: 'CheckSquare',
      type: 'info'
    },
    {
      id: 3,
      action: 'Updated budget estimate',
      timestamp: new Date(Date.now() - 7200000)?.toISOString(),
      icon: 'IndianRupee',
      type: 'warning'
    },
    {
      id: 4,
      action: 'Downloaded poster design',
      timestamp: new Date(Date.now() - 10800000)?.toISOString(),
      icon: 'Download',
      type: 'success'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Zap" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
        
        <div className="space-y-3">
          {quickActions?.map((action, index) => {
            const isActive = window.location.pathname === action?.path;
            return (
            <Button
              key={index}
              variant="ghost"
              onClick={() => navigate(action?.path)}
              className={`w-full justify-start p-3 h-auto hover:bg-muted/50 transition-colors ${
                isActive ? 'bg-muted/50 border-l-2 border-primary' : ''
              }`}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${action?.color}`}>
                  <Icon name={action?.icon} size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{action?.label}</p>
                  <p className="text-xs text-muted-foreground">{action?.description}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </Button>
          );
          })}
        </div>
      </div>

      {/* AI Assistant Tip */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Icon name="Lightbulb" size={16} className="text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Pro Tip</h4>
            <p className="text-xs text-muted-foreground">
              Be specific in your event description to get more accurate AI-generated plans and budgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessPanel;