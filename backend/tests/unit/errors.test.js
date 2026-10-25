import { jest } from '@jest/globals';
import { ZodError } from 'zod';
import { AppError } from '../../src/errors/app-error.js';
import { errorHandler } from '../../src/middlewares/error.middleware.js';

describe('Error Handling Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      statusCode: null,
      body: null,
      status: jest.fn().mockImplementation(function (code) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn().mockImplementation(function (data) {
        this.body = data;
        return this;
      })
    };
    next = jest.fn();
  });

  it('should format AppError into standardized error envelope with provided status and code', () => {
    const error = new AppError('OUT_OF_STOCK', 400, 'Requested vehicle is out of stock', [{ itemId: '123' }]);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: {
        code: 'OUT_OF_STOCK',
        message: 'Requested vehicle is out of stock',
        details: [{ itemId: '123' }]
      }
    });
  });

  it('should format ZodError into 400 VALIDATION_ERROR envelope', () => {
    const zodIssues = [
      {
        path: ['price'],
        message: 'Price must be positive',
        code: 'too_small'
      }
    ];
    const error = new ZodError(zodIssues);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input',
        details: zodIssues
      }
    });
  });

  it('should format generic unhandled error into 500 INTERNAL_SERVER_ERROR envelope', () => {
    const error = new Error('Database connection dropped unexpectedly');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred',
        details: []
      }
    });
  });
});
