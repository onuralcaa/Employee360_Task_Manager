import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer Component', () => {
  it('renders company name', () => {
    renderFooter();
    expect(screen.getByText('Employee360')).toBeInTheDocument();
  });

  it('displays copyright notice with current year', () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Employee360. All rights reserved.`)).toBeInTheDocument();
  });

  it('contains quick links section', () => {
    renderFooter();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  });

  it('displays social media links', () => {
    renderFooter();
    expect(screen.getByText('Connect With Us')).toBeInTheDocument();
    
    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });

    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays company description', () => {
    renderFooter();
    expect(screen.getByText('Task management made simple for teams of all sizes.')).toBeInTheDocument();
  });
});