import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import BudgetInputForm from './components/BudgetInputForm';
import BudgetBreakdown from './components/BudgetBreakdown';
import BudgetComparison from './components/BudgetComparison';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { preferencesService } from '../../services/preferencesService';

const BudgetCalculator = () => {
  const [formData, setFormData] = useState({
    city: '',
    audienceSize: 50,
    eventType: '',
    venueType: '',
    cateringType: '',
    duration: 4,
    setupTime: 2,
    cleanupTime: 1,
    additionalServices: [],
    specialRequirements: ''
  });

  const [budgetData, setBudgetData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const {
    notifications,
    dismissNotification,
    showSuccess,
    showError,
    showInfo,
    showLoading
  } = useNotifications();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const preferences = await preferencesService.getLatestPreferences();
      if (preferences) {
        // Map event type from dashboard format to budget format
        const budgetEventType = mapEventTypeToBudget(preferences.event_type || preferences.eventType);
        
        setFormData(prev => ({
          ...prev,
          city: preferences.city || prev.city,
          audienceSize: preferences.number_of_people || preferences.numberOfPeople || prev.audienceSize,
          eventType: budgetEventType || prev.eventType,
          venueType: preferences.venue ? mapVenueToType(preferences.venue) : prev.venueType,
        }));
        showInfo('Event preferences loaded from dashboard');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const mapVenueToType = (venue) => {
    const venueMapping = {
      'taj-palace-delhi': 'outdoor-venue',
      'leela-mumbai': 'hotel-ballroom',
      'itc-maurya-delhi': 'conference-center',
      'oberoi-bangalore': 'rooftop-venue',
      'trident-hyderabad': 'outdoor-venue',
      'lalit-ashok-bangalore': 'conference-center',
      'jw-marriott-pune': 'hotel-ballroom',
      'radisson-blu-chennai': 'banquet-hall'
    };
    return venueMapping[venue] || '';
  };

  const mapEventTypeToBudget = (dashboardEventType) => {
    // Map dashboard event types to budget calculator event types
    const eventTypeMapping = {
      'Corporate Conference': 'corporate',
      'Wedding Celebration': 'wedding',
      'Birthday Party': 'birthday',
      'Product Launch': 'product-launch',
      'Academic Seminar': 'academic',
      'Networking Event': 'networking',
      'Charity Fundraiser': 'fundraiser',
      'Music Concert': 'corporate',
      'Art Exhibition': 'corporate',
      'Sports Tournament': 'corporate'
    };
    return eventTypeMapping[dashboardEventType] || dashboardEventType?.toLowerCase()?.replace(/\s+/g, '-') || '';
  };

  // Auto-calculate when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData?.city && formData?.eventType && formData?.venueType) {
        calculateBudget();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const calculateBudget = async () => {
    setIsCalculating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Budget calculation is handled in BudgetBreakdown component
      setBudgetData(null); // Reset to trigger recalculation
      
      showSuccess('Budget calculated successfully!');
    } catch (error) {
      showError('Failed to calculate budget. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleTemplateSelect = (templateData) => {
    setFormData(prev => ({ ...prev, ...templateData }));
    showInfo('Template applied successfully!');
  };

  const handleSaveBudget = () => {
    if (!budgetData) {
      showError('Please calculate a budget first');
      return;
    }

    const savedBudgets = JSON.parse(localStorage.getItem('savedBudgets') || '[]');
    const newBudget = {
      id: Date.now(),
      name: `Budget - ${new Date()?.toLocaleDateString()}`,
      formData,
      budgetData,
      createdAt: new Date()?.toISOString()
    };

    savedBudgets?.push(newBudget);
    localStorage.setItem('savedBudgets', JSON.stringify(savedBudgets));
    
    showSuccess('Budget saved successfully!');
  };

  const handleExportBudget = () => {
    if (!budgetData) {
      showError('Please calculate a budget first');
      return;
    }

    try {
      const exportData = {
        formData,
        budgetData,
        exportedAt: new Date()?.toISOString(),
        summary: {
          totalCost: budgetData?.grandTotal,
          perGuest: formData?.audienceSize > 0 ? budgetData?.grandTotal / formData?.audienceSize : 0,
          perHour: formData?.duration > 0 ? budgetData?.grandTotal / formData?.duration : 0
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-estimate-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Budget exported successfully!');
    } catch (error) {
      showError('Failed to export budget. Please try again.');
    }
  };

  const handleAddScenario = () => {
    if (!budgetData) {
      showError('Please calculate a budget first');
      return;
    }

    if (scenarios?.length >= 5) {
      showError('Maximum 5 scenarios allowed for comparison');
      return;
    }

    const newScenario = {
      id: Date.now(),
      name: `Scenario ${scenarios?.length + 1}`,
      formData: { ...formData },
      ...budgetData,
      createdAt: new Date()?.toISOString()
    };

    setScenarios(prev => [...prev, newScenario]);
    showSuccess('Scenario added to comparison!');
  };

  const handleRemoveScenario = (index) => {
    setScenarios(prev => prev?.filter((_, i) => i !== index));
    if (activeScenario >= scenarios?.length - 1) {
      setActiveScenario(Math.max(0, scenarios?.length - 2));
    }
    showInfo('Scenario removed from comparison');
  };

  const handleSelectScenario = (index) => {
    setActiveScenario(index);
    const scenario = scenarios?.[index];
    if (scenario) {
      setFormData(scenario?.formData);
      setBudgetData({
        venue: scenario?.venue,
        catering: scenario?.catering,
        services: scenario?.services,
        miscellaneous: scenario?.miscellaneous,
        grandTotal: scenario?.grandTotal
      });
    }
  };

  const handleExportComparison = async (scenariosData, insights) => {
    try {
      const comparisonData = {
        scenarios: scenariosData,
        insights,
        exportedAt: new Date()?.toISOString(),
        summary: {
          totalScenarios: scenariosData?.length,
          lowestCost: insights?.minCost,
          highestCost: insights?.maxCost,
          averageCost: insights?.avgCost,
          potentialSavings: insights?.savings
        }
      };

      const blob = new Blob([JSON.stringify(comparisonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-comparison-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Budget comparison exported successfully!');
    } catch (error) {
      showError('Failed to export comparison. Please try again.');
    }
  };

  const handleShareScenarios = (scenariosData) => {
    // This could be enhanced to save to a database and generate a shareable link
    const shareData = {
      scenarios: scenariosData,
      sharedAt: new Date()?.toISOString()
    };
    
    localStorage.setItem('sharedBudgetScenarios', JSON.stringify(shareData));
    showSuccess('Scenarios prepared for sharing!');
  };

  const handleClearAllScenarios = () => {
    setScenarios([]);
    setActiveScenario(0);
    showSuccess('All scenarios cleared');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-expense':
        // Add custom expense functionality
        showInfo('Custom expense feature coming soon!');
        break;
      case 'export-budget':
        handleExportBudget();
        break;
      case 'ai-generate': showInfo('AI budget optimization coming soon!');
        break;
      case 'quick-add':
        handleAddScenario();
        break;
      default:
        showInfo(`${action} feature coming soon!`);
    }
  };

  const isFormValid = formData?.city && formData?.eventType && formData?.venueType && formData?.cateringType;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-3">Event Budget Calculator</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Plan your event budget with confidence. Get instant cost estimates tailored to your needs.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              <BudgetInputForm
                formData={formData}
                onFormChange={handleFormChange}
                onTemplateSelect={handleTemplateSelect}
                onCalculate={calculateBudget}
                isCalculating={isCalculating}
              />


            </div>

            {/* Right Column - Budget Breakdown */}
            <div className="space-y-6">
              {isFormValid ? (
                <BudgetBreakdown
                  formData={formData}
                  budgetData={budgetData}
                  onExport={handleExportBudget}
                  onSave={handleSaveBudget}
                  isCalculating={isCalculating}
                />
              ) : (
                <div className="bg-card rounded-lg border border-border shadow-card p-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-lg mx-auto mb-4">
                      <Icon name="Calculator" size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Ready to Calculate Your Budget?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Fill in the basic information on the left to see your detailed budget breakdown here.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center space-x-2">
                        <Icon 
                          name={formData?.city ? "CheckCircle2" : "Circle"} 
                          size={16} 
                          className={formData?.city ? "text-success" : "text-muted-foreground"} 
                        />
                        <span>Select event city</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Icon 
                          name={formData?.eventType ? "CheckCircle2" : "Circle"} 
                          size={16} 
                          className={formData?.eventType ? "text-success" : "text-muted-foreground"} 
                        />
                        <span>Choose event type</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Icon 
                          name={formData?.venueType ? "CheckCircle2" : "Circle"} 
                          size={16} 
                          className={formData?.venueType ? "text-success" : "text-muted-foreground"} 
                        />
                        <span>Select venue type</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Icon 
                          name={formData?.cateringType ? "CheckCircle2" : "Circle"} 
                          size={16} 
                          className={formData?.cateringType ? "text-success" : "text-muted-foreground"} 
                        />
                        <span>Choose catering style</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


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
      />
    </div>
  );
};

export default BudgetCalculator;