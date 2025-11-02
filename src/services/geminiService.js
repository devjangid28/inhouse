import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

class GeminiService {
  async generateEventPlan(eventDescription, eventType, preferences = {}) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `You are an expert event planner. Based on the following event details, create a comprehensive event plan. IMPORTANT: Respond ONLY in English language. Do NOT use Hindi, mixed languages, or any non-English content.

Event Type: ${eventType}
Description: ${eventDescription}
${preferences.audienceSize ? `Audience Size: ${preferences.audienceSize}` : ''}
${preferences.budget ? `Budget: ${preferences.budget}` : ''}
${preferences.duration ? `Duration: ${preferences.duration}` : ''}
${preferences.venueType ? `Venue Type: ${preferences.venueType}` : ''}

Generate a detailed event plan in JSON format with the following structure:
{
  "timeline": [
    {"time": "9:00 AM", "activity": "Activity name in English only", "duration": "30 mins"},
    ...
  ],
  "tasks": [
    {"task": "Task description in English only", "priority": "high/medium/low", "deadline": "relative time"},
    ...
  ],
  "budget": {
    "venue": amount,
    "catering": amount,
    "marketing": amount,
    "staffing": amount,
    "equipment": amount,
    "contingency": amount
  },
  "recommendations": [
    "Recommendation 1 in English only",
    "Recommendation 2 in English only",
    ...
  ]
}

CRITICAL: All text fields must be in English language only. No Hindi or mixed language content allowed.
Provide ONLY the JSON response, no additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini event plan generation error:', error);
      throw new Error('Failed to generate event plan. Please try again.');
    }
  }

  async generatePosterContent(eventDescription, eventType, style = 'modern') {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `You are a creative designer. Based on the following event details, create poster content suggestions. IMPORTANT: Respond ONLY in English language. Do NOT use Hindi, mixed languages, or any non-English content.

Event Type: ${eventType}
Description: ${eventDescription}
Design Style: ${style}

Generate poster content suggestions in JSON format:
{
  "headline": "Eye-catching headline in English only",
  "subheadline": "Supporting text in English only",
  "keyPoints": ["Point 1 in English", "Point 2 in English", "Point 3 in English"],
  "callToAction": "Action text in English only",
  "colorScheme": ["#color1", "#color2", "#color3"],
  "designNotes": "Brief design suggestions in English only"
}

CRITICAL: All text content must be in English language only. No Hindi or mixed language content allowed.
Provide ONLY the JSON response, no additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini poster generation error:', error);
      throw new Error('Failed to generate poster content. Please try again.');
    }
  }

  async generateEmailInvitation(eventDescription, eventType, tone = 'formal') {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `You are a professional email writer. Create an event invitation email based on these details. IMPORTANT: Respond ONLY in English language. Do NOT use Hindi, mixed languages, or any non-English content.

Event Type: ${eventType}
Description: ${eventDescription}
Tone: ${tone}

Generate an email invitation in JSON format:
{
  "subject": "Email subject line in English only",
  "greeting": "Email greeting in English only",
  "body": "Main email body with multiple paragraphs in English only",
  "eventDetails": "Formatted event details section in English only",
  "closing": "Email closing in English only",
  "signature": "Email signature in English only"
}

Make the email engaging and appropriate for the ${tone} tone. CRITICAL: All content must be in English language only. No Hindi, Hindi-English mix, or any non-English content allowed.
Provide ONLY the JSON response, no additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini email generation error:', error);
      throw new Error('Failed to generate email invitation. Please try again.');
    }
  }

  async generateSocialMediaCaption(eventDescription, eventType, platform = 'instagram') {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const characterLimits = {
        instagram: 2200,
        facebook: 63206,
        twitter: 280,
        linkedin: 3000
      };

      const limit = characterLimits[platform] || 2200;

      const prompt = `You are a social media expert. Create an engaging ${platform} caption for this event. IMPORTANT: Respond ONLY in English language. Do NOT use Hindi, mixed languages, or any non-English content.

Event Type: ${eventType}
Description: ${eventDescription}
Platform: ${platform}
Character Limit: ${limit}

Generate a social media caption in JSON format:
{
  "caption": "The complete caption text with emojis and line breaks in English only",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "characterCount": actual_character_count,
  "callToAction": "Specific call to action in English only"
}

Make it engaging, platform-appropriate, and include relevant emojis. CRITICAL: All text content must be in English language only. No Hindi or mixed language content allowed.
Provide ONLY the JSON response, no additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini caption generation error:', error);
      throw new Error('Failed to generate social media caption. Please try again.');
    }
  }

  async generateMarketingContent(eventDescription, eventType) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `You are a marketing expert. Create comprehensive marketing content for this event. IMPORTANT: Respond ONLY in English language. Do NOT use Hindi, mixed languages, or any non-English content.

Event Type: ${eventType}
Description: ${eventDescription}

Generate marketing materials in JSON format:
{
  "tagline": "Memorable event tagline in English only",
  "elevator_pitch": "30-second description in English only",
  "key_benefits": ["Benefit 1 in English", "Benefit 2 in English", "Benefit 3 in English"],
  "target_audience": "Description of ideal attendees in English only",
  "unique_selling_points": ["USP 1 in English", "USP 2 in English", "USP 3 in English"],
  "social_media_strategy": "Brief strategy overview in English only"
}

CRITICAL: All content must be in English language only. No Hindi or mixed language content allowed.
Provide ONLY the JSON response, no additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini marketing content generation error:', error);
      throw new Error('Failed to generate marketing content. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();
