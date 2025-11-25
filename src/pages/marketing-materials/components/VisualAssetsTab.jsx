import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import { geminiService } from '../../../services/geminiService';
import { supabase } from '../../../lib/supabaseClient';
import { imageService } from '../../../services/imageService';

const VisualAssetsTab = ({ sharedDescription = '' }) => {
  const [selectedAssetType, setSelectedAssetType] = useState('poster');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [customText, setCustomText] = useState(sharedDescription || 'Annual Tech Conference 2025');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [eventType, setEventType] = useState('');

  React.useEffect(() => {
    if (sharedDescription) {
      setCustomText(sharedDescription);
    }
  }, [sharedDescription]);

  React.useEffect(() => {
    const savedPrefs = localStorage.getItem('event_preferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      if (prefs.eventType) {
        setEventType(prefs.eventType);
      }
    }
  }, []);

  const assetTypeOptions = [
    { value: 'poster', label: 'Event Poster' },
    { value: 'banner', label: 'Web Banner' },
    { value: 'social', label: 'Social Media Post' },
    { value: 'flyer', label: 'Digital Flyer' }
  ];

  const styleOptions = [
    { value: 'modern', label: 'Modern & Clean' },
    { value: 'creative', label: 'Creative & Artistic' },
    { value: 'professional', label: 'Professional & Corporate' },
    { value: 'vibrant', label: 'Vibrant & Colorful' }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue Theme' },
    { value: 'purple', label: 'Purple Theme' },
    { value: 'green', label: 'Green Theme' },
    { value: 'orange', label: 'Orange Theme' },
    { value: 'red', label: 'Red Theme' }
  ];

  const mockAssets = [
    {
      id: 1,
      type: 'poster',
      title: 'Tech Conference Poster - Modern Blue',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop',
      downloadUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=1800&fit=crop',
      dimensions: '1200x1800px',
      format: 'PNG',
      size: '2.4 MB'
    },
    {
      id: 2,
      type: 'banner',
      title: 'Web Banner - Modern Blue',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop',
      downloadUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
      dimensions: '1200x600px',
      format: 'PNG',
      size: '1.8 MB'
    },
    {
      id: 3,
      type: 'social',
      title: 'Instagram Post - Modern Blue',
      thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop',
      downloadUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1080&h=1080&fit=crop',
      dimensions: '1080x1080px',
      format: 'PNG',
      size: '1.2 MB'
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const assetTypeLabel = assetTypeOptions.find(opt => opt.value === selectedAssetType)?.label || 'Visual Asset';
      const styleLabel = styleOptions.find(opt => opt.value === selectedStyle)?.label || '';
      const colorLabel = colorOptions.find(opt => opt.value === selectedColor)?.label || '';

      let enhancedPrompt = customText;

      const coupleNamesMatch = customText.match(/(?:couple|names?|bride|groom)\s*:?\s*([\w\s&]+)/i);
      const extractedNames = coupleNamesMatch ? coupleNamesMatch[1].trim() : '';

      if (!enhancedPrompt.toLowerCase().includes('high detail') &&
          !enhancedPrompt.toLowerCase().includes('8k') &&
          !enhancedPrompt.toLowerCase().includes('resolution')) {
        enhancedPrompt = `${enhancedPrompt}. ${styleLabel}, ${colorLabel}, elegant design`;
      }

      const dimensions = {
        poster: { width: 1200, height: 1800 },
        banner: { width: 1200, height: 600 },
        social: { width: 1080, height: 1080 },
        flyer: { width: 1200, height: 1600 }
      };

      const dim = dimensions[selectedAssetType] || { width: 1024, height: 1024 };

      const result = await imageService.generateImage(enhancedPrompt, {
        width: dim.width,
        height: dim.height,
        eventType: eventType,
        assetType: assetTypeLabel,
        theme: `${styleLabel}, ${colorLabel}`,
        coupleNames: extractedNames
      });

      if (result.success) {
        const newAsset = {
          id: Date.now(),
          type: selectedAssetType,
          title: `${assetTypeLabel} - ${styleLabel}`,
          thumbnail: result.data.imageUrl,
          downloadUrl: result.data.imageUrl,
          dimensions: `${dim.width}x${dim.height}px`,
          format: 'PNG',
          size: '~2 MB',
          metadata: result.data.metadata
        };

        setGeneratedAssets(prev => [newAsset, ...prev]);

        await supabase
          .from('ai_generated_content')
          .insert({
            content_type: 'visual_asset',
            platform: selectedAssetType,
            prompt: customText,
            generated_content: result.data.imageUrl,
            metadata: {
              style: selectedStyle,
              color: selectedColor,
              eventType: eventType,
              assetType: assetTypeLabel,
              dimensions: `${dim.width}x${dim.height}`
            }
          });
      }
    } catch (error) {
      console.error('Error generating visual asset:', error);
      alert('Failed to generate visual asset. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (asset) => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = asset?.downloadUrl;
    link.download = `${asset?.title?.replace(/\s+/g, '_')}.png`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    
    alert(`Downloading: ${asset?.title}`);
  };

  const handleBulkDownload = () => {
    generatedAssets?.forEach((asset, index) => {
      setTimeout(() => {
        handleDownload(asset);
      }, index * 500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Image" size={20} className="mr-2 text-primary" />
          Visual Asset Generator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Asset Type"
            options={assetTypeOptions}
            value={selectedAssetType}
            onChange={setSelectedAssetType}
          />
          
          <Select
            label="Design Style"
            options={styleOptions}
            value={selectedStyle}
            onChange={setSelectedStyle}
          />
          
          <Select
            label="Color Theme"
            options={colorOptions}
            value={selectedColor}
            onChange={setSelectedColor}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Description / Prompt
          </label>
          <textarea
            placeholder="Describe the visual you want to generate in detail. For Hindu wedding functions, include couple names and specific ceremonies. Example: 'Elegant Hindu wedding invitation for Rahul & Priya featuring Haldi, Mehendi, Sangeet, Phera ceremonies with traditional floral background and gold accents'"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y border-border"
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tip: Be specific about style, colors, mood, and elements. For invitations, mention couple names to include them in the design.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          iconName="Sparkles"
          iconPosition="left"
          className="w-full md:w-auto"
        >
          {isGenerating ? 'Generating Assets...' : 'Generate Visual Assets'}
        </Button>
      </div>
      {/* Generated Assets */}
      {generatedAssets?.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Generated Assets</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                iconName="Download"
                iconPosition="left"
              >
                Download All
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedAssets?.map((asset) => (
              <div key={asset?.id} className="bg-muted rounded-lg p-4 hover:shadow-card transition-shadow">
                {/* Asset Preview */}
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-background">
                  <Image
                    src={asset?.thumbnail}
                    alt={asset?.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Asset Info */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-foreground text-sm">{asset?.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{asset?.dimensions}</span>
                    <span>{asset?.format}</span>
                    <span>{asset?.size}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(asset)}
                    iconName="Download"
                    iconPosition="left"
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(asset?.downloadUrl, '_blank')}
                    iconName="ExternalLink"
                    className="px-3"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Customization Options */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Customization Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Available Formats</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="FileImage" size={16} className="text-primary" />
                <span>PNG (High Quality, Transparent Background)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="FileImage" size={16} className="text-primary" />
                <span>JPG (Optimized for Web)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="FileText" size={16} className="text-primary" />
                <span>PDF (Print Ready)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Resolution Options</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Monitor" size={16} className="text-primary" />
                <span>Web Resolution (72 DPI)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Printer" size={16} className="text-primary" />
                <span>Print Resolution (300 DPI)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Maximize" size={16} className="text-primary" />
                <span>Ultra HD (4K Ready)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Empty State */}
      {generatedAssets?.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Image" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Assets Generated Yet</h3>
          <p className="text-muted-foreground mb-4">
            Configure your preferences and click generate to create stunning visual assets for your event.
          </p>
        </div>
      )}
    </div>
  );
};

export default VisualAssetsTab;