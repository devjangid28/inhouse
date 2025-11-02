import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { geminiService } from '../../../services/geminiService';
import { supabase } from '../../../lib/supabaseClient';

const SocialMediaTab = ({ sharedDescription = '' }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [eventDescription, setEventDescription] = useState(sharedDescription ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState({});

  const syncedDescription = sharedDescription ?? '';

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' }
  ];

  const mockCaptions = {
    facebook: {
      caption: `🎉 Join us for the Annual Tech Conference 2025! 🚀\n\nWe're excited to announce our biggest tech event of the year, happening on March 15th at the Grand Convention Center!\n\n✨ What to expect:\n• Inspiring keynote speakers\n• Interactive workshops\n• Amazing networking opportunities\n• Latest tech innovations\n\nDon't miss out on this incredible opportunity to connect with industry leaders and discover the future of technology!\n\n📅 March 15th, 2025\n📍 Grand Convention Center\n⏰ 9:00 AM - 6:00 PM\n\nRegister now! Link in bio 👆\n\n#TechConference2025 #Innovation #Technology #Networking #TechEvent #Conference #SmartEventPlanner`,
      characterCount: 487,
      hashtags: ['#TechConference2025', '#Innovation', '#Technology', '#Networking', '#TechEvent', '#Conference', '#SmartEventPlanner']
    },
    instagram: {
      caption: `✨ TECH CONFERENCE 2025 ✨\n\nReady to level up your tech game? Join us for an unforgettable day of innovation! 🚀\n\n📸 Swipe to see what's waiting for you:\n• Mind-blowing keynotes\n• Hands-on workshops\n• Epic networking\n• Future tech demos\n\n📅 March 15th\n📍 Grand Convention Center\n⏰ 9AM-6PM\n\nTag a friend who needs to be there! 👥\nLink in bio for tickets 🎫\n\n#TechConf2025 #Innovation #TechLife #Networking #Conference #TechCommunity #FutureIsNow #SmartEvents`,
      characterCount: 398,
      hashtags: ['#TechConf2025', '#Innovation', '#TechLife', '#Networking', '#Conference', '#TechCommunity', '#FutureIsNow', '#SmartEvents']
    },
    twitter: {
      caption: `🚀 TECH CONFERENCE 2025 is here!\n\nJoin industry leaders on March 15th for:\n✅ Keynote speakers\n✅ Interactive workshops  \n✅ Networking sessions\n✅ Tech innovations\n\n📍 Grand Convention Center\n⏰ 9AM-6PM\n\nRegister now! 🎫\n\n#TechConf2025 #Innovation #Tech #Networking`,
      characterCount: 234,
      hashtags: ['#TechConf2025', '#Innovation', '#Tech', '#Networking']
    },
    linkedin: {
      caption: `Excited to announce the Annual Tech Conference 2025! 🎯\n\nAs professionals in the technology sector, we understand the importance of staying ahead of industry trends and building meaningful connections.\n\nJoin us on March 15th, 2025, at the Grand Convention Center for:\n\n🔹 Keynote presentations from industry thought leaders\n🔹 Interactive workshops on emerging technologies\n🔹 Strategic networking opportunities\n🔹 Exhibitions of cutting-edge innovations\n\nThis conference is designed for:\n• Technology professionals\n• Startup founders\n• Product managers\n• Software developers\n• Digital transformation leaders\n\nInvestment in professional development is investment in your career growth.\n\nRegister today and secure your spot at this premier technology event.\n\n#TechConference2025 #ProfessionalDevelopment #Technology #Innovation #Networking #CareerGrowth #TechLeadership`,
      characterCount: 756,
      hashtags: ['#TechConference2025', '#ProfessionalDevelopment', '#Technology', '#Innovation', '#Networking', '#CareerGrowth', '#TechLeadership']
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter';
      case 'linkedin': return 'Linkedin';
      default: return 'Share2';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook': return 'text-blue-600';
      case 'instagram': return 'text-pink-600';
      case 'twitter': return 'text-blue-400';
      case 'linkedin': return 'text-blue-700';
      default: return 'text-primary';
    }
  };

  const getCharacterLimit = (platform) => {
    switch (platform) {
      case 'twitter': return 280;
      case 'instagram': return 2200;
      case 'facebook': return 63206;
      case 'linkedin': return 3000;
      default: return 280;
    }
  };

  const handleGenerate = async () => {
    if (!eventDescription.trim()) {
      alert('Please enter an event description');
      return;
    }

    setIsGenerating(true);

    try {
      const captionData = await geminiService.generateSocialMediaCaption(
        syncedDescription,
        'Event',
        selectedPlatform
      );

      await supabase
        .from('ai_generated_content')
        .insert({
          content_type: 'social_media_caption',
          platform: selectedPlatform,
          prompt: syncedDescription,
          generated_content: captionData,
          metadata: { platform: selectedPlatform }
        });

      setGeneratedCaptions({
        ...generatedCaptions,
        [selectedPlatform]: captionData
      });
    } catch (error) {
      console.error('Error generating caption:', error);
      alert('Failed to generate social media caption. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = (platform) => {
    const content = generatedCaptions?.[platform];
    if (content) {
      navigator.clipboard?.writeText(content?.caption);
      alert('Caption copied to clipboard!');
    }
  };

  const currentCaption = generatedCaptions?.[selectedPlatform];
  const characterLimit = getCharacterLimit(selectedPlatform);

  useEffect(() => {
    setEventDescription(syncedDescription);
  }, [syncedDescription]);

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Share2" size={20} className="mr-2 text-primary" />
          Social Media Caption Generator
        </h3>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Description
            </label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Describe your event in detail... Include event name, key highlights, date, venue, and any special features."
              rows={5}
              className="w-full px-4 py-3 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[120px] border-border"
              style={{ lineHeight: '1.6' }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {eventDescription.length}/2000 characters
            </p>
          </div>

          <div className="flex-1">
            <Select
              label="Select Platform"
              options={platformOptions}
              value={selectedPlatform}
              onChange={setSelectedPlatform}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          iconName="Sparkles"
          iconPosition="left"
          disabled={!eventDescription.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate Caption'}
        </Button>
      </div>
      {/* Generated Caption */}
      {currentCaption && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Icon 
                name={getPlatformIcon(selectedPlatform)} 
                size={20} 
                className={getPlatformColor(selectedPlatform)} 
              />
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {selectedPlatform} Caption
              </h3>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyCaption(selectedPlatform)}
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

          {/* Caption Preview */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
              {currentCaption?.caption}
            </div>
          </div>

          {/* Character Count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Characters: <span className={`font-medium ${currentCaption?.characterCount > characterLimit ? 'text-error' : 'text-success'}`}>
                  {currentCaption?.characterCount}
                </span>/{characterLimit}
              </div>
              {currentCaption?.characterCount > characterLimit && (
                <div className="flex items-center space-x-1 text-error text-xs">
                  <Icon name="AlertTriangle" size={12} />
                  <span>Exceeds limit</span>
                </div>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Suggested Hashtags:</h4>
            <div className="flex flex-wrap gap-2">
              {currentCaption?.hashtags?.map((hashtag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => navigator.clipboard?.writeText(hashtag)}
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Platform Guidelines */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Platform Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Facebook" size={16} className="text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
              <span className="text-xs text-muted-foreground">Up to 63,206 chars</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Instagram" size={16} className="text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
              <span className="text-xs text-muted-foreground">Up to 2,200 chars</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Twitter" size={16} className="text-blue-400" />
              <span className="text-sm font-medium">Twitter/X</span>
              <span className="text-xs text-muted-foreground">Up to 280 chars</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Linkedin" size={16} className="text-blue-700" />
              <span className="text-sm font-medium">LinkedIn</span>
              <span className="text-xs text-muted-foreground">Up to 3,000 chars</span>
            </div>
          </div>
        </div>
      </div>
      {/* Empty State */}
      {!currentCaption && !isGenerating && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Share2" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Caption Generated Yet</h3>
          <p className="text-muted-foreground mb-4">
            Select your platform and click generate to create engaging social media content.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;