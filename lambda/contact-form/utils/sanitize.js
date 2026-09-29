function stripHtmlTags(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
}

function sanitizeInput(input) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  return {
    name: stripHtmlTags(input.name || '').trim(),
    email: stripHtmlTags(input.email || '').trim().toLowerCase(),
    message: stripHtmlTags(input.message || '').trim(),
    captchaToken: stripHtmlTags(input.captchaToken || '').trim()
  };
}

module.exports = {
  stripHtmlTags,
  sanitizeInput
};
