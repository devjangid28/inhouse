import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetBreakdown = ({ 
  formData, 
  budgetData, 
  onExport, 
  onSave,
  isCalculating = false 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    venue: true,
    catering: true,
    services: false,
    miscellaneous: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const calculateBudget = () => {
    if (!formData?.city || !formData?.eventType || !formData?.venueType) {
      return {
        venue: { total: 0, items: [] },
        catering: { total: 0, items: [] },
        services: { total: 0, items: [] },
        miscellaneous: { total: 0, items: [] },
        grandTotal: 0
      };
    }

    // Base pricing multipliers by city (Indian cities)
    const cityMultipliers = {
      mumbai: 1.4,
      delhi: 1.3,
      bangalore: 1.2,
      hyderabad: 1.0,
      ahmedabad: 0.9,
      chennai: 1.1,
      kolkata: 0.8,
      pune: 1.1,
      jaipur: 0.9,
      lucknow: 0.7
    };

    // Base venue costs
    const venueCosts = {
      'hotel-ballroom': 2000,
      'conference-center': 1500,
      'restaurant': 1200,
      'outdoor-venue': 800,
      'community-center': 500,
      'university-hall': 600,
      'banquet-hall': 1000,
      'rooftop-venue': 1800
    };

    // Base catering costs per person
    const cateringCosts = {
      'full-service': 85,
      'buffet': 45,
      'cocktail': 35,
      'plated-dinner': 75,
      'box-lunch': 25,
      'coffee-break': 15,
      'no-catering': 0
    };

    // Additional services costs
    const serviceCosts = {
      'av-equipment': 800,
      'photography': 1200,
      'music': 600,
      'flowers': 400,
      'security': 300,
      'parking': 200,
      'registration': 150,
      'transportation': 500
    };

    const cityMultiplier = cityMultipliers?.[formData?.city] || 1.0;
    const audienceSize = formData?.audienceSize || 50;
    const duration = formData?.duration || 4;

    // Calculate venue costs
    const baseVenueCost = venueCosts?.[formData?.venueType] || 1000;
    const venueCost = Math.round(baseVenueCost * cityMultiplier * (duration / 4));
    const setupCost = Math.round((formData?.setupTime || 2) * 100 * cityMultiplier);
    const cleanupCost = Math.round((formData?.cleanupTime || 1) * 80 * cityMultiplier);

    const venueItems = [
      { name: 'Venue Rental', cost: venueCost, description: `${duration} hours rental` },
      { name: 'Setup Time', cost: setupCost, description: `${formData?.setupTime || 2} hours` },
      { name: 'Cleanup Time', cost: cleanupCost, description: `${formData?.cleanupTime || 1} hours` }
    ];

    // Calculate catering costs
    const baseCateringCost = cateringCosts?.[formData?.cateringType] || 0;
    const cateringCost = Math.round(baseCateringCost * audienceSize * cityMultiplier);
    const serviceFee = Math.round(cateringCost * 0.18); // 18% service fee
    const taxAmount = Math.round((cateringCost + serviceFee) * 0.08); // 8% tax

    const cateringItems = cateringCost > 0 ? [
      { name: 'Food & Beverage', cost: cateringCost, description: `${audienceSize} guests` },
      { name: 'Service Fee (18%)', cost: serviceFee, description: 'Gratuity and service' },
      { name: 'Tax (8%)', cost: taxAmount, description: 'Local sales tax' }
    ] : [
      { name: 'No Catering Selected', cost: 0, description: 'External or no catering' }
    ];

    // Calculate additional services
    const selectedServices = formData?.additionalServices || [];
    const servicesItems = selectedServices?.map(serviceId => {
      const baseCost = serviceCosts?.[serviceId] || 0;
      const adjustedCost = Math.round(baseCost * cityMultiplier);
      return {
        name: serviceId?.split('-')?.map(word => 
          word?.charAt(0)?.toUpperCase() + word?.slice(1)
        )?.join(' '),
        cost: adjustedCost,
        description: 'Professional service'
      };
    });

    // Calculate miscellaneous costs
    const contingency = Math.round((venueCost + cateringCost + serviceFee + taxAmount + 
      servicesItems?.reduce((sum, item) => sum + item?.cost, 0)) * 0.1); // 10% contingency
    const permits = formData?.eventType === 'outdoor-venue' ? Math.round(200 * cityMultiplier) : 0;
    const insurance = Math.round(150 * cityMultiplier);

    const miscellaneousItems = [
      { name: 'Contingency (10%)', cost: contingency, description: 'Unexpected expenses buffer' },
      { name: 'Event Insurance', cost: insurance, description: 'Liability coverage' }
    ];

    if (permits > 0) {
      miscellaneousItems?.push({ 
        name: 'Permits & Licenses', 
        cost: permits, 
        description: 'Required permits' 
      });
    }

    // Calculate totals
    const venueTotal = venueItems?.reduce((sum, item) => sum + item?.cost, 0);
    const cateringTotal = cateringItems?.reduce((sum, item) => sum + item?.cost, 0);
    const servicesTotal = servicesItems?.reduce((sum, item) => sum + item?.cost, 0);
    const miscellaneousTotal = miscellaneousItems?.reduce((sum, item) => sum + item?.cost, 0);
    const grandTotal = venueTotal + cateringTotal + servicesTotal + miscellaneousTotal;

    return {
      venue: { total: venueTotal, items: venueItems },
      catering: { total: cateringTotal, items: cateringItems },
      services: { total: servicesTotal, items: servicesItems },
      miscellaneous: { total: miscellaneousTotal, items: miscellaneousItems },
      grandTotal
    };
  };

  const budget = budgetData || calculateBudget();

  const budgetSections = [
    {
      id: 'venue',
      title: 'Venue & Facilities',
      icon: 'MapPin',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      data: budget?.venue
    },
    {
      id: 'catering',
      title: 'Catering & Service',
      icon: 'UtensilsCrossed',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      data: budget?.catering
    },
    {
      id: 'services',
      title: 'Additional Services',
      icon: 'Settings',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      data: budget?.services
    },
    {
      id: 'miscellaneous',
      title: 'Miscellaneous',
      icon: 'MoreHorizontal',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      data: budget?.miscellaneous
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-success/5 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
              <Icon name="Receipt" size={20} className="text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Your Budget Summary</h2>
              <p className="text-sm text-muted-foreground">Estimated costs breakdown</p>
            </div>
          </div>
        </div>
      </div>
      {/* Grand Total */}
      <div className="p-8 border-b border-border bg-gradient-to-br from-success/10 to-primary/10">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Estimated Cost</p>
          {isCalculating ? (
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Loader2" size={24} className="text-primary animate-spin" />
              <span className="text-xl font-semibold text-muted-foreground">Calculating...</span>
            </div>
          ) : (
            <div className="text-5xl font-bold text-success mb-2">
              {formatCurrency(budget?.grandTotal)}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            For {formData?.audienceSize || 0} guests • {formData?.duration || 0} hours
          </p>
        </div>
      </div>
      {/* Budget Sections */}
      <div className="p-6 space-y-3">
        {budgetSections?.map((section) => (
          <div key={section?.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all">
            <button
              onClick={() => toggleSection(section?.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-smooth"
            >
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 ${section?.bgColor} rounded-lg`}>
                  <Icon name={section?.icon} size={18} className={section?.color} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground text-base">{section?.title}</h4>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(section?.data?.total)}
                </span>
                <Icon 
                  name={expandedSections?.[section?.id] ? "ChevronUp" : "ChevronDown"} 
                  size={18} 
                  className="text-muted-foreground" 
                />
              </div>
            </button>

            {expandedSections?.[section?.id] && (
              <div className="px-4 pb-4 border-t border-border bg-muted/5">
                {section?.data?.items?.length > 0 ? (
                  <div className="space-y-2 pt-3">
                    {section?.data?.items?.map((item, index) => (
                      <div key={index} className="flex items-start justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{item?.name}</p>
                          <p className="text-xs text-muted-foreground">{item?.description}</p>
                        </div>
                        <span className="font-semibold text-foreground ml-4 flex-shrink-0">
                          {formatCurrency(item?.cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items in this category
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="p-6 border-t border-border bg-muted/10">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Quick Insights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <Icon name="Users" size={20} className="text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Cost Per Guest</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(formData?.audienceSize > 0 ? budget?.grandTotal / formData?.audienceSize : 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <Icon name="Clock" size={20} className="text-secondary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Cost Per Hour</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(formData?.duration > 0 ? budget?.grandTotal / formData?.duration : 0)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            iconName="Save"
            iconPosition="left"
            className="flex-1"
          >
            Save Budget
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
            className="flex-1"
          >
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;