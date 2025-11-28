// SendGrid configuration
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
const EMAIL_SENDER = import.meta.env.VITE_EMAIL_SENDER;

export class EmailService {
  static async sendEventInvitation(recipientEmail, eventData, tone = 'formal') {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured - email service unavailable');
        return {
          success: false,
          error: 'Email service not configured',
          message: 'SendGrid API key not found in environment variables'
        };
      }

      const emailContent = this.generateEmailContent(eventData, tone);

      const msg = {
        to: recipientEmail,
        from: {
          email: EMAIL_SENDER,
          name: 'Smart Event Planner'
        },
        subject: emailContent.subject,
        text: emailContent.textContent,
        html: emailContent.htmlContent,
        trackingSettings: {
          clickTracking: {
            enable: true
          },
          openTracking: {
            enable: true
          }
        }
      };

      // Simulate email sending since SendGrid is not installed
      console.log('Email preview:', {
        to: recipientEmail,
        subject: emailContent.subject,
        preview: emailContent.textContent.substring(0, 100) + '...'
      });

      return {
        success: true,
        messageId: 'preview-' + Date.now(),
        message: 'Email generated successfully (SendGrid integration required for sending)'
      };
    } catch (error) {
      console.error('Email generation failed:', error);

      return {
        success: false,
        error: error.message || 'Failed to generate email',
        details: null
      };
    }
  }

  static generateEmailContent(eventData, tone) {
    const { eventType, prompt, timestamp } = eventData;
    
    // Extract event details from prompt or use defaults
    const eventDetails = this.extractEventDetails(prompt, eventType);
    
    // Clean description to remove placeholder HTML content
    eventDetails.description = this.cleanPlaceholderContent(eventDetails.description);
    
    switch (tone) {
      case 'formal':
        return this.generateFormalEmail(eventDetails, eventType);
      case 'informal':
        return this.generateInformalEmail(eventDetails, eventType);
      case 'friendly':
        return this.generateFriendlyEmail(eventDetails, eventType);
      case 'professional':
        return this.generateProfessionalEmail(eventDetails, eventType);
      default:
        return this.generateFormalEmail(eventDetails, eventType);
    }
  }

  static extractEventDetails(prompt, eventType) {
    // Basic extraction logic - in a real app, you might use NLP
    const details = {
      eventName: eventType || 'Special Event',
      date: 'TBD',
      time: 'TBD',
      venue: 'TBD',
      description: prompt || 'Join us for an exciting event!'
    };

    // Try to extract date patterns
    const dateMatch = prompt?.match(/(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i);
    if (dateMatch) {
      details.date = dateMatch[1];
    }

    // Try to extract time patterns
    const timeMatch = prompt?.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
    if (timeMatch) {
      details.time = timeMatch[1];
    }

    // Try to extract venue/location
    const venueMatch = prompt?.match(/(?:at|venue|location|held at)\s+([^,.!?]+)/i);
    if (venueMatch) {
      details.venue = venueMatch[1].trim();
    }

    return details;
  }

  static cleanPlaceholderContent(description) {
    if (!description) return description;
    
    return description
      .replace(/<h3>Event: \[Your Company Name\][^<]*<\/h3>/gi, '')
      .replace(/<p><strong>Date:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/<p><strong>Time:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/<p><strong>Venue:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/<p><strong>Highlights Include:<\/strong><\/p>[\s\S]*?<\/ul>/gi, '')
      .replace(/<p><strong>Registration:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/<p><strong>Dress Code:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/<p><strong>RSVP:<\/strong>[^<]*<\/p>/gi, '')
      .replace(/RSVP:\s*Kindly respond by \[RSVP Date\][^\n]*/gi, '')
      .replace(/&lt;h3&gt;Event: \[Your Company Name\][^&]*&lt;\/h3&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Date:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Time:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Venue:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Highlights Include:&lt;\/strong&gt;&lt;\/p&gt;[\s\S]*?&lt;\/ul&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Registration:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;Dress Code:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;p&gt;&lt;strong&gt;RSVP:&lt;\/strong&gt;[^&]*&lt;\/p&gt;/gi, '')
      .replace(/&lt;[^&]*&gt;/g, '')
      .trim();
  }

  static generateFormalEmail(details, eventType) {
    const subject = `Invitation to ${details.eventName}`;
    
    const textContent = `Dear Valued Guest,

We cordially invite you to attend our ${details.eventName}.

Event Details:
Date: ${details.date}
Time: ${details.time}
Venue: ${details.venue}

${details.description}

Please confirm your attendance at your earliest convenience.

We look forward to your presence at this distinguished event.

Sincerely,
The Event Planning Committee
Smart Event Planner

---
This is an automated message from Smart Event Planner.`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
        .event-details { background: #f8f9fa; padding: 20px; border-left: 4px solid #2563EB; margin: 20px 0; }
        .footer { border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
        .cta-button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: #2563EB; margin: 0;">Smart Event Planner</h1>
    </div>
    
    <p>Dear Valued Guest,</p>
    
    <p>We cordially invite you to attend our <strong>${details.eventName}</strong>.</p>
    
    <div class="event-details">
        <h3 style="margin-top: 0; color: #2563EB;">Event Details</h3>
        <p><strong>Date:</strong> ${details.date}</p>
        <p><strong>Time:</strong> ${details.time}</p>
        <p><strong>Venue:</strong> ${details.venue}</p>
    </div>
    
    <p>${details.description}</p>
    
    <p>Please confirm your attendance at your earliest convenience.</p>
    
    <a href="#" class="cta-button">Confirm Attendance</a>
    
    <p>We look forward to your presence at this distinguished event.</p>
    
    <p>Sincerely,<br>
    The Event Planning Committee<br>
    Smart Event Planner</p>
    
    <div class="footer">
        <p>This is an automated message from Smart Event Planner.</p>
    </div>
</body>
</html>`;

    return { subject, textContent, htmlContent };
  }

  static generateInformalEmail(details, eventType) {
    const subject = `You're Invited! 🎉 ${details.eventName}`;
    
    const textContent = `Hey there!

Guess what? You're invited to our awesome ${details.eventName}! 🚀

Here's what's happening:
📅 Date: ${details.date}
⏰ Time: ${details.time}
📍 Where: ${details.venue}

${details.description}

Just hit reply and let us know you're coming!

Can't wait to see you there!

Cheers,
The Event Team 🎊
Smart Event Planner

---
This is an automated message from Smart Event Planner.`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .event-details { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .emoji { font-size: 1.2em; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #667eea; margin: 0;">🎉 You're Invited! 🎉</h1>
        </div>
        
        <p>Hey there!</p>
        
        <p>Guess what? You're invited to our awesome <strong>${details.eventName}</strong>! 🚀</p>
        
        <div class="event-details">
            <h3 style="margin-top: 0; color: #667eea;">Here's what's happening:</h3>
            <p><span class="emoji">📅</span> <strong>Date:</strong> ${details.date}</p>
            <p><span class="emoji">⏰</span> <strong>Time:</strong> ${details.time}</p>
            <p><span class="emoji">📍</span> <strong>Where:</strong> ${details.venue}</p>
        </div>
        
        <p>${details.description}</p>
        
        <p>Just hit reply and let us know you're coming!</p>
        
        <div style="text-align: center;">
            <a href="#" class="cta-button">Count Me In! 🙋‍♀️</a>
        </div>
        
        <p>Can't wait to see you there!</p>
        
        <p>Cheers,<br>
        The Event Team 🎊<br>
        Smart Event Planner</p>
        
        <div class="footer">
            <p>This is an automated message from Smart Event Planner.</p>
        </div>
    </div>
</body>
</html>`;

    return { subject, textContent, htmlContent };
  }

  static generateFriendlyEmail(details, eventType) {
    const subject = `Join us for ${details.eventName}! 😊`;
    
    const textContent = `Hi there!

We'd love to have you join us for our ${details.eventName}!

Event Details:
Date: ${details.date}
Time: ${details.time}
Location: ${details.venue}

${details.description}

It's going to be a wonderful time, and we really hope you can make it!

Please let us know if you can attend - we're excited to celebrate with you!

Warm regards,
The Event Team
Smart Event Planner

---
This is an automated message from Smart Event Planner.`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Trebuchet MS', sans-serif; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #fff; border: 2px solid #ff6b6b; border-radius: 15px; padding: 30px; }
        .header { text-align: center; margin-bottom: 25px; }
        .event-details { background: #fff5f5; padding: 20px; border-radius: 10px; border: 1px solid #ffcccb; margin: 20px 0; }
        .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 25px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #ff6b6b; margin: 0;">😊 You're Invited! 😊</h1>
        </div>
        
        <p>Hi there!</p>
        
        <p>We'd love to have you join us for our <strong>${details.eventName}</strong>!</p>
        
        <div class="event-details">
            <h3 style="margin-top: 0; color: #ff6b6b;">Event Details</h3>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>Location:</strong> ${details.venue}</p>
        </div>
        
        <p>${details.description}</p>
        
        <p>It's going to be a wonderful time, and we really hope you can make it!</p>
        
        <div style="text-align: center;">
            <a href="#" class="cta-button">I'll be there! 🎉</a>
        </div>
        
        <p>Please let us know if you can attend - we're excited to celebrate with you!</p>
        
        <p>Warm regards,<br>
        The Event Team<br>
        Smart Event Planner</p>
        
        <div class="footer">
            <p>This is an automated message from Smart Event Planner.</p>
        </div>
    </div>
</body>
</html>`;

    return { subject, textContent, htmlContent };
  }

  static generateProfessionalEmail(details, eventType) {
    const subject = `Professional Invitation: ${details.eventName}`;
    
    const textContent = `Dear Professional,

You are cordially invited to participate in our ${details.eventName}.

Event Information:
Date: ${details.date}
Time: ${details.time}
Venue: ${details.venue}

${details.description}

This event presents an excellent opportunity for professional development and networking.

Please confirm your attendance by replying to this email.

Best regards,
Event Coordination Team
Smart Event Planner

---
This is an automated message from Smart Event Planner.`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Calibri', sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #ffffff; border: 1px solid #bdc3c7; padding: 30px; }
        .header { border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; }
        .event-details { background: #ecf0f1; padding: 20px; margin: 20px 0; border-left: 4px solid #3498db; }
        .cta-button { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 3px; margin: 20px 0; }
        .footer { border-top: 1px solid #bdc3c7; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #3498db; margin: 0;">Smart Event Planner</h1>
            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Professional Event Management</p>
        </div>
        
        <p>Dear Professional,</p>
        
        <p>You are cordially invited to participate in our <strong>${details.eventName}</strong>.</p>
        
        <div class="event-details">
            <h3 style="margin-top: 0; color: #2c3e50;">Event Information</h3>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>Venue:</strong> ${details.venue}</p>
        </div>
        
        <p>${details.description}</p>
        
        <p>This event presents an excellent opportunity for professional development and networking.</p>
        
        <div style="text-align: center;">
            <a href="#" class="cta-button">Confirm Attendance</a>
        </div>
        
        <p>Please confirm your attendance by replying to this email.</p>
        
        <p>Best regards,<br>
        Event Coordination Team<br>
        Smart Event Planner</p>
        
        <div class="footer">
            <p>This is an automated message from Smart Event Planner.</p>
        </div>
    </div>
</body>
</html>`;

    return { subject, textContent, htmlContent };
  }
}

export default EmailService;