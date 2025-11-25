import React, { createContext, useContext, useState, useEffect } from 'react';
import { preferencesService } from '../services/preferencesService';

const EventPlanningContext = createContext();

export const useEventPlanning = () => {
  const context = useContext(EventPlanningContext);
  if (!context) {
    throw new Error('useEventPlanning must be used within an EventPlanningProvider');
  }
  return context;
};

export const EventPlanningProvider = ({ children }) => {
  // Shared state for event planning dashboard
  const [dashboardData, setDashboardData] = useState({
    eventName: '',
    eventType: '',
    description: '',
    prompt: '',
    date: '',
    time: '',
    location: '',
    city: '',
    venue: '',
    venueType: '',
    audienceSize: 50,
    duration: 4,
    budget: 0,
    selectedFunctions: [],
  });

  // Shared state for budget calculator
  const [budgetData, setBudgetData] = useState({
    city: '',
    audienceSize: 50,
    eventType: '',
    venueType: '',
    cateringType: '',
    duration: 4,
    setupTime: 2,
    cleanupTime: 1,
    additionalServices: [],
    specialRequirements: '',
  });

  // Shared generated content and event data
  const [eventData, setEventData] = useState(null);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [calculatedBudget, setCalculatedBudget] = useState(null);

  // Load preferences on mount
  useEffect(() => {
    loadSharedPreferences();
  }, []);

  const loadSharedPreferences = async () => {
    try {
      const preferences = await preferencesService.getLatestPreferences();
      if (preferences) {
        // Update dashboard data
        setDashboardData(prev => ({
          ...prev,
          eventType: preferences.event_type || preferences.eventType || prev.eventType,
          city: preferences.city || prev.city,
          venue: preferences.venue || prev.venue,
          audienceSize: preferences.number_of_people || preferences.numberOfPeople || prev.audienceSize,
          budget: preferences.budget || prev.budget,
          date: preferences.event_date || preferences.eventDate || prev.date,
          time: preferences.event_time || preferences.eventTime || prev.time,
          selectedFunctions: preferences.selectedFunctions || prev.selectedFunctions,
        }));

        // Update budget calculator data
        const budgetEventType = mapEventTypeToBudget(preferences.event_type || preferences.eventType);
        const mappedVenueType = preferences.venue ? mapVenueToType(preferences.venue) : '';
        
        setBudgetData(prev => ({
          ...prev,
          city: preferences.city || prev.city,
          audienceSize: preferences.number_of_people || preferences.numberOfPeople || prev.audienceSize,
          eventType: budgetEventType || prev.eventType,
          venueType: mappedVenueType || prev.venueType,
        }));

        console.log('✅ Shared preferences loaded:', {
          city: preferences.city,
          eventType: preferences.event_type || preferences.eventType,
          audienceSize: preferences.number_of_people || preferences.numberOfPeople
        });
      }
    } catch (error) {
      console.error('Error loading shared preferences:', error);
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

  // Update dashboard data and sync to budget calculator
  const updateDashboardData = (updates) => {
    setDashboardData(prev => {
      const newData = { ...prev, ...updates };
      
      // Sync city to budget calculator
      if (updates.city !== undefined) {
        setBudgetData(prevBudget => ({ ...prevBudget, city: updates.city }));
      }
      
      // Sync event type to budget calculator
      if (updates.eventType !== undefined) {
        const budgetEventType = mapEventTypeToBudget(updates.eventType);
        setBudgetData(prevBudget => ({ ...prevBudget, eventType: budgetEventType }));
      }
      
      // Sync audience size
      if (updates.audienceSize !== undefined) {
        setBudgetData(prevBudget => ({ ...prevBudget, audienceSize: updates.audienceSize }));
      }
      
      // Sync venue type
      if (updates.venueType !== undefined) {
        setBudgetData(prevBudget => ({ ...prevBudget, venueType: updates.venueType }));
      }

      // Sync duration
      if (updates.duration !== undefined) {
        setBudgetData(prevBudget => ({ ...prevBudget, duration: updates.duration }));
      }

      return newData;
    });
  };

  // Update budget calculator data and sync back to dashboard
  const updateBudgetData = (updates) => {
    setBudgetData(prev => {
      const newData = { ...prev, ...updates };
      
      // Sync city back to dashboard
      if (updates.city !== undefined) {
        setDashboardData(prevDashboard => ({ ...prevDashboard, city: updates.city }));
      }
      
      // Sync audience size back to dashboard
      if (updates.audienceSize !== undefined) {
        setDashboardData(prevDashboard => ({ ...prevDashboard, audienceSize: updates.audienceSize }));
      }
      
      // Sync venue type back to dashboard
      if (updates.venueType !== undefined) {
        setDashboardData(prevDashboard => ({ ...prevDashboard, venueType: updates.venueType }));
      }

      // Sync duration back to dashboard
      if (updates.duration !== undefined) {
        setDashboardData(prevDashboard => ({ ...prevDashboard, duration: updates.duration }));
      }

      return newData;
    });
  };

  // Save preferences with both dashboard and budget data
  const saveSharedPreferences = async () => {
    try {
      const preferences = {
        eventType: dashboardData.eventType,
        city: dashboardData.city || budgetData.city,
        venue: dashboardData.venue,
        numberOfPeople: dashboardData.audienceSize || budgetData.audienceSize,
        budget: dashboardData.budget,
        eventDate: dashboardData.date,
        eventTime: dashboardData.time,
        selectedFunctions: dashboardData.selectedFunctions,
      };

      await preferencesService.savePreferences(preferences);
      console.log('✅ Shared preferences saved:', preferences);
      return true;
    } catch (error) {
      console.error('Error saving shared preferences:', error);
      return false;
    }
  };

  const value = {
    // Dashboard state
    dashboardData,
    updateDashboardData,
    
    // Budget calculator state
    budgetData,
    updateBudgetData,
    
    // Shared generated content
    eventData,
    setEventData,
    generatedContent,
    setGeneratedContent,
    hasGeneratedContent,
    setHasGeneratedContent,
    calculatedBudget,
    setCalculatedBudget,
    
    // Utilities
    saveSharedPreferences,
    loadSharedPreferences,
  };

  return (
    <EventPlanningContext.Provider value={value}>
      {children}
    </EventPlanningContext.Provider>
  );
};
