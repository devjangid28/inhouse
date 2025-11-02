import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const BudgetInputForm = ({ 
  formData, 
  onFormChange, 
  onTemplateSelect, 
  onCalculate,
  isCalculating = false 
}) => {

  const cityOptions = [
    { value: 'new-york', label: 'New York, NY', description: 'High cost metropolitan area' },
    { value: 'los-angeles', label: 'Los Angeles, CA', description: 'Premium West Coast pricing' },
    { value: 'chicago', label: 'Chicago, IL', description: 'Moderate Midwest pricing' },
    { value: 'houston', label: 'Houston, TX', description: 'Competitive Southern rates' },
    { value: 'phoenix', label: 'Phoenix, AZ', description: 'Affordable Southwest pricing' },
    { value: 'philadelphia', label: 'Philadelphia, PA', description: 'Mid-Atlantic standard rates' },
    { value: 'san-antonio', label: 'San Antonio, TX', description: 'Budget-friendly options' },
    { value: 'san-diego', label: 'San Diego, CA', description: 'Premium coastal pricing' },
    { value: 'dallas', label: 'Dallas, TX', description: 'Competitive metropolitan rates' },
    { value: 'austin', label: 'Austin, TX', description: 'Growing market pricing' }
  ];

  const eventTypeOptions = [
    { value: 'corporate', label: 'Corporate Event', description: 'Business meetings, conferences' },
    { value: 'wedding', label: 'Wedding', description: 'Marriage ceremonies and receptions' },
    { value: 'birthday', label: 'Birthday Party', description: 'Personal celebrations' },
    { value: 'academic', label: 'Academic Event', description: 'Educational conferences, seminars' },
    { value: 'fundraiser', label: 'Fundraiser', description: 'Charity and non-profit events' },
    { value: 'product-launch', label: 'Product Launch', description: 'Business product unveiling' },
    { value: 'networking', label: 'Networking Event', description: 'Professional networking gatherings' },
    { value: 'workshop', label: 'Workshop', description: 'Educational training sessions' }
  ];

  const venueTypeOptions = [
    { value: 'hotel-ballroom', label: 'Hotel Ballroom', description: 'Luxury hotel event spaces' },
    { value: 'conference-center', label: 'Conference Center', description: 'Professional meeting facilities' },
    { value: 'restaurant', label: 'Restaurant', description: 'Private dining venues' },
    { value: 'outdoor-venue', label: 'Outdoor Venue', description: 'Gardens, parks, outdoor spaces' },
    { value: 'community-center', label: 'Community Center', description: 'Local community facilities' },
    { value: 'university-hall', label: 'University Hall', description: 'Academic institution venues' },
    { value: 'banquet-hall', label: 'Banquet Hall', description: 'Dedicated event halls' },
    { value: 'rooftop-venue', label: 'Rooftop Venue', description: 'Urban rooftop spaces' }
  ];

  const cateringTypeOptions = [
    { value: 'full-service', label: 'Full Service Catering', description: 'Complete meal service with staff' },
    { value: 'buffet', label: 'Buffet Style', description: 'Self-service buffet setup' },
    { value: 'cocktail', label: 'Cocktail Reception', description: 'Light appetizers and drinks' },
    { value: 'plated-dinner', label: 'Plated Dinner', description: 'Formal sit-down dinner service' },
    { value: 'box-lunch', label: 'Box Lunch', description: 'Individual packaged meals' },
    { value: 'coffee-break', label: 'Coffee & Pastries', description: 'Light refreshments only' },
    { value: 'no-catering', label: 'No Catering', description: 'External catering or none' }
  ];

  const eventTemplates = [
    {
      id: 'corporate-meeting',
      name: 'Corporate Meeting',
      icon: 'Building2',
      data: {
        city: 'new-york',
        audienceSize: 50,
        eventType: 'corporate',
        venueType: 'conference-center',
        cateringType: 'coffee-break',
        duration: 4,
        additionalServices: ['av-equipment', 'parking']
      }
    },
    {
      id: 'wedding-reception',
      name: 'Wedding Reception',
      icon: 'Heart',
      data: {
        city: 'los-angeles',
        audienceSize: 150,
        eventType: 'wedding',
        venueType: 'hotel-ballroom',
        cateringType: 'plated-dinner',
        duration: 8,
        additionalServices: ['photography', 'music', 'flowers']
      }
    },
    {
      id: 'academic-conference',
      name: 'Academic Conference',
      icon: 'GraduationCap',
      data: {
        city: 'chicago',
        audienceSize: 200,
        eventType: 'academic',
        venueType: 'university-hall',
        cateringType: 'buffet',
        duration: 6,
        additionalServices: ['av-equipment', 'registration']
      }
    },
    {
      id: 'product-launch',
      name: 'Product Launch',
      icon: 'Rocket',
      data: {
        city: 'san-diego',
        audienceSize: 100,
        eventType: 'product-launch',
        venueType: 'rooftop-venue',
        cateringType: 'cocktail',
        duration: 4,
        additionalServices: ['av-equipment', 'photography', 'security']
      }
    }
  ];

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleTemplateClick = (template) => {
    onTemplateSelect(template?.data);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="Calculator" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Event Budget Calculator</h2>
            <p className="text-sm text-muted-foreground">Fill in the details below to generate your budget</p>
          </div>
        </div>
      </div>

      {/* Event Templates */}
      <div className="p-6 border-b border-border bg-muted/20">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
          <Icon name="Sparkles" size={16} className="text-primary mr-2" />
          Quick Start Templates
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {eventTemplates?.map((template) => (
            <Button
              key={template?.id}
              variant="outline"
              size="sm"
              onClick={() => handleTemplateClick(template)}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <Icon name={template?.icon} size={16} className="text-primary" />
              <span className="text-xs font-medium">{template?.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Form Content - Single Page */}
      <div className="p-6">
        <div className="space-y-8">
          {/* Step 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">1</div>
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
            </div>

            <Select
              label="Event City"
              description="Location affects pricing and vendor availability"
              options={cityOptions}
              value={formData?.city}
              onChange={(value) => handleInputChange('city', value)}
              searchable
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expected Audience Size <span className="text-destructive">*</span>
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={formData?.audienceSize}
                  onChange={(e) => handleInputChange('audienceSize', parseInt(e?.target?.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10 people</span>
                  <span className="font-medium text-primary text-base">{formData?.audienceSize} people</span>
                  <span>1000+ people</span>
                </div>
              </div>
            </div>

            <Select
              label="Event Type"
              description="Event category affects service requirements"
              options={eventTypeOptions}
              value={formData?.eventType}
              onChange={(value) => handleInputChange('eventType', value)}
              required
            />
          </div>

          {/* Step 2: Venue & Catering */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">2</div>
              <h3 className="text-lg font-semibold text-foreground">Venue & Catering</h3>
            </div>

            <Select
              label="Venue Type"
              description="Venue category affects base rental costs"
              options={venueTypeOptions}
              value={formData?.venueType}
              onChange={(value) => handleInputChange('venueType', value)}
              required
            />

            <Select
              label="Catering Style"
              description="Catering type significantly impacts food costs"
              options={cateringTypeOptions}
              value={formData?.cateringType}
              onChange={(value) => handleInputChange('cateringType', value)}
              required
            />

            <Input
              label="Event Duration (hours)"
              type="number"
              min="1"
              max="24"
              value={formData?.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e?.target?.value))}
              placeholder="Enter duration in hours"
              description="Total event duration"
            />
          </div>

          {/* Step 3: Additional Services (Optional) */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 bg-muted text-foreground rounded-full text-xs font-bold">3</div>
              <h3 className="text-lg font-semibold text-foreground">Additional Services <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Add-on Services
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'av-equipment', label: 'AV Equipment', icon: 'Monitor' },
                  { id: 'photography', label: 'Photography', icon: 'Camera' },
                  { id: 'music', label: 'Music/DJ', icon: 'Music' },
                  { id: 'flowers', label: 'Floral Arrangements', icon: 'Flower' },
                  { id: 'security', label: 'Security', icon: 'Shield' },
                  { id: 'parking', label: 'Parking', icon: 'Car' }
                ]?.map((service) => (
                  <label
                    key={service?.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-smooth ${
                      formData?.additionalServices?.includes(service?.id)
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData?.additionalServices?.includes(service?.id) || false}
                      onChange={(e) => {
                        const services = formData?.additionalServices || [];
                        if (e?.target?.checked) {
                          handleInputChange('additionalServices', [...services, service?.id]);
                        } else {
                          handleInputChange('additionalServices', services?.filter(s => s !== service?.id));
                        }
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <Icon name={service?.icon} size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{service?.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-start space-x-3">
            <Icon name="Info" size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Fill in the required fields marked with an asterisk (*)</li>
                <li>Your budget will automatically calculate as you type</li>
                <li>View detailed breakdown on the right side panel</li>
                <li>Export or save your budget for future reference</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetInputForm;