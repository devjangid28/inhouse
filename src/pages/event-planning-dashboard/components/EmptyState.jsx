import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ onGetStarted }) => {
  const features = [
    {
      icon: 'Sparkles',
      title: 'AI-Powered Planning',
      description: 'Generate comprehensive event plans from simple descriptions'
    },
    {
      icon: 'CheckSquare',
      title: 'Smart Task Management',
      description: 'Automatically create and organize tasks with role assignments'
    },
    {
      icon: 'IndianRupee',
      title: 'Dynamic Budgeting',
      description: 'Get accurate cost estimates based on your event parameters'
    },
    {
      icon: 'Megaphone',
      title: 'Marketing Materials',
      description: 'Generate invitations, posters, and social media content'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-8 shadow-card text-center">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full mx-auto mb-4">
          <Icon name="Sparkles" size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to Smart Event Planner
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Transform your event ideas into comprehensive plans with AI-powered assistance. 
          Get started by describing your event vision above.
        </p>
      </div>
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 text-left">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon name={feature?.icon} size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {feature?.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Sample Events */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Popular Event Types
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Corporate Conference',
            'Wedding Celebration', 
            'Product Launch',
            'Birthday Party',
            'Networking Event',
            'Charity Fundraiser'
          ]?.map((eventType, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
            >
              {eventType}
            </span>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="space-y-4">
        <Button
          variant="default"
          size="lg"
          onClick={onGetStarted}
          iconName="ArrowUp"
          iconPosition="left"
        >
          Start Planning Your Event
        </Button>
        
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={12} />
            <span>5 min setup</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Zap" size={12} />
            <span>AI-powered</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Download" size={12} />
            <span>Export ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;