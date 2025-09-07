// Enhanced sanitization utility
export const sanitizeInput = (input: string, maxLength: number = 10000): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};
