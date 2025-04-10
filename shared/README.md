# Shared Utilities - Employee360

This directory contains shared utilities, components, and configuration that can be used across all modules in the Employee360 Task Manager system.

## Structure

```
shared/
├── utils/        # Shared utility functions
│   ├── logger/   # Logging utilities
│   └── validation/ # Validation utilities
├── components/   # Shared UI components
└── config/       # Shared configuration
```

## Available Utilities

### Logging

A consistent logging system to be used across all modules:

```javascript
const { logger } = require('@employee360/shared/utils/logger');

logger.info('This is an info message');
logger.error('This is an error message', { error });
logger.warn('This is a warning message');
logger.debug('This is a debug message');
```

### Validation

Common validation functions used across the system:

```javascript
const { validateEmail, validatePassword } = require('@employee360/shared/utils/validation');

// Validate email
const isValidEmail = validateEmail('user@example.com'); // true

// Validate password (min 8 chars, 1 uppercase, 1 number)
const isValidPassword = validatePassword('Password123'); // true
```

### Error Codes

Standardized error codes and messages for consistent API responses:

```javascript
const { ErrorCodes } = require('@employee360/shared/utils/errorCodes');

throw new ApiError(ErrorCodes.UNAUTHORIZED, 'User is not authorized to access this resource');
```

## How to Use Shared Components

Import components directly in your module:

```javascript
// For backend utilities
const { logger } = require('@employee360/shared/utils/logger');

// For frontend components (React)
import { Button, Card } from '@employee360/shared/components';
```

## Adding New Shared Resources

When adding new resources to the shared directory:

1. Create a directory structure that indicates the purpose
2. Add proper documentation and exports
3. Update this README if needed
4. Create tests for the shared code