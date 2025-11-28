import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { validateEventDescription, sanitizeInput } from '../../../utils/validation';


const EventPromptForm = ({ onGenerate, isGenerating, defaultEventType, eventDescription = '', selectedFunctions = [], attendeeCount = 50, onFunctionsChange, religion = '' }) => {
  const [prompt, setPrompt] = useState(eventDescription || '');
  const [eventType, setEventType] = useState(defaultEventType || '');
  const [currentReligion, setCurrentReligion] = useState(religion || '');
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

  React.useEffect(() => {
    const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
    const religionToUse = religion || savedPrefs.religion || '';
    setCurrentReligion(religionToUse);
  }, [religion]);

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
    // For Wedding event type, show religion and function-specific examples
    if (eventType === 'Wedding') {
      const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
      const guestCount = attendeeCount || savedPrefs.numberOfPeople || 200;
      const venue = savedPrefs.venue ? savedPrefs.venue.split('-')[0] : 'luxury venue';
      const city = savedPrefs.city ? savedPrefs.city.charAt(0).toUpperCase() + savedPrefs.city.slice(1) : 'Delhi';
      const budget = savedPrefs.budget ? `₹${(savedPrefs.budget / 100000).toFixed(1)} lakh` : '₹5-10 lakh';
      
      // Religion-specific function mapping
      const religionFunctionMap = {
        Hindu: {
          'Haldi': 'haldi ceremony', 'Mehandi': 'mehendi ceremony', 'Sangeet': 'sangeet night',
          'Engagement': 'engagement ceremony', 'Phera': 'phera ceremony', 'Wedding Night': 'wedding ceremony',
          'Reception': 'reception party', 'DJ Night': 'DJ night', 'Vidai': 'vidai ceremony',
          'Griha Pravesh': 'griha pravesh', 'Tilak': 'tilak ceremony', 'Jaggo': 'jaggo ceremony'
        },
        Muslim: {
          'Mangni': 'mangni ceremony', 'Mehendi': 'mehendi ceremony', 'Sangeet': 'sangeet night',
          'Nikah': 'nikah ceremony', 'Walima': 'walima reception', 'Rukhsati': 'rukhsati ceremony'
        },
        Christian: {
          'Engagement': 'engagement ceremony', 'Church Wedding': 'church wedding ceremony',
          'Reception': 'reception party', 'Bridal Shower': 'bridal shower'
        },
        Sikh: {
          'Roka': 'roka ceremony', 'Mehandi': 'mehendi ceremony', 'Sangeet': 'sangeet night',
          'Anand Karaj': 'anand karaj ceremony', 'Reception': 'reception party'
        }
      };
      
      if (selectedFunctions.length > 0 && currentReligion) {
        // Generate examples based on selected religion and functions
        const functionMap = religionFunctionMap[currentReligion] || {};
        const functionNames = selectedFunctions.map(func => functionMap[func] || func.toLowerCase());
        const selectedFunctionsText = functionNames.join(', ');
        const days = selectedFunctions.length === 1 ? '1 day' : selectedFunctions.length <= 3 ? '2-3 days' : selectedFunctions.length <= 6 ? '4-5 days' : '6-7 days';
        
        return [
          `Plan a ${currentReligion} wedding with ${selectedFunctionsText} for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include traditional decorations, authentic catering, cultural performances, professional photography, and digital marketing spanning ${days}`,
          `Organize ${currentReligion} wedding ${selectedFunctionsText} celebration for ${guestCount} guests in ${city} with budget ${budget}. Arrange traditional rituals, premium decorations, multi-cuisine catering, live entertainment, and guest services over ${days}`,
          `Create authentic ${currentReligion} ${selectedFunctionsText} for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan ceremonies, luxury arrangements, premium catering, photography, and social media promotion across ${days}`
        ];
      } else if (currentReligion) {
        // Religion-specific examples without selected functions
        const religionExamples = {
          Hindu: [
            `Plan a traditional Hindu wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include haldi, mehendi, sangeet, phera ceremony, and reception with authentic decorations and catering`,
            `Organize a Hindu wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include traditional ceremonies, premium decorations, cultural performances, and digital marketing`,
            `Create a grand Hindu wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan sacred rituals, luxury arrangements, and professional photography`
          ],
          Muslim: [
            `Plan a Muslim wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include mangni, mehendi, nikah ceremony, and walima reception with traditional arrangements`,
            `Organize a Muslim wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include Islamic ceremonies, premium decorations, and authentic catering`,
            `Create an elegant Muslim wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan nikah, walima, and traditional celebrations`
          ],
          Christian: [
            `Plan a Christian wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include church ceremony, reception party, and traditional celebrations`,
            `Organize a Christian wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include sacred ceremony, reception dinner, and entertainment`,
            `Create an elegant Christian wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan church service, reception, and celebrations`
          ],
          Sikh: [
            `Plan a Sikh wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include anand karaj ceremony, langar, and reception with traditional arrangements`,
            `Organize a Sikh wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include gurudwara ceremony, community meal, and festivities`,
            `Create a traditional Sikh wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan anand karaj, langar, and reception celebrations`
          ]
        };
        return religionExamples[currentReligion] || religionExamples.Hindu;
      } else {
        // General wedding examples
        return [
          `Plan a traditional wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include ceremony and reception with decorations, catering, and entertainment`,
          `Organize a wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include ceremonies, premium arrangements, and guest services`,
          `Create a grand wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan ceremonies, catering, photography, and celebrations`
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

  const getWeddingFunctionsByReligion = (selectedReligion) => {
    const weddingFunctionsByReligion = {
      Hindu: [
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
      ],
      Muslim: [
        { value: 'Istikhara', label: 'Istikhara', description: 'Prayer for guidance before marriage' },
        { value: 'Mangni', label: 'Mangni (Engagement)', description: 'Formal engagement ceremony' },
        { value: 'Manjha', label: 'Manjha Ceremony', description: 'Pre-wedding turmeric ceremony' },
        { value: 'Mehendi', label: 'Mehendi Ceremony', description: 'Henna application with celebration' },
        { value: 'Sangeet', label: 'Sangeet Night', description: 'Musical evening with dance and entertainment' },
        { value: 'Nikah', label: 'Nikah Ceremony', description: 'Islamic marriage contract ceremony' },
        { value: 'Qubool Hai', label: 'Qubool Hai Ritual', description: 'Acceptance of marriage proposal' },
        { value: 'Khutbah', label: 'Khutbah', description: 'Religious sermon during wedding' },
        { value: 'Walima', label: 'Walima Reception', description: 'Post-wedding feast hosted by groom\'s family' },
        { value: 'Rukhsati', label: 'Rukhsati (Bride Farewell)', description: 'Emotional farewell ceremony for the bride' },
        { value: 'Ghar Wapsi', label: 'Ghar Wapsi / Chauthi', description: 'Bride\'s first visit back to parental home' }
      ],
      Christian: [
        { value: 'Bridal Shower', label: 'Bridal Shower', description: 'Pre-wedding celebration for the bride' },
        { value: 'Engagement', label: 'Engagement Ceremony', description: 'Ring exchange with family and friends' },
        { value: 'Bachelor Party', label: 'Bachelor / Bachelorette Party', description: 'Pre-wedding celebration with friends' },
        { value: 'Church Wedding', label: 'Church Wedding Ceremony', description: 'Sacred ceremony in church' },
        { value: 'Holy Mass', label: 'Holy Mass & Vows', description: 'Religious service with wedding vows' },
        { value: 'Ring Exchange', label: 'Ring Exchange', description: 'Exchange of wedding rings' },
        { value: 'Reception', label: 'Reception Party', description: 'Celebration dinner with dancing' },
        { value: 'First Dance', label: 'First Dance', description: 'Couple\'s first dance as married' },
        { value: 'Cake Cutting', label: 'Cake Cutting', description: 'Traditional wedding cake ceremony' },
        { value: 'Toast', label: 'Toast & Speeches', description: 'Wedding toasts and speeches' },
        { value: 'Bouquet Toss', label: 'Bouquet Toss', description: 'Bride throws bouquet to single ladies' },
        { value: 'Send-off', label: 'Send-off Ceremony', description: 'Farewell ceremony for the couple' }
      ],
      Sikh: [
        { value: 'Roka', label: 'Roka Ceremony', description: 'Formal announcement of engagement' },
        { value: 'Kurmai', label: 'Kurmai (Engagement)', description: 'Official engagement ceremony' },
        { value: 'Chooda', label: 'Chooda Ceremony', description: 'Traditional red and white bangles ceremony' },
        { value: 'Haldi', label: 'Haldi Ceremony', description: 'Turmeric application ritual' },
        { value: 'Mehandi', label: 'Mehandi Ceremony', description: 'Henna application with celebration' },
        { value: 'Sangeet', label: 'Sangeet Night', description: 'Musical evening with dance performances' },
        { value: 'Anand Karaj', label: 'Anand Karaj', description: 'Sikh wedding ceremony in Gurudwara' },
        { value: 'Laavan Phere', label: 'Laavan Phere', description: 'Four sacred rounds around Guru Granth Sahib' },
        { value: 'Langar', label: 'Langar', description: 'Community meal served to all guests' },
        { value: 'Doli', label: 'Doli Ceremony', description: 'Bride\'s departure from parental home' },
        { value: 'Reception', label: 'Reception Party', description: 'Grand celebration with family and friends' },
        { value: 'Griha Pravesh', label: 'Griha Pravesh (Post-wedding welcome)', description: 'Welcome ceremony at groom\'s home' }
      ]
    };
    return weddingFunctionsByReligion[selectedReligion] || [];
  };

  const examplePrompts = getExamplePrompts();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Icon name="Sparkles" size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {eventType === 'Wedding' && currentReligion ? `AI ${currentReligion} Wedding Planner` : 'AI Event Planner'}
          </h3>
          <p className="text-sm text-gray-600">
            {eventType === 'Wedding' && currentReligion 
              ? `Describe your ${currentReligion} wedding vision and let AI create your perfect event plan` 
              : 'Describe your vision and let AI create your perfect event plan'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Type
          </label>
          {eventType && currentReligion ? (
            <div className="w-full px-3 py-2 border rounded-md bg-gray-50 text-foreground border-border">
              <span className="font-medium">{currentReligion} {eventType}</span>
              <span className="text-sm text-gray-500 ml-2">(from saved preferences)</span>
            </div>
          ) : (
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
          )}
          {errors?.eventType && (
            <p className="mt-1 text-sm text-error">{errors?.eventType}</p>
          )}
        </div>

        {/* Wedding Functions Section */}
        {currentReligion && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {currentReligion} Wedding Functions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getWeddingFunctionsByReligion(currentReligion).map((func) => (
                <label key={func.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{func.label}</span>
                </label>
              ))}
            </div>
            {selectedFunctions?.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Selected Functions Preview:</p>
                <div className="space-y-1">
                  {selectedFunctions.map(funcValue => {
                    const func = getWeddingFunctionsByReligion(currentReligion).find(f => f.value === funcValue);
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