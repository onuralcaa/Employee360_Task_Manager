import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

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

  it('initializes with default values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates field value and validates on change', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email' }
      });
    });

    expect(result.current.values.email).toBe('invalid-email');
  });

  it('validates field on blur', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email' }
      });
      result.current.handleBlur({
        target: { name: 'email' }
      });
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  it('validates all fields on form submission', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    let submittedData = null;
    const onSubmit = (data) => {
      submittedData = data;
    };

    act(() => {
      result.current.handleSubmit(onSubmit)({ preventDefault: () => {} });
    });

    expect(result.current.errors.username).toBe('Username is required');
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(submittedData).toBeNull();
  });

  it('calls onSubmit with form data when validation passes', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    let submittedData = null;
    const onSubmit = (data) => {
      submittedData = data;
    };

    const validData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

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
    expect(submittedData).toEqual(validData);
  });

  it('resets form to initial values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange({
        target: { name: 'username', value: 'testuser' }
      });
      result.current.handleBlur({
        target: { name: 'username' }
      });
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('tracks form submission state', async () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    const asyncSubmit = async (data) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return data;
    };

    act(() => {
      result.current.handleSubmit(asyncSubmit)({ preventDefault: () => {} });
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});