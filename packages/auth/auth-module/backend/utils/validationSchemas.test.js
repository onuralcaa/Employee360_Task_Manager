const { 
  registerSchema,
  loginSchema,
  updateProfileSchema
} = require('./validationSchemas');

describe('Validation Schemas', () => {
  describe('Register Validation Schema', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test',
      surname: 'User'
    };

    it('validates a correct user object', () => {
      const { error } = registerSchema.validate(validUser);
      expect(error).toBeUndefined();
    });

    it('requires username', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        username: ''
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('not allowed to be empty');
    });

    it('validates username format', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        username: 'test@user'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Username can only contain letters, numbers and underscores');
    });

    it('requires valid email', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        email: 'invalid-email'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email');
    });

    it('requires password with minimum length', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        password: 'short'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 6 characters');
    });

    it('validates name length when provided', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        name: 'A' // Too short
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 2 characters');
    });

    it('validates surname length when provided', () => {
      const { error } = registerSchema.validate({
        ...validUser,
        surname: 'A' // Too short
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 2 characters');
    });
  });

  describe('Login Validation Schema', () => {
    const validLogin = {
      username: 'testuser',
      password: 'Password123'
    };

    it('validates correct login credentials', () => {
      const { error } = loginSchema.validate(validLogin);
      expect(error).toBeUndefined();
    });

    it('requires username', () => {
      const { error } = loginSchema.validate({
        password: validLogin.password
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Username is required');
    });

    it('requires password', () => {
      const { error } = loginSchema.validate({
        username: validLogin.username
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Password is required');
    });
  });

  describe('Update Profile Validation Schema', () => {
    const validUpdate = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com'
    };

    it('validates correct update data', () => {
      const { error } = updateProfileSchema.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('validates email format when provided', () => {
      const { error } = updateProfileSchema.validate({
        ...validUpdate,
        email: 'invalid-email'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email');
    });

    it('validates name length when provided', () => {
      const { error } = updateProfileSchema.validate({
        ...validUpdate,
        name: 'A'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 2 characters');
    });

    it('validates surname length when provided', () => {
      const { error } = updateProfileSchema.validate({
        ...validUpdate,
        surname: 'A'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 2 characters');
    });

    it('allows partial updates', () => {
      const partialUpdates = [
        { name: 'Updated' },
        { surname: 'User' },
        { email: 'updated@example.com' }
      ];

      partialUpdates.forEach(update => {
        const { error } = updateProfileSchema.validate(update);
        expect(error).toBeUndefined();
      });
    });

    it('requires at least one field', () => {
      const { error } = updateProfileSchema.validate({});
      expect(error).toBeDefined();
      expect(error.message).toContain('At least one field must be provided for update');
    });
  });
});