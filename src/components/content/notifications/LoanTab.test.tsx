import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../config/i18n';
import LoanTab from './LoanTab';
import type LoanRequest from '../../types/LoanRequest';
import type User from '../../types/User';
import type Product from '../../types/Product';

const wrap = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const USER_ID = 1;

const friend: User = { id: 2, first_name: 'Bob', last_name: 'Jones' };
const product: Product = { id: 10, name: 'Road Bike' };

// In LoanTab: id_stuffier = OWNER (incoming), id_friend = BORROWER (outgoing)
const makeLoan = (overrides: Partial<LoanRequest> = {}): LoanRequest => ({
  _id: 'ln-1',
  id_stuffier: USER_ID,  // I am the owner, friend is borrowing
  id_friend: friend.id!,
  id_stuff: product.id!,
  status: 'pending',
  ...overrides,
});

const defaultProps = {
  friends: [friend],
  requestedProducts: [product],
  pendingLoanId: null as string | null,
  userId: USER_ID,
  dismissedIds: new Set<string>(),
  onAccept: vi.fn(),
  onComplete: vi.fn(),
  onRequestReturn: vi.fn(),
  onDirectDelete: vi.fn(),
  onDismiss: vi.fn(),
};

describe('LoanTab', () => {
  it('renders nothing when there are no active loans', () => {
    const { container } = wrap(
      <LoanTab {...defaultProps} activeLoans={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('incoming pending (I am the owner)', () => {
    it('shows the Incoming section label', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan()]} />);
      expect(screen.getByText('Incoming')).toBeInTheDocument();
    });

    it('shows the borrower name and product', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan()]} />);
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
      expect(screen.getByText(/Road Bike/)).toBeInTheDocument();
    });

    it('renders Approve Loan and Decline buttons', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan()]} />);
      expect(screen.getByRole('button', { name: 'Approve Loan' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    });

    it('calls onAccept with _id when Approve Loan is clicked', () => {
      const onAccept = vi.fn();
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan()]} onAccept={onAccept} />);
      fireEvent.click(screen.getByRole('button', { name: 'Approve Loan' }));
      expect(onAccept).toHaveBeenCalledWith('ln-1');
    });

    it('calls onDirectDelete with _id when Decline is clicked', () => {
      const onDirectDelete = vi.fn();
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan()]} onDirectDelete={onDirectDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
      expect(onDirectDelete).toHaveBeenCalledWith('ln-1');
    });
  });

  describe('incoming active (item is loaned out)', () => {
    it('shows Active Loans section label', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan({ _id: 'ln-2', status: 'active' })]} />);
      expect(screen.getByText('Active Loans')).toBeInTheDocument();
    });

    it('shows borrower name for active loan', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan({ _id: 'ln-2', status: 'active' })]} />);
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
    });

    it('shows waiting badge (no action button) when status is active', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan({ _id: 'ln-2', status: 'active' })]} />);
      expect(screen.getByText(/Waiting for borrower/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Confirm|Return Item|Approve|Decline|Cancel/i })).toBeNull();
    });

    it('shows Confirm Returned button when status is return_requested', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[makeLoan({ _id: 'ln-3', status: 'return_requested' })]} />);
      expect(screen.getByRole('button', { name: 'Confirm Returned' })).toBeInTheDocument();
    });

    it('calls onComplete when Confirm Returned is clicked', () => {
      const onComplete = vi.fn();
      wrap(
        <LoanTab
          {...defaultProps}
          activeLoans={[makeLoan({ _id: 'ln-3', status: 'return_requested' })]}
          onComplete={onComplete}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Returned' }));
      expect(onComplete).toHaveBeenCalledWith('ln-3');
    });
  });

  describe('outgoing pending (I am the borrower)', () => {
    const outgoing = makeLoan({
      _id: 'ln-4',
      id_stuffier: friend.id!,  // friend is the owner
      id_friend: USER_ID,       // I am the borrower
    });

    it('shows Outgoing section label', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoing]} />);
      expect(screen.getByText('Outgoing')).toBeInTheDocument();
    });

    it('shows the owner name and product', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoing]} />);
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
      expect(screen.getByText(/Road Bike/)).toBeInTheDocument();
    });

    it('shows pending response badge', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoing]} />);
      expect(screen.getByText(/Waiting for response/)).toBeInTheDocument();
    });

    it('calls onDirectDelete when Cancel is clicked', () => {
      const onDirectDelete = vi.fn();
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoing]} onDirectDelete={onDirectDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onDirectDelete).toHaveBeenCalledWith('ln-4');
    });
  });

  describe('outgoing active (I am the borrower, loan approved)', () => {
    const outgoingActive = makeLoan({
      _id: 'ln-5',
      id_stuffier: friend.id!,
      id_friend: USER_ID,
      status: 'active',
    });

    it('shows Return Item button', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoingActive]} />);
      expect(screen.getByRole('button', { name: 'Return Item' })).toBeInTheDocument();
    });

    it('calls onRequestReturn when Return Item is clicked', () => {
      const onRequestReturn = vi.fn();
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoingActive]} onRequestReturn={onRequestReturn} />);
      fireEvent.click(screen.getByRole('button', { name: 'Return Item' }));
      expect(onRequestReturn).toHaveBeenCalledWith('ln-5');
    });
  });

  describe('outgoing return_requested (waiting for owner to confirm)', () => {
    const outgoingReturnReq = makeLoan({
      _id: 'ln-6',
      id_stuffier: friend.id!,
      id_friend: USER_ID,
      status: 'return_requested',
    });

    it('shows waiting badge with no action buttons', () => {
      wrap(<LoanTab {...defaultProps} activeLoans={[outgoingReturnReq]} />);
      expect(screen.getByText(/Waiting/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Confirm|Return Item|Approve|Decline|Cancel/i })).toBeNull();
    });
  });
});
