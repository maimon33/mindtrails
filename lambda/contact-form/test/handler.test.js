require('./setup');
const {
  setupS3Mocks,
  setupSESMocks,
  setupHttpsMocks,
  mockGetObject,
  mockPutObject,
  mockSendEmail
} = require('./setup');
const https = require('https');

// Import handler
const { handler } = require('../index');

describe('Contact Form Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.HCAPTCHA_SECRET_KEY = 'test-secret-key';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.S3_BUCKET_NAME = 'test-bucket';
    process.env.SES_FROM_EMAIL = 'noreply@mindtrails.net';
    setupS3Mocks.returnEmpty();
    setupSESMocks.returnSuccess();
    setupHttpsMocks.returnSuccessResponse({ success: true });
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('Input Validation Tests', () => {
    it('should reject missing name', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Name is required');
    });

    it('should reject invalid email', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid email format');
    });

    it('should reject missing message', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Message is required');
    });

    it('should reject missing CAPTCHA token', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('CAPTCHA token is required');
    });
  });

  describe('CORS Tests', () => {
    it('should return CORS headers', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      mockPutObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const response = await handler(event);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('https://mindtrails.net');
      expect(response.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(response.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    it('should handle CORS preflight (OPTIONS)', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        path: '/contact',
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Access-Control-Allow-Origin']).toBe('https://mindtrails.net');
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('Sanitization', () => {
    it('should strip HTML tags from message', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John <script>alert("xss")</script>Doe',
          email: 'test@example.com',
          message: 'Test <b>bold</b> message <script>alert("xss")</script>',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      mockPutObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      await handler(event);

      // Check that putObject was called with sanitized data
      const putCalls = mockPutObject.mock.calls;
      expect(putCalls.length).toBeGreaterThan(0);

      // Find the submissions call (not the rate limit one)
      const submissionCall = putCalls.find(call =>
        call[0].Key && call[0].Key.includes('submissions')
      );

      expect(submissionCall).toBeDefined();
      const submission = JSON.parse(submissionCall[0].Body);
      expect(submission[0].name).toBe('John Doe');
      expect(submission[0].message).toBe('Test bold message');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow first submission from IP', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      mockPutObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should block duplicate submissions within 60 minutes', async () => {
      const ip = '192.168.1.2';
      const lastEmail = 'previous@example.com';
      const now = Date.now();
      const oneHourAgo = now - 30 * 60 * 1000; // 30 minutes ago

      setupS3Mocks.returnRateLimitData(ip, lastEmail, oneHourAgo);

      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: ip
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(429);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Too many requests. Please try again later.');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on S3 write failure', async () => {
      setupS3Mocks.returnEmpty();
      setupS3Mocks.failOnPut();

      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Failed to process submission');
    });

    it('should handle malformed S3 JSON gracefully', async () => {
      setupS3Mocks.returnMalformedJson();

      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('Success Path', () => {
    it('should successfully process a valid submission', async () => {
      mockPutObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
          captchaToken: 'valid-token'
        }),
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Thank you! We will be in touch within 24 hours.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/contact',
        body: 'not valid json',
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid JSON in request body');
    });

    it('should reject non-POST requests', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/contact',
        requestContext: {
          identity: {
            sourceIp: '192.168.1.1'
          }
        }
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Only POST requests are allowed');
    });
  });
});
