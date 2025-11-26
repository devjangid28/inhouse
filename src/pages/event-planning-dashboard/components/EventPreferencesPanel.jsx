import React, { useState, useEffect } from 'react';
import { MapPin, Save } from 'lucide-react';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import BudgetSlider from '../../../components/ui/BudgetSlider';
import DatePicker from '../../../components/ui/DatePicker';
import TimePicker from '../../../components/ui/TimePicker';
import { preferencesService } from '../../../services/preferencesService';
import { cn } from '../../../utils/cn';

const EventPreferencesPanel = ({ onSave, onLoad, onEventTypeChange }) => {
  const [preferences, setPreferences] = useState({
    venue: '',
    city: '',
    numberOfPeople: 50,
    budget: 50000,
    eventDate: '',
    eventTime: '',
    eventType: '',
    selectedFunctions: [],
    eventDescription: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const eventTypeOptions = [
    { value: 'Corporate Conference', label: 'Corporate Conference' },
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Birthday Party', label: 'Birthday Party' },
    { value: 'Product Launch', label: 'Product Launch' },
    { value: 'Academic Seminar', label: 'Academic Seminar' },
    { value: 'Networking Event', label: 'Networking Event' },
    { value: 'Charity Fundraiser', label: 'Charity Fundraiser' },
    { value: 'Music Concert', label: 'Music Concert' },
    { value: 'Art Exhibition', label: 'Art Exhibition' },
    { value: 'Sports Tournament', label: 'Sports Tournament' },
  ];

  const hinduWeddingFunctions = [
    { value: 'Haldi', label: 'Haldi Ceremony', description: 'Traditional turmeric ceremony for purification and blessings' },
    { value: 'Mehandi', label: 'Mehandi Ceremony', description: 'Intricate henna designs with music and celebration' },
    { value: 'Sangeet', label: 'Sangeet Night', description: 'Musical evening with dance performances and entertainment' },
    { value: 'Engagement', label: 'Engagement Ceremony', description: 'Ring exchange ceremony with family blessings' },
    { value: 'Phera', label: 'Phera Ceremony', description: 'Sacred wedding vows around the holy fire' },
    { value: 'Wedding Night', label: 'Wedding Night', description: 'Main wedding ceremony with traditional rituals' },
    { value: 'Reception', label: 'Reception Party', description: 'Grand celebration dinner with guests and entertainment' },
    { value: 'DJ Night', label: 'DJ Night', description: 'High-energy dance party with professional DJ and lighting' },
    { value: 'Vidai', label: 'Vidai Ceremony', description: 'Emotional farewell ceremony for the bride' },
    { value: 'Griha Pravesh', label: 'Griha Pravesh', description: 'First entry of bride into groom\'s home' },
    { value: 'Tilak', label: 'Tilak Ceremony', description: 'Groom\'s family visits bride\'s home for blessings' },
    { value: 'Jaggo', label: 'Jaggo Ceremony', description: 'Pre-wedding celebration with singing and dancing' }
  ];

  const cityBudgetMultipliers = {
    mumbai: 1.4,
    delhi: 1.3,
    bangalore: 1.2,
    hyderabad: 1.0,
    ahmedabad: 0.9,
    surat: 0.8,
    vadodara: 0.85,
    rajkot: 0.75,
    gandhinagar: 0.9,
    chennai: 1.1,
    kolkata: 0.8,
    pune: 1.1,
    jaipur: 0.9,
    lucknow: 0.7
  };

  const cityOptions = [
    { value: 'mumbai', label: 'Mumbai, Maharashtra' },
    { value: 'delhi', label: 'Delhi, NCR' },
    { value: 'bangalore', label: 'Bangalore, Karnataka' },
    { value: 'hyderabad', label: 'Hyderabad, Telangana' },
    { value: 'ahmedabad', label: 'Ahmedabad, Gujarat' },
    { value: 'surat', label: 'Surat, Gujarat' },
    { value: 'vadodara', label: 'Vadodara, Gujarat' },
    { value: 'rajkot', label: 'Rajkot, Gujarat' },
    { value: 'gandhinagar', label: 'Gandhinagar, Gujarat' },
    { value: 'chennai', label: 'Chennai, Tamil Nadu' },
    { value: 'kolkata', label: 'Kolkata, West Bengal' },
    { value: 'pune', label: 'Pune, Maharashtra' },
    { value: 'jaipur', label: 'Jaipur, Rajasthan' },
    { value: 'lucknow', label: 'Lucknow, Uttar Pradesh' },
  ];

  const venueOptions = [
    { value: 'taj-palace-delhi', label: 'Taj Palace Delhi - Luxury Garden with Gazebo' },
    { value: 'leela-mumbai', label: 'The Leela Mumbai - Grand Ballroom' },
    { value: 'itc-maurya-delhi', label: 'ITC Maurya Delhi - Conference & Banquet Hall' },
    { value: 'oberoi-bangalore', label: 'The Oberoi Bangalore - Premium Rooftop' },
    { value: 'trident-hyderabad', label: 'Trident Hyderabad - Poolside Lawns' },
    { value: 'lalit-ashok-bangalore', label: 'The Lalit Ashok Bangalore - Convention Center' },
    { value: 'jw-marriott-pune', label: 'JW Marriott Pune - Grand Ballroom' },
    { value: 'radisson-blu-chennai', label: 'Radisson Blu Chennai - Banquet Hall' },
    { value: 'hyatt-ahmedabad', label: 'Hyatt Regency Ahmedabad - Crystal Ballroom' },
    { value: 'taj-gateway-surat', label: 'Taj Gateway Surat - Heritage Banquet Hall' },
    { value: 'four-points-vadodara', label: 'Four Points Vadodara - Royal Garden Venue' },
    { value: 'fortune-rajkot', label: 'Fortune Park Rajkot - Grand Convention Center' },
    { value: 'gift-city-gandhinagar', label: 'GIFT City Gandhinagar - Premium Conference Hall' },
    { value: 'courtyard-ahmedabad', label: 'Courtyard Marriott Ahmedabad - Elegant Ballroom' },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await preferencesService.getLatestPreferences();
      if (savedPreferences) {
        let eventType = savedPreferences.eventType || savedPreferences.event_type || '';
        // Convert old event type values to new format
        if (eventType === 'Wedding Celebration' || eventType === 'Hindu Wedding Functions') {
          eventType = 'Wedding';
        }
        
        const loadedPrefs = {
          venue: savedPreferences.venue || '',
          city: savedPreferences.city || '',
          numberOfPeople: savedPreferences.numberOfPeople || savedPreferences.number_of_people || 50,
          budget: savedPreferences.budget || 50000,
          eventDate: savedPreferences.eventDate || savedPreferences.event_date || '',
          eventTime: savedPreferences.eventTime || savedPreferences.event_time || '',
          eventType: eventType,
          selectedFunctions: savedPreferences.selectedFunctions || [],
          eventDescription: savedPreferences.eventDescription || ''
        };
        setPreferences(loadedPrefs);
        if (onLoad) onLoad(savedPreferences);
        if (onEventTypeChange && loadedPrefs.eventType) {
          onEventTypeChange(loadedPrefs.eventType);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleChange = (field, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [field]: value };
      
      // Auto-adjust budget based on city
      if (field === 'city' && value && cityBudgetMultipliers[value]) {
        const baseBudget = 50000;
        const adjustedBudget = Math.round(baseBudget * cityBudgetMultipliers[value]);
        newPrefs.budget = adjustedBudget;
      }
      
      // Generate event description for Hindu wedding functions
      if (field === 'selectedFunctions') {
        const descriptions = value.map(funcValue => {
          const func = hinduWeddingFunctions.find(f => f.value === funcValue);
          return func ? `${func.label}: ${func.description}` : '';
        }).filter(Boolean);
        
        if (descriptions.length > 0) {
          newPrefs.eventDescription = `Hindu Wedding Celebration\n\nSelected Functions:\n${descriptions.join('\n\n')}`;
        }
      }
      
      return newPrefs;
    });
    setHasUnsavedChanges(true);

    if (field === 'eventType' && onEventTypeChange) {
      onEventTypeChange(value);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedData = await preferencesService.savePreferences(preferences);
      setHasUnsavedChanges(false);
      
      // Notify parent component that preferences were saved
      if (onSave) onSave(savedData);
      
      // Store in localStorage for budget calculator to auto-load
      localStorage.setItem('event_preferences_cache', JSON.stringify({
        ...savedData,
        city: preferences.city,
        venue: preferences.venue
      }));
      
      console.log('✅ Preferences saved and synced to budget calculator:', {
        city: preferences.city,
        venue: preferences.venue,
        eventType: preferences.eventType
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return preferences.venue && preferences.numberOfPeople && preferences.budget;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Preferences</h3>
            <p className="text-sm text-gray-600">Configure your event details</p>
          </div>
        </div>

        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Dropdown
          label="Event Type"
          value={preferences.eventType}
          onChange={(value) => handleChange('eventType', value)}
          options={eventTypeOptions}
          placeholder="Select event type..."
        />



        <Dropdown
          label="City / Location"
          value={preferences.city}
          onChange={(value) => handleChange('city', value)}
          options={cityOptions}
          placeholder="Select city..."
          icon={MapPin}
        />

        <Dropdown
          label="Venue"
          value={preferences.venue}
          onChange={(value) => handleChange('venue', value)}
          options={venueOptions}
          placeholder="Select venue..."
          icon={MapPin}
        />

        <NumberInput
          label="Number of People"
          value={preferences.numberOfPeople}
          onChange={(value) => handleChange('numberOfPeople', value)}
          min={1}
          max={1000}
        />

        <div>
          <BudgetSlider
            label={`Budget ${preferences.city ? `(${cityOptions.find(c => c.value === preferences.city)?.label} rates)` : ''}`}
            value={preferences.budget}
            onChange={(value) => handleChange('budget', value)}
          />
          {preferences.city && cityBudgetMultipliers[preferences.city] && (
            <p className="text-xs text-gray-500 mt-1">
              City multiplier: {cityBudgetMultipliers[preferences.city]}x base rate
            </p>
          )}
        </div>

        <DatePicker
          label="Event Date"
          value={preferences.eventDate}
          onChange={(value) => handleChange('eventDate', value)}
        />

        <TimePicker
          label="Event Time"
          value={preferences.eventTime}
          onChange={(value) => handleChange('eventTime', value)}
        />

        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={!isFormValid() || isSaving || !hasUnsavedChanges}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
              isFormValid() && hasUnsavedChanges && !isSaving
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {(preferences.eventType || preferences.venue) && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selection Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {preferences.eventType && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Event Type</p>
                <p className="text-sm font-medium text-gray-900">{preferences.eventType}</p>
              </div>
            )}
            {preferences.city && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">City</p>
                <p className="text-sm font-medium text-gray-900">
                  {cityOptions.find(c => c.value === preferences.city)?.label}
                </p>
              </div>
            )}
            {preferences.venue && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Venue</p>
                <p className="text-sm font-medium text-gray-900">
                  {venueOptions.find(v => v.value === preferences.venue)?.label.split('-')[0].trim()}
                </p>
              </div>
            )}
            {preferences.numberOfPeople && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Attendees</p>
                <p className="text-sm font-medium text-gray-900">{preferences.numberOfPeople} people</p>
              </div>
            )}
            {preferences.budget && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Budget</p>
                <p className="text-sm font-medium text-gray-900">
                  ₹{(preferences.budget / 1000).toFixed(0)}K
                  {preferences.city && cityBudgetMultipliers[preferences.city] && (
                    <span className="text-xs text-blue-600 ml-1">
                      ({cityBudgetMultipliers[preferences.city]}x)
                    </span>
                  )}
                </p>
              </div>
            )}
            {preferences.selectedFunctions?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Functions</p>
                <p className="text-sm font-medium text-gray-900">
                  {preferences.selectedFunctions.length} selected
                </p>
              </div>
            )}
            {preferences.eventDate && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(preferences.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
            {preferences.eventTime && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(`2000-01-01T${preferences.eventTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPreferencesPanel;
