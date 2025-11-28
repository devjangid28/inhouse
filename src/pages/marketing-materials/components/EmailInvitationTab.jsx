import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { EmailService } from '../../../services/emailService';
import { validateEmail } from '../../../utils/validation';
import { geminiService } from '../../../services/geminiService';
import { supabase } from '../../../lib/supabaseClient';

const EmailInvitationTab = ({ sharedDescription = '', onDescriptionChange }) => {
  const [selectedTone, setSelectedTone] = useState('formal');
  const [selectedTemplate, setSelectedTemplate] = useState('corporate');
  const [eventDescription, setEventDescription] = useState(sharedDescription || '');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [emailErrors, setEmailErrors] = useState({});
  const [sendResult, setSendResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editableContent, setEditableContent] = useState(null);

  // Load saved preferences and auto-populate
  React.useEffect(() => {
    const loadPreferences = () => {
      const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
      const storedDescription = localStorage.getItem('shared_event_description');
      
      // Auto-generate description from saved preferences if available
      if (savedPrefs && Object.keys(savedPrefs).length > 0 && !eventDescription) {
        const { event_type, selectedFunctions, number_of_people, city, venue, budget, event_date, event_time } = savedPrefs;
        
        if (event_type === 'Wedding' && selectedFunctions && selectedFunctions.length > 0) {
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
          
          const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Delhi';
          const venueName = venue ? venue.split('-')[0] : 'luxury venue';
          const budgetText = budget ? `₹${(budget / 100000).toFixed(1)} lakh` : '₹5-10 lakh';
          const dateText = event_date ? new Date(event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'November 2025';
          const timeText = event_time ? new Date(`2000-01-01T${event_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '9:00 AM';
          
          const autoDescription = `Plan a Hindu wedding ${functionNames.join(' and ')} for ${number_of_people || 300} guests in ${cityName} on ${dateText} at ${timeText}. Budget ${budgetText}, venue ${venueName}. Include traditional decorations, authentic catering, cultural performances, professional photography, email invitations, and social media campaigns.`;
          
          setEventDescription(autoDescription);
          if (onDescriptionChange) {
            onDescriptionChange(autoDescription);
          }
        }
      } else if (storedDescription && storedDescription !== eventDescription) {
        setEventDescription(storedDescription);
        if (onDescriptionChange) {
          onDescriptionChange(storedDescription);
        }
      }
    };
    
    loadPreferences();
  }, []);

  React.useEffect(() => {
    if (sharedDescription && sharedDescription !== eventDescription) {
      setEventDescription(sharedDescription);
    }
  }, [sharedDescription]);

  const toneOptions = [
    { value: 'formal', label: 'Formal' },
    { value: 'informal', label: 'Informal' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' }
  ];

  const templateOptions = [
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'Birthday Party', label: 'Birthday Party' },
    { value: 'wedding', label: 'Wedding Celebration' },
    { value: 'conference', label: 'Conference/Seminar' },
    { value: 'networking', label: 'Networking Event' }
  ];

  const getExamplesByEventType = (eventType) => {
    // Get current values from saved preferences
    const savedPrefs = JSON.parse(localStorage.getItem('event_preferences_cache') || '{}');
    const religion = savedPrefs.religion || '';
    const guestCount = savedPrefs.numberOfPeople || savedPrefs.number_of_people || 50;
    const city = savedPrefs.city ? savedPrefs.city.charAt(0).toUpperCase() + savedPrefs.city.slice(1) : 'Delhi';
    const budget = savedPrefs.budget ? `₹${(savedPrefs.budget / 100000).toFixed(1)} lakh` : '₹0.7 lakh';
    const venue = savedPrefs.venue ? savedPrefs.venue.split('-')[0].toLowerCase() : 'luxury venue';
    
    const examples = {
      'wedding': religion === 'Muslim' ? [
        `Plan a traditional Muslim wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include mangni ceremony, nikah ceremony, and walima reception with Islamic decorations and halal catering`,
        `Organize a Muslim wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include mangni, mehendi, nikah ceremony, and walima with traditional arrangements and guest services`,
        `Create an authentic Muslim wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan Islamic ceremonies, halal catering, and traditional celebrations`
      ] : religion === 'Christian' ? [
        `Plan a traditional Christian wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include engagement ceremony, church wedding, and reception with decorations and catering`,
        `Organize a Christian wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include bridal shower, church ceremony, and reception with premium arrangements and guest services`,
        `Create an elegant Christian wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan church ceremonies, catering, photography, and celebrations`
      ] : religion === 'Sikh' ? [
        `Plan a traditional Sikh wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include roka ceremony, anand karaj, and reception with gurudwara decorations and langar`,
        `Organize a Sikh wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include roka, mehendi, anand karaj, and reception with traditional arrangements and guest services`,
        `Create an authentic Sikh wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan gurudwara ceremonies, langar, photography, and celebrations`
      ] : [
        `Plan a traditional Hindu wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Include haldi ceremony, mehendi, sangeet, and reception with decorations and catering`,
        `Organize a Hindu wedding celebration for ${guestCount} guests in ${city} with budget ${budget}. Include haldi, mehendi, sangeet, phera ceremony, and reception with premium arrangements and guest services`,
        `Create a grand Hindu wedding for ${guestCount} guests in ${city} with budget ${budget} at ${venue}. Plan traditional ceremonies, catering, photography, and celebrations`
      ],
      'corporate': [
        "Plan a corporate annual conference for 200 professionals featuring keynote speakers, panel discussions, networking sessions, and product demonstrations. Include professional venue setup, catering, audio-visual equipment, and marketing materials.",
        "Organize a product launch event for 150 attendees with live demonstrations, media coverage, networking reception, and brand presentations. Arrange premium venue, catering, photography, and promotional campaigns.",
        "Create a corporate team building event for 100 employees with interactive workshops, outdoor activities, team challenges, and celebration dinner. Plan engaging activities, professional facilitation, and memorable experiences."
      ],
      'Birthday Party': [
        "Plan a milestone birthday celebration for 80 guests with themed decorations, entertainment, catering, and special activities. Include venue setup, birthday cake ceremony, music, photography, and party favors.",
        "Organize a surprise birthday party for 50 guests with decorations, entertainment, catering, and memorable moments. Arrange venue coordination, theme implementation, and celebration activities.",
        "Create a grand birthday celebration for 120 guests with live entertainment, themed decorations, premium catering, and special performances. Plan comprehensive event management and guest experiences."
      ],
      'conference': [
        "Plan an academic conference for 300 participants with research presentations, poster sessions, networking lunch, and keynote speeches. Include conference facilities, audio-visual setup, catering, and material distribution.",
        "Organize a professional seminar for 150 attendees with expert speakers, interactive workshops, networking opportunities, and certification ceremony. Arrange venue setup, technical equipment, and refreshments.",
        "Create an industry conference for 250 professionals with panel discussions, exhibition booths, networking sessions, and awards ceremony. Plan comprehensive event logistics and attendee engagement."
      ],
      'networking': [
        "Plan a business networking event for 100 professionals with structured networking sessions, refreshments, keynote speaker, and business card exchange. Include venue setup, catering, and networking facilitation.",
        "Organize a professional meetup for 75 industry experts with presentations, panel discussions, networking hour, and refreshments. Arrange venue coordination and networking activities.",
        "Create an industry networking mixer for 120 professionals with speed networking, cocktail reception, guest speakers, and business connections. Plan engaging networking format and premium hospitality."
      ]
    };
    return examples[eventType] || examples['corporate'];
  };

  const handleGenerate = async () => {
    if (!eventDescription?.trim()) {
      alert('Please enter an event description');
      return;
    }

    setIsGenerating(true);
    setSendResult(null);
    setShowPreview(false);

    try {
      const emailData = await geminiService.generateEmailInvitation(
        eventDescription,
        selectedTemplate,
        selectedTone
      );

      await supabase
        .from('ai_generated_content')
        .insert({
          content_type: 'email',
          platform: 'email',
          prompt: eventDescription,
          generated_content: emailData,
          metadata: { tone: selectedTone, template: selectedTemplate }
        });

      const fullContent = `${emailData.greeting}\n\n${emailData.body}\n\n${emailData.eventDetails}\n\n${emailData.closing}\n${emailData.signature}`;

      const content = {
        subject: emailData.subject,
        content: fullContent,
        textContent: fullContent
      };

      setGeneratedContent(content);
      setEditableContent(content);
      setShowPreview(true);
    } catch (error) {
      console.error('Email generation failed:', error);
      alert('Failed to generate email content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    const emailValidation = validateEmail(recipientEmail);
    if (!emailValidation.isValid) {
      setEmailErrors({ email: emailValidation.error });
      return;
    }

    setEmailErrors({});
    setIsSending(true);
    setSendResult(null);

    try {
      const eventData = {
        eventType: selectedTemplate,
        prompt: editableContent?.textContent || eventDescription,
        timestamp: new Date()?.toISOString()
      };

      const result = await EmailService.sendEventInvitation(
        emailValidation.sanitizedEmail,
        eventData,
        selectedTone
      );

      setSendResult(result);

      if (result.success) {
        setRecipientEmail('');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      setSendResult({
        success: false,
        error: 'Failed to send email. Please check your connection and try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEmailChange = (e) => {
    setRecipientEmail(e?.target?.value);
    if (emailErrors?.email) {
      setEmailErrors({});
    }
    setSendResult(null);
  };

  const handleCopyContent = () => {
    if (editableContent) {
      navigator.clipboard?.writeText(`Subject: ${editableContent?.subject}\n\n${editableContent?.content}`);
      alert('Email content copied to clipboard!');
    }
  };

  const handleEditContent = (field, value) => {
    setEditableContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Mail" size={20} className="mr-2 text-primary" />
          Email Invitation Generator
        </h3>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Description
            </label>
            <textarea
              value={eventDescription}
              onChange={(e) => {
                setEventDescription(e.target.value);
                onDescriptionChange?.(e.target.value);
              }}
              placeholder="Describe your event in detail... Include event name, date, venue, key highlights, and any special instructions. For Hindu weddings, mention specific ceremonies like Haldi, Mehendi, Sangeet, Phera, Reception, etc. This will auto-populate from your Event Preferences if you've selected Hindu wedding functions."
              rows={6}
              className="w-full px-4 py-3 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[150px] border-border"
              style={{ lineHeight: '1.6' }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {eventDescription.length}/2000 characters
            </p>
          </div>

          {/* Event Examples */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Need inspiration? Try these examples:</p>
            <div className="space-y-2">
              {getExamplesByEventType(selectedTemplate).map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setEventDescription(example);
                    onDescriptionChange?.(example);
                  }}
                  className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-md text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Icon name="Lightbulb" size={14} className="inline mr-2" />
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Email Tone"
              options={toneOptions}
              value={selectedTone}
              onChange={setSelectedTone}
            />

            <Select
              label="Event Template"
              options={templateOptions}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          iconName="Sparkles"
          iconPosition="left"
          className="w-full md:w-auto"
          disabled={!selectedTone || !selectedTemplate || !eventDescription.trim()}
        >
          {isGenerating ? 'Generating Email...' : 'Generate Invitation'}
        </Button>
      </div>
      
      {/* Send Result Display */}
      {sendResult && (
        <div className={`p-4 rounded-lg border ${
          sendResult.success 
            ? 'bg-success/10 border-success/20 text-success' 
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={sendResult.success ? "CheckCircle2" : "AlertCircle"} 
              size={16} 
            />
            <span className="text-sm font-medium">
              {sendResult.success ? 'Email sent successfully!' : 'Failed to send email'}
            </span>
          </div>
          {sendResult.messageId && (
            <p className="text-xs mt-1 opacity-75">
              Message ID: {sendResult.messageId}
            </p>
          )}
          {sendResult.error && (
            <p className="text-xs mt-1">
              {sendResult.error}
            </p>
          )}
        </div>
      )}
      {/* Email Preview and Edit */}
      {showPreview && editableContent && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Icon name="Eye" size={20} className="mr-2 text-primary" />
              Email Preview & Edit
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                iconName="Copy"
                iconPosition="left"
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Editable Email Preview */}
          <div className="bg-muted rounded-lg p-4 mb-4 space-y-4">
            <div className="border-b border-border pb-3">
              <div className="text-sm text-muted-foreground mb-2">Subject:</div>
              <input
                type="text"
                value={editableContent?.subject}
                onChange={(e) => handleEditContent('subject', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Email Content:</div>
              <textarea
                value={editableContent?.content}
                onChange={(e) => handleEditContent('content', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                style={{ lineHeight: '1.6' }}
              />
            </div>
          </div>

          {/* Send Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="email"
                label="Recipient Email"
                placeholder="Enter recipient email address"
                value={recipientEmail}
                onChange={handleEmailChange}
                error={emailErrors?.email}
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSendEmail}
                disabled={!recipientEmail || isSending || !editableContent}
                loading={isSending}
                iconName="Send"
                iconPosition="left"
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Empty State */}
      {!showPreview && !isGenerating && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Mail" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Email Generated Yet</h3>
          <p className="text-muted-foreground mb-4">
            Select your preferred tone and event template, then click generate to create a personalized invitation email.
          </p>
          <div className="text-xs text-muted-foreground">
            <Icon name="Info" size={12} className="inline mr-1" />
            Email content will automatically adapt based on your event type and tone selection.
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInvitationTab;