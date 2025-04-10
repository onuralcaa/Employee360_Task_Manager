import { renderHook, act } from '@testing-library/react';
import useForm from './useForm';

describe('useForm Hook', () => {
  const initialValues = {
    username: '',
    email: '',
    password: ''
  };

  const validationRules = {
    username: (value) => !value ? 'Username is required' : '',
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    }
  };

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('updates values correctly', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange({
        target: { name: 'username', value: 'testuser' }
      });
    });

    expect(result.current.values.username).toBe('testuser');
  });

  it('validates single field on blur', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleBlur({
        target: { name: 'email', value: 'invalid-email' }
      });
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  it('validates all fields on form submission', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    let submitData;

    const onSubmit = (data) => {
      submitData = data;
    };

    act(() => {
      result.current.handleSubmit(onSubmit)({ preventDefault: () => {} });
    });

    expect(result.current.errors).toEqual({
      username: 'Username is required',
      email: 'Email is required',
      password: 'Password is required'
    });
    expect(submitData).toBeUndefined();
  });

  it('submits form when all validations pass', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    let submitData;

    const validData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const onSubmit = (data) => {
      submitData = data;
    };

    // Set valid values
    act(() => {
      Object.entries(validData).forEach(([name, value]) => {
        result.current.handleChange({
          target: { name, value }
        });
      });
    });

    act(() => {
      result.current.handleSubmit(onSubmit)({ preventDefault: () => {} });
    });

    expect(result.current.errors).toEqual({});
    expect(submitData).toEqual(validData);
  });

  it('clears errors when field becomes valid', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    // First set invalid email
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email' }
      });
      result.current.handleBlur({
        target: { name: 'email', value: 'invalid-email' }
      });
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address');

    // Then set valid email
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'valid@email.com' }
      });
      result.current.handleBlur({
        target: { name: 'email', value: 'valid@email.com' }
      });
    });

    expect(result.current.errors.email).toBe('');
  });

  it('resets form to initial values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    // Set some values and errors
    act(() => {
      result.current.handleChange({
        target: { name: 'username', value: 'testuser' }
      });
      result.current.handleBlur({
        target: { name: 'email', value: '' }
      });
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });
});