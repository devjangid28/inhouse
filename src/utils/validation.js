export const validateEventDescription = (description, eventType) => {
  const errors = [];
  
  if (!description || typeof description !== 'string') {
    errors.push('Event description is required');
    return { isValid: false, errors };
  }

  const trimmedDescription = description.trim();
  
  // Basic length validation
  if (trimmedDescription.length < 20) {
    errors.push('Description must be at least 20 characters long');
  }
  
  if (trimmedDescription.length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  // Check for meaningful content
  const words = trimmedDescription.split(/\s+/).filter(word => word.length > 2);
  if (words.length < 5) {
    errors.push('Description must contain at least 5 meaningful words');
  }

  // Event type specific validation
  const requiredKeywords = getRequiredKeywords(eventType);
  const hasRequiredKeywords = requiredKeywords.some(keyword => 
    trimmedDescription.toLowerCase().includes(keyword.toLowerCase())
  );

  if (eventType && !hasRequiredKeywords) {
    errors.push(`For ${eventType} events, please include relevant details like ${requiredKeywords.slice(0, 3).join(', ')}`);
  }

  // Check for inappropriate content
  const inappropriateWords = ['spam', 'scam', 'fake', 'illegal'];
  const hasInappropriateContent = inappropriateWords.some(word => 
    trimmedDescription.toLowerCase().includes(word)
  );

  if (hasInappropriateContent) {
    errors.push('Description contains inappropriate content');
  }

  // Validate HTML/script injection
  if (/<script|<iframe|javascript:|data:/i.test(trimmedDescription)) {
    errors.push('Description contains invalid content');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedDescription: trimmedDescription
  };
};

const getRequiredKeywords = (eventType) => {
  const keywordMap = {
    'Corporate Conference': ['attendees', 'speakers', 'venue', 'agenda', 'networking', 'presentation'],
    'Wedding': ['guests', 'ceremony', 'reception', 'venue', 'catering', 'music'],
    'Birthday Party': ['guests', 'celebration', 'venue', 'entertainment', 'food', 'decorations'],
    'Product Launch': ['audience', 'product', 'demonstration', 'marketing', 'media', 'presentation'],
    'Academic Seminar': ['participants', 'speakers', 'topics', 'venue', 'research', 'discussion'],
    'Networking Event': ['professionals', 'networking', 'venue', 'refreshments', 'connections'],
    'Charity Fundraiser': ['donors', 'cause', 'venue', 'fundraising', 'community', 'support'],
    'Music Concert': ['audience', 'performers', 'venue', 'sound', 'tickets', 'entertainment'],
    'Art Exhibition': ['visitors', 'artwork', 'gallery', 'artists', 'display', 'opening'],
    'Sports Tournament': ['participants', 'competition', 'venue', 'teams', 'prizes', 'schedule']
  };

  return keywordMap[eventType] || ['attendees', 'venue', 'date', 'activities'];
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Additional checks for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'university.com'];
  const domain = email.split('@')[1];

  if (domain && !commonDomains.includes(domain) && domain.length < 4) {
    return { isValid: false, error: 'Please check the email domain' };
  }

  return { isValid: true, sanitizedEmail: email.toLowerCase().trim() };
};

export const sanitizeInput = (input, preserveWhitespace = false) => {
  if (typeof input !== 'string') return input;

  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');

  return preserveWhitespace ? sanitized : sanitized.trim();
};