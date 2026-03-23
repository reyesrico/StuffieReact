import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropDown from './DropDown';

describe('DropDown', () => {
  const mockValues = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
  ];

  it('renders without crashing', () => {
    const { container } = render(<DropDown values={mockValues} onChange={() => {}} />);
    expect(container.querySelector('select')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<DropDown values={mockValues} onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const mockOnChange = jest.fn();
    render(<DropDown values={mockValues} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ id: 2, name: 'Option 2' });
  });
});
