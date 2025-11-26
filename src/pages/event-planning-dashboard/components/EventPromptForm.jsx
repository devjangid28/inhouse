import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { validateEventDescription, sanitizeInput } from '../../../utils/validation';


const EventPromptForm = ({ onGenerate, isGenerating, defaultEventType, eventDescription = '', selectedFunctions = [], attendeeCount = 50, onFunctionsChange }) => {
  const [prompt, setPrompt] = useState(eventDescription || '');
  const [eventType, setEventType] = useState(defaultEventType || '');
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  React.useEffect(() => {
    if (defaultEventType) {
      setEventType(defaultEventType);
    }
  }, [defaultEventType]);

  React.useEffect(() => {
    if (eventDescription && eventDescription !== prompt) {
      setPrompt(eventDescription);
    }
  }, [eventDescription]);

  const eventTypes = [
    'Corporate Conference',
    'Wedding',
    'Birthday Party',
    'Product Launch',
    'Academic Seminar',
    'Networking Event',
    'Charity Fundraiser',
    'Music Concert',
    'Art Exhibition',
    'Sports Tournament'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    // Validate event description
    const descriptionValidation = validateEventDescription(prompt, eventType);
    if (!descriptionValidation.isValid) {
      newErrors.prompt = descriptionValidation.errors[0]; // Show first error
    }
    
    if (!eventType) {
      newErrors.eventType = 'Please select an event type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onGenerate({
        prompt: prompt,
        description: prompt,
        eventType,
        timestamp: new Date()?.toISOString()
      });
    }
  };

  const handlePromptChange = (e) => {
    const sanitizedValue = sanitizeInput(e?.target?.value, true);
    setPrompt(sanitizedValue);
    
    if (errors?.prompt) {
      setErrors(prev => ({ ...prev, prompt: '' }));
    }
    
    // Real-time validation for better UX
    if (sanitizedValue.length > 20 && eventType) {
      setIsValidating(true);
      setTimeout(() => {
        const validation = validateEventDescription(sanitizedValue, eventType);
        if (!validation.isValid) {
          setErrors(prev => ({ ...prev, prompt: validation.errors[0] }));
        }
        setIsValidating(false);
      }, 500);
    }
  };

  const handleEventTypeChange = (e) => {
    setEventType(e?.target?.value);
    if (errors?.eventType) {
      setErrors(prev => ({ ...prev, eventType: '' }));
    }
  };

  const examplePromptsByType = {
    'Corporate Conference': [
      "Plan a tech startup product launch for 200 attendees with networking sessions and live demos",
      "Create a corporate annual conference with keynote speakers, breakout sessions, and team building activities",
      "Organize a leadership summit for 150 executives with panel discussions and executive dinner"
    ],
    'Wedding': [
      "Organize a sustainable wedding celebration for 150 guests with outdoor ceremony and eco-friendly catering",
      "Plan a beach wedding for 100 guests with cocktail hour, dinner reception, and live band entertainment",
      "Create a destination wedding for 200 guests with welcome party, ceremony, and grand reception"
    ],
    'Birthday Party': [
      "Plan a milestone 50th birthday celebration for 80 guests with themed decorations and live entertainment",
      "Organize a kids' birthday party for 30 children with games, activities, and birthday cake ceremony",
      "Create an adult birthday celebration with cocktail party, DJ, and midnight cake cutting for 60 guests"
    ],
    'Product Launch': [
      "Plan a product launch event for 250 attendees with product demos, media coverage, and networking reception",
      "Organize a tech gadget launch with hands-on demos, influencer meet-and-greet, and cocktail reception for 200 people",
      "Create a fashion line launch event with runway show, celebrity appearances, and after-party for 150 guests"
    ],
    'Academic Seminar': [
      "Organize a research symposium for 100 academics with paper presentations, poster sessions, and networking lunch",
      "Plan an educational workshop for 50 students with lectures, hands-on activities, and certification ceremony",
      "Create a conference for 200 educators with keynote speeches, breakout sessions, and panel discussions"
    ],
    'Networking Event': [
      "Plan a business networking mixer for 100 professionals with speed networking, refreshments, and keynote speaker",
      "Organize an industry meetup for 75 professionals with presentations, panel discussion, and networking hour",
      "Create a career fair for 200 job seekers with company booths, resume reviews, and networking sessions"
    ],
    'Charity Fundraiser': [
      "Plan a charity gala for 150 donors with silent auction, dinner, and entertainment to raise funds for education",
      "Organize a charity run for 300 participants with registration, race, awards ceremony, and sponsor booths",
      "Create a charity concert for 500 attendees with live performances, donation drives, and awareness campaigns"
    ],
    'Music Concert': [
      "Plan a rock concert for 1000 fans with opening acts, main performance, and VIP meet-and-greet section",
      "Organize a classical music evening for 200 attendees with orchestra performance and cocktail reception",
      "Create a music festival for 2000 people with multiple stages, food vendors, and camping facilities"
    ],
    'Art Exhibition': [
      "Plan an art gallery opening for 100 guests with artist meet-and-greet, wine tasting, and guided tours",
      "Organize a contemporary art exhibition for 150 visitors with interactive installations and artist talks",
      "Create a photography exhibition for 80 attendees with photo displays, artist Q&A, and networking reception"
    ],
    'Sports Tournament': [
      "Plan a corporate cricket tournament for 200 participants with matches, awards ceremony, and closing dinner",
      "Organize a football league for 150 players with multiple matches, refreshments, and trophy presentation",
      "Create a sports day for 300 participants with various games, competitions, and medal ceremonies"
    ]
  };

  const getExamplePrompts = () => {
    // For Wedding event type, always show wedding-specific examples
    if (eventType === 'Wedding') {
      // Get saved preferences for auto-population
      const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
      const guestCount = attendeeCount || savedPrefs.numberOfPeople || 200;
      const venue = savedPrefs.venue ? savedPrefs.venue.split('-')[0] : 'luxury venue';
      const city = savedPrefs.city ? savedPrefs.city.charAt(0).toUpperCase() + savedPrefs.city.slice(1) : 'Delhi';
      const budget = savedPrefs.budget ? `₹${(savedPrefs.budget / 100000).toFixed(1)} lakh` : '₹5-10 lakh';
      
      if (selectedFunctions.length > 0) {
        // Generate examples based on ONLY selected functions
        const functionNames = selectedFunctions.map(func => {
          const functionMap = {
            'Haldi': 'haldi ceremony',
            'Mehandi': 'mehendi ceremony', 
            'Sangeet': 'sangeet night',
            'Engagement': 'engagement ceremony',
            'Phera': 'phera ceremony',
            'Wedding Night': 'wedding ceremony',
            'Reception': 'reception party',
            'DJ Night': 'DJ night',
            'Vidai': 'vidai ceremony',
            'Griha Pravesh': 'griha pravesh',
            'Tilak': 'tilak ceremony',
            'Jaggo': 'jaggo ceremony'
          };
          return functionMap[func] || func.toLowerCase();
        });
        
        const selectedFunctionsText = functionNames.join(' and ');
        const days = selectedFunctions.length === 1 ? '1 day' : selectedFunctions.length <= 3 ? '2-3 days' : selectedFunctions.length <= 6 ? '4-5 days' : '6-7 days';
        
        return [
          `Plan a Hindu wedding ${selectedFunctionsText} for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include traditional decorations, authentic catering, cultural performances, professional photography, email invitations, and social media campaigns spanning ${days}`,
          `Organize ${selectedFunctionsText} celebration for ${guestCount} guests in ${city} with budget ${budget}. Venue ${venue}, arrange traditional rituals, premium decorations, multi-cuisine catering, live entertainment, digital invitations, and promotional materials over ${days}`,
          `Create authentic ${selectedFunctionsText} for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan traditional ceremonies, luxury decorations, premium catering, professional photography, email marketing, and social media promotion across ${days}`
        ];
      } else {
        // General wedding examples with auto-populated details
        return [
          `Plan a traditional Hindu wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include ceremony and reception with authentic decorations, catering, photography, email invitations, and social media campaigns`,
          `Organize a wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Venue ${venue}, include ceremonies and reception with luxury arrangements, entertainment, digital marketing, and guest services`,
          `Create a grand wedding celebration for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan traditional ceremonies, premium catering, cultural performances, professional photography, email campaigns, and social media promotion`
        ];
      }
    }
    
    // Fallback for other event types
    if (eventType && examplePromptsByType[eventType]) {
      return examplePromptsByType[eventType];
    }
    return [
      "Plan a tech startup product launch for 200 attendees with networking sessions and live demos",
      "Organize a sustainable wedding celebration for 150 guests with outdoor ceremony and eco-friendly catering",
      "Create a corporate annual conference with keynote speakers, breakout sessions and team building activities"
    ];
  };

  const examplePrompts = getExamplePrompts();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Icon name="Sparkles" size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Event Planner</h3>
          <p className="text-sm text-gray-600">Describe your vision and let AI create your perfect event plan</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={handleEventTypeChange}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.eventType ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Select event type...</option>
            {eventTypes?.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors?.eventType && (
            <p className="mt-1 text-sm text-error">{errors?.eventType}</p>
          )}
        </div>

        {/* Hindu Wedding Functions */}
        {eventType === 'Wedding' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hindu Wedding Functions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
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
              ].map((func) => (
                <label key={func.value} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFunctions?.includes(func.value)}
                    onChange={(e) => {
                      const newFunctions = e.target.checked
                        ? [...(selectedFunctions || []), func.value]
                        : (selectedFunctions || []).filter(f => f !== func.value);
                      if (onFunctionsChange) {
                        onFunctionsChange(newFunctions);
                      }
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{func.label}</span>
                </label>
              ))}
            </div>
            {selectedFunctions?.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Selected Functions Preview:</p>
                <div className="space-y-1">
                  {selectedFunctions.map(funcValue => {
                    const func = [
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
                    ].find(f => f.value === funcValue);
                    return func ? (
                      <div key={funcValue} className="text-xs text-blue-700">
                        <span className="font-medium">{func.label}:</span> {func.description}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Description
            {isValidating && (
              <span className="ml-2 text-xs text-primary">
                <Icon name="Loader2" size={12} className="inline animate-spin mr-1" />
                Validating...
              </span>
            )}
          </label>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder={`Describe your ${eventType || 'event'} vision in detail... Include audience size, venue preferences, key activities, budget range, and any special requirements. Be specific and detailed for better AI-generated plans.

You can write in English or Hindi. Feel free to use multiple lines and detailed descriptions for better results.`}
            rows={8}
            className={`w-full px-4 py-3 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[200px] ${
              errors?.prompt ? 'border-error' : 'border-border'
            }`}
            style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}
          />
          <div className="flex justify-between items-center mt-1">
            {errors?.prompt ? (
              <div className="flex items-center text-sm text-error">
                <Icon name="AlertCircle" size={14} className="mr-1" />
                {errors?.prompt}
              </div>
            ) : (
              <p className={`text-xs ${
                prompt?.length < 20 ? 'text-warning' : 
                prompt?.length > 1500 ? 'text-error' : 'text-muted-foreground'
              }`}>
                {prompt?.length}/2000 characters
                {prompt?.length < 20 && ' (minimum 20 required)'}
                {prompt?.length > 1500 && ' (approaching limit)'}
              </p>
            )}
          </div>
        </div>

        {/* Example Prompts */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Need inspiration? Try these examples:</p>
          <div className="space-y-2">
            {examplePrompts?.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setPrompt(example);
                  // Auto-populate missing details from preferences if needed
                  const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
                  if (savedPrefs && Object.keys(savedPrefs).length > 0) {
                    // Trigger a small delay to ensure the prompt is set first
                    setTimeout(() => {
                      if (errors?.prompt) {
                        setErrors(prev => ({ ...prev, prompt: '' }));
                      }
                    }, 100);
                  }
                }}
                className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-md text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name="Lightbulb" size={14} className="inline mr-2" />
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isGenerating || isValidating}
          iconName="Sparkles"
          iconPosition="left"
          disabled={isGenerating || isValidating}
        >
          {isGenerating ? 'Generating Your Event Plan...' : 
           isValidating ? 'Validating Description...' : 
           'Generate Event Plan'}
        </Button>
      </form>
      {/* AI Features Info */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Timeline Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Task Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="IndianRupee" size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Budget Estimation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPromptForm;