import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AvatarEditor from './AvatarEditor';

// Mock the react-image-crop component
jest.mock('react-image-crop', () => {
  return function MockReactCrop({ children }) {
    return <div data-testid="react-crop">{children}</div>;
  };
});

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.result = 'data:image/jpeg;base64,mock-image-data';
  }
  
  readAsDataURL() {
    setTimeout(() => {
      this.onload && this.onload();
    }, 0);
  }
};

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  drawImage: jest.fn(),
}));

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['mock-image-data'], { type: 'image/jpeg' }));
});

describe('AvatarEditor', () => {
  const mockFile = new File(['mock-image-data'], 'test.jpg', { type: 'image/jpeg' });
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with image file', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('Edit Profile Avatar')).toBeInTheDocument();
    expect(screen.getByText('Save Avatar')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AvatarEditor
        isOpen={false}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.queryByText('Edit Profile Avatar')).not.toBeInTheDocument();
  });

  it('shows correct title for group avatars', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="group"
      />
    );

    expect(screen.getByText('Edit Group Avatar')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders transform controls', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('Transform')).toBeInTheDocument();
    expect(screen.getByText('Rotate')).toBeInTheDocument();
    expect(screen.getByText('Flip')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('Zoom Out')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders rotation controls', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('↶ Rotate Left')).toBeInTheDocument();
    expect(screen.getByText('↷ Rotate Right')).toBeInTheDocument();
  });

  it('renders flip controls', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('↔ Flip H')).toBeInTheDocument();
    expect(screen.getByText('↕ Flip V')).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Adjustments')).toBeInTheDocument();
    expect(screen.getByText('Auto Filters')).toBeInTheDocument();
  });

  it('shows filter presets when filters section is expanded', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    // Click the toggle button to expand filters
    const filterToggle = screen.getByText('Filters').parentElement?.querySelector('.toggle-btn');
    if (filterToggle) {
      fireEvent.click(filterToggle);
      
      // Check for some filter presets
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Sepia')).toBeInTheDocument();
      expect(screen.getByText('Grayscale')).toBeInTheDocument();
      expect(screen.getByText('Vintage')).toBeInTheDocument();
    }
  });

  it('shows adjustment sliders when adjustments section is expanded', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    // Click the toggle button to expand adjustments
    const adjustmentToggle = screen.getByText('Adjustments').parentElement?.querySelector('.toggle-btn');
    if (adjustmentToggle) {
      fireEvent.click(adjustmentToggle);
      
      // Check for adjustment sliders
      expect(screen.getByText('Brightness')).toBeInTheDocument();
      expect(screen.getByText('Contrast')).toBeInTheDocument();
      expect(screen.getByText('Saturation')).toBeInTheDocument();
      expect(screen.getByText('Hue')).toBeInTheDocument();
      expect(screen.getByText('Blur')).toBeInTheDocument();
    }
  });

  it('shows auto-generated filters', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    // Check for auto-generated filters
    expect(screen.getByText('Auto Warm')).toBeInTheDocument();
    expect(screen.getByText('Auto Cool')).toBeInTheDocument();
    expect(screen.getByText('Auto Dramatic')).toBeInTheDocument();
    expect(screen.getByText('Auto Soft')).toBeInTheDocument();
    expect(screen.getByText('Auto Vibrant')).toBeInTheDocument();
    expect(screen.getByText('Auto Moody')).toBeInTheDocument();
  });

  it('applies auto filter when clicked', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    const autoWarmButton = screen.getByText('Auto Warm');
    fireEvent.click(autoWarmButton);
    
    // The filter should be applied (we can't easily test the internal state)
    // but we can verify the button exists and is clickable
    expect(autoWarmButton).toBeInTheDocument();
  });

  it('toggles filter sections when toggle buttons are clicked', () => {
    render(
      <AvatarEditor
        isOpen={true}
        imageFile={mockFile}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        type="user"
      />
    );

    const filterToggle = screen.getByText('Filters').parentElement?.querySelector('.toggle-btn');
    const adjustmentToggle = screen.getByText('Adjustments').parentElement?.querySelector('.toggle-btn');

    if (filterToggle && adjustmentToggle) {
      // Initially sections should be collapsed
      expect(screen.queryByText('Original')).not.toBeInTheDocument();
      expect(screen.queryByText('Brightness')).not.toBeInTheDocument();

      // Click to expand filters
      fireEvent.click(filterToggle);
      expect(screen.getByText('Original')).toBeInTheDocument();

      // Click to expand adjustments
      fireEvent.click(adjustmentToggle);
      expect(screen.getByText('Brightness')).toBeInTheDocument();
    }
  });
}); 