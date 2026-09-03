import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FINORA API — Personal Finance Intelligence Platform',
      version: '1.0.0',
      description: 'Production-ready REST API for personal financial management, analytics, budgeting, goals, transactions, and intelligent insights.',
      contact: {
        name: 'Arpita',
        url: 'https://github.com/arpitat09/finance-dashboard',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /auth/login or /auth/register',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
