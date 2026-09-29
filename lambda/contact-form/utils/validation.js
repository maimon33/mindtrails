const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }

  return { valid: true };
}

function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  if (message.length > 5000) {
    return { valid: false, error: 'Message must be less than 5000 characters' };
  }

  return { valid: true };
}

function validateCaptchaToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'CAPTCHA token is required' };
  }

  return { valid: true };
}

function validateInput(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid input' };
  }

  const emailValidation = validateEmail(input.email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  const nameValidation = validateName(input.name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const messageValidation = validateMessage(input.message);
  if (!messageValidation.valid) {
    return messageValidation;
  }

  const tokenValidation = validateCaptchaToken(input.captchaToken);
  if (!tokenValidation.valid) {
    return tokenValidation;
  }

  return { valid: true };
}

module.exports = {
  validateEmail,
  validateName,
  validateMessage,
  validateCaptchaToken,
  validateInput
};
