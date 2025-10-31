import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import MaterialsHeader from './components/MaterialsHeader';
import TabNavigation from './components/TabNavigation';
import EmailInvitationTab from './components/EmailInvitationTab';
import SocialMediaTab from './components/SocialMediaTab';
import VisualAssetsTab from './components/VisualAssetsTab';

const MarketingMaterials = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [sharedDescription, setSharedDescription] = useState('');
  const { 
    notifications, 
    showSuccess, 
    showError, 
    showInfo, 
    showLoading,
    dismissNotification 
  } = useNotifications();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    showInfo(`Switched to ${getTabName(tabId)} section`);
  };

  const getTabName = (tabId) => {
    switch (tabId) {
      case 'email': return 'Email Invitations';
      case 'social': return 'Social Media';
      case 'visual': return 'Visual Assets';
      default: return 'Unknown';
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'quick-generate':
        const loadingId = showLoading('Generating marketing materials...');
        setTimeout(() => {
          dismissNotification(loadingId);
          showSuccess('Marketing materials generated successfully!');
        }, 3000);
        break;
        
      case 'export-all':
        showInfo('Preparing export package...');
        setTimeout(() => {
          showSuccess('All materials exported successfully!');
        }, 2000);
        break;
        
      case 'generate-content':
        const contentLoadingId = showLoading('Generating AI content...');
        setTimeout(() => {
          dismissNotification(contentLoadingId);
          showSuccess('New content generated and ready to use!');
        }, 2500);
        break;
        
      case 'download-assets':
        showInfo('Downloading visual assets...');
        setTimeout(() => {
          showSuccess('Assets downloaded to your device!');
        }, 1500);
        break;
        
      default:
        showInfo(`Action: ${action} triggered`);
    }
  };

  const renderActiveTab = (tabId = activeTab) => {
    switch (tabId) {
      case 'email':
        return (
          <EmailInvitationTab
            sharedDescription={sharedDescription}
            onDescriptionChange={setSharedDescription}
          />
        );
      case 'social':
        return <SocialMediaTab sharedDescription={sharedDescription} />;
      case 'visual':
        return <VisualAssetsTab sharedDescription={sharedDescription} />;
      default:
        return (
          <EmailInvitationTab
            sharedDescription={sharedDescription}
            onDescriptionChange={setSharedDescription}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <MaterialsHeader onQuickAction={handleQuickAction} />

          {/* Tab Navigation */}
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />

          {/* Tab Content */}
          <div className="transition-all duration-300 ease-in-out">
            {renderActiveTab()}
          </div>

          {/* Mobile Tab Navigation (Accordion Style) */}
          <div className="sm:hidden mt-8">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {['email', 'social', 'visual']?.map((tabId) => (
                <div key={tabId} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => handleTabChange(tabId)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      activeTab === tabId ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium">{getTabName(tabId)}</span>
                    <div className={`transform transition-transform ${
                      activeTab === tabId ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </div>
                  </button>
                  {activeTab === tabId && (
                    <div className="p-4 bg-muted/50">
                      {renderActiveTab(tabId)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {/* Quick Action Button */}
      <QuickActionButton onAction={handleQuickAction} />
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
        maxVisible={3}
      />
    </div>
  );
};

export default MarketingMaterials;