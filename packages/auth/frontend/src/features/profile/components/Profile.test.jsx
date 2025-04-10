import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { mockAuthContext } from '../../../__mocks__/authContext';
import { profileService } from '../profileService';
import Profile from './Profile';

// Mock the profile service
jest.mock('../profileService', () => ({
  profileService: {
    updateProfile: jest.fn()
  }
}));

const mockUser = {
  _id: '123',
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  department: 'Engineering',
  position: 'Developer'
};

const renderProfile = (authContextValue = { ...mockAuthContext, user: mockUser }) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Profile />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads user data into form fields', () => {
    renderProfile();

    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.surname)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.department)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.position)).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    renderProfile();
    
    // Clear required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderProfile();
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.blur(screen.getByLabelText(/email/i));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue(mockUser);
    profileService.updateProfile = mockUpdateProfile;

    const mockUpdateUser = jest.fn();
    renderProfile({ ...mockAuthContext, user: mockUser, updateUser: mockUpdateUser });

    const updatedData = {
      ...mockUser,
      name: 'Jane',
      department: 'Product'
    };

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: updatedData.name } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: updatedData.department } });
    
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        name: updatedData.name,
        department: updatedData.department
      }));
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message on update failure', async () => {
    const errorMessage = 'Failed to update profile';
    profileService.updateProfile = jest.fn().mockRejectedValue(new Error(errorMessage));

    renderProfile();
    
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('allows dismissing success message', async () => {
    profileService.updateProfile = jest.fn().mockResolvedValue(mockUser);
    renderProfile();
    
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      const successAlert = screen.getByText(/profile updated successfully/i);
      expect(successAlert).toBeInTheDocument();
      
      const closeButton = successAlert.parentElement.querySelector('button');
      fireEvent.click(closeButton);
      
      expect(screen.queryByText(/profile updated successfully/i)).not.toBeInTheDocument();
    });
  });
});