import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee360 Task Manager API',
      version: '1.0.0',
      description: 'API documentation for Employee360 Task Manager',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@employee360.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            surname: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'employee'] },
            number: { type: 'string' },
            department: { type: 'string' },
            position: { type: 'string' },
            birthdate: { type: 'string', format: 'date' },
            isActive: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['username', 'email', 'name', 'surname', 'role'],
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            status: { type: 'integer' },
          },
          required: ['message'],
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

export const specs = swaggerJsdoc(options);