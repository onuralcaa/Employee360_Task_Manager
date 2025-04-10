import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking overlay', () => {
    render(<Modal {...defaultProps} />);
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    render(<Modal {...defaultProps} />);
    const content = screen.getByText('Modal content');
    fireEvent.click(content);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('renders footer buttons when provided', () => {
    const footerButtons = (
      <>
        <button>Cancel</button>
        <button>Submit</button>
      </>
    );
    render(<Modal {...defaultProps} footerButtons={footerButtons} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('handles keyboard events', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('prevents body scroll when modal is open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { unmount } = render(<Modal {...defaultProps} />);
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('applies custom className to modal content', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass('modal-content', 'custom-modal');
  });

  it('sets focus on first focusable element when opened', () => {
    render(
      <Modal {...defaultProps}>
        <input type="text" data-testid="first-input" />
        <button>Test</button>
      </Modal>
    );
    expect(screen.getByTestId('first-input')).toHaveFocus();
  });
});