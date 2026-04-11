// Validation utilities for auth flows
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { 
  valid: boolean;
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} => {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      error: 'Password must be at least 8 characters',
      strength: 'weak'
    };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const strengthScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 3) strength = 'strong';
  else if (strengthScore >= 2) strength = 'medium';
  
  return { 
    valid: true,
    strength
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { 
  valid: boolean;
  error?: string;
} => {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
};

export const getPasswordStrengthLabel = (strength?: 'weak' | 'medium' | 'strong'): { 
  label: string; 
  color: string;
} => {
  switch (strength) {
    case 'strong':
      return { label: 'Strong', color: '#16a34a' };
    case 'medium':
      return { label: 'Medium', color: '#ea7a53' };
    case 'weak':
    default:
      return { label: 'Weak', color: '#dc2626' };
  }
};

export const getUserFriendlyError = (error: any): string => {
  // Handle Clerk API errors with multiple error objects
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    // Check each error for specific codes/messages
    for (const err of error.errors) {
      const message = err.message || '';
      const code = err.code || '';
      
      // Check for various "user exists" error patterns
      if (
        code.includes('form_identifier_exists') ||
        code.includes('user_exists') ||
        message.toLowerCase().includes('already in use') ||
        message.toLowerCase().includes('already exists') ||
        message.toLowerCase().includes('account already exists')
      ) {
        return 'An account with this email already exists';
      }
      
      if (
        code.includes('form_password_pwned') ||
        message.includes('password has been compromised')
      ) {
        return 'This password has been compromised. Please choose a different one';
      }
      
      if (
        code.includes('form_param_invalid') ||
        code.includes('identification_invalid') ||
        message.includes('invalid email')
      ) {
        return 'Invalid email address';
      }
      
      if (
        code.includes('invalid_password') ||
        message.includes('invalid password')
      ) {
        return 'Invalid email or password';
      }
      
      // If message is present and not generic, return it
      if (message && !message.includes('Client error')) {
        return message;
      }
    }
  }
  
  // Fallback for direct error message
  if (error?.message) {
    const msg = error.message;
    if (
      msg.toLowerCase().includes('already exists') ||
      msg.toLowerCase().includes('already in use')
    ) {
      return 'An account with this email already exists';
    }
    return msg;
  }
  
  // Last resort
  return 'Something went wrong. Please try again.';
};
