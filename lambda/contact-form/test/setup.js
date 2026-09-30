jest.mock('aws-sdk');

const AWS = require('aws-sdk');

// Mock S3
const mockGetObject = jest.fn();
const mockPutObject = jest.fn();

AWS.S3 = jest.fn(() => ({
  getObject: mockGetObject,
  putObject: mockPutObject
}));

// Mock SES
const mockSendEmail = jest.fn();

AWS.SES = jest.fn(() => ({
  sendEmail: mockSendEmail
}));

// Mock https module
jest.mock('https');
const https = require('https');

// Default setup for https mock - returns successful CAPTCHA response
https.request = jest.fn((options, callback) => {
  const mockRes = {
    on: jest.fn(function(event, handler) {
      if (event === 'data') {
        // Immediately call the data handler with response
        setTimeout(() => handler(JSON.stringify({ success: true })), 0);
      } else if (event === 'end') {
        // Call end handler after data
        setTimeout(() => handler(), 0);
      }
    })
  };

  // Return the request object with write and end methods
  return {
    on: jest.fn(function(event, handler) {
      if (event === 'error') {
        this._errorHandler = handler;
      }
    }),
    write: jest.fn(),
    end: jest.fn(function() {
      // Call the callback with the mock response
      callback(mockRes);
    })
  };
});

// Utility functions to setup mock responses
const setupS3Mocks = {
  returnEmpty: () => {
    mockGetObject.mockReturnValue({
      promise: jest.fn().mockRejectedValue({ code: 'NoSuchKey' })
    });
  },
  returnRateLimitData: (ip, lastEmail, timestamp) => {
    mockGetObject.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: {
          toString: () => JSON.stringify({
            [ip]: {
              email: lastEmail,
              timestamp
            }
          })
        }
      })
    });
  },
  returnSubmissionData: (submissions) => {
    mockGetObject.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: {
          toString: () => JSON.stringify(submissions)
        }
      })
    });
  },
  failOnGet: () => {
    mockGetObject.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('S3 error'))
    });
  },
  failOnPut: () => {
    mockPutObject.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('S3 write error'))
    });
  },
  returnMalformedJson: () => {
    mockGetObject.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: {
          toString: () => 'not valid json'
        }
      })
    });
  }
};

const setupSESMocks = {
  returnSuccess: () => {
    mockSendEmail.mockReturnValue({
      promise: jest.fn().mockResolvedValue({ MessageId: 'test-id' })
    });
  },
  returnFailure: () => {
    mockSendEmail.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('SES error'))
    });
  }
};

const setupHttpsMocks = {
  returnSuccessResponse: (responseData) => {
    https.request = jest.fn((options, callback) => {
      const mockRes = {
        on: jest.fn(function(event, handler) {
          if (event === 'data') {
            setTimeout(() => handler(JSON.stringify(responseData)), 0);
          } else if (event === 'end') {
            setTimeout(() => handler(), 0);
          }
        })
      };

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(function() {
          callback(mockRes);
        })
      };
    });
  },
  returnErrorResponse: (error) => {
    https.request = jest.fn((options, callback) => {
      return {
        on: jest.fn(function(event, handler) {
          if (event === 'error') {
            setTimeout(() => handler(error), 0);
          }
        }),
        write: jest.fn(),
        end: jest.fn()
      };
    });
  }
};

module.exports = {
  mockGetObject,
  mockPutObject,
  mockSendEmail,
  setupS3Mocks,
  setupSESMocks,
  setupHttpsMocks
};
