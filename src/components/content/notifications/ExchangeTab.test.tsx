import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../config/i18n';
import ExchangeTab from './ExchangeTab';
import type ExchangeRequest from '../../types/ExchangeRequest';
import type User from '../../types/User';
import type Product from '../../types/Product';

const wrap = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const USER_ID = 1;

const friend: User = { id: 2, first_name: 'Alice', last_name: 'Smith' };
const myProduct: Product = { id: 10, name: 'My Guitar' };
const theirProduct: Product = { id: 20, name: 'Their Bike' };

const makePending = (overrides: Partial<ExchangeRequest> = {}): ExchangeRequest => ({
  _id: 'ex-1',
  id_stuffier: USER_ID,   // I am the owner receiving an incoming request
  id_stuff: myProduct.id!,
  id_friend: friend.id!,
  id_friend_stuff: theirProduct.id!,
  status: 'pending',
  ...overrides,
});

const makeAccepted = (overrides: Partial<ExchangeRequest> = {}): ExchangeRequest => ({
  ...makePending(),
  _id: 'ex-2',
  status: 'accepted',
  ...overrides,
});

const defaultProps = {
  friends: [friend],
  requestedProducts: [myProduct, theirProduct],
  pendingExchangeId: null as string | null,
  userId: USER_ID,
  dismissedIds: new Set<string>(),
  onAccept: vi.fn(),
  onComplete: vi.fn(),
  onDelete: vi.fn(),
  onDismiss: vi.fn(),
};

describe('ExchangeTab', () => {
  it('renders nothing when there are no active exchanges', () => {
    const { container } = wrap(
      <ExchangeTab {...defaultProps} activeExchanges={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('incoming pending requests', () => {
    it('shows the Incoming section label', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} />);
      expect(screen.getByText('Incoming')).toBeInTheDocument();
    });

    it('shows their offered product name', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} />);
      expect(screen.getByText(/Their Bike/)).toBeInTheDocument();
    });

    it('shows the requester full name', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} />);
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    it('shows what they want (my product)', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} />);
      expect(screen.getByText(/My Guitar/)).toBeInTheDocument();
    });

    it('renders Accept and Decline buttons', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} />);
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    });

    it('calls onAccept with exchange _id when Accept is clicked', () => {
      const onAccept = vi.fn();
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} onAccept={onAccept} />);
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      expect(onAccept).toHaveBeenCalledWith('ex-1');
    });

    it('calls onDelete with exchange _id when Decline is clicked', () => {
      const onDelete = vi.fn();
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makePending()]} onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
      expect(onDelete).toHaveBeenCalledWith('ex-1');
    });
  });

  describe('incoming accepted requests', () => {
    it('shows the Arrange & Complete section label', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makeAccepted()]} />);
      expect(screen.getByText(/Arrange meetup/)).toBeInTheDocument();
    });

    it('renders Confirm Trade and Cancel buttons', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makeAccepted()]} />);
      expect(screen.getByRole('button', { name: 'Confirm Trade' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('calls onComplete when Confirm Trade is clicked', () => {
      const onComplete = vi.fn();
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[makeAccepted()]} onComplete={onComplete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Trade' }));
      expect(onComplete).toHaveBeenCalledWith('ex-2');
    });
  });

  describe('outgoing pending requests (I am the requester)', () => {
    const outgoingPending = makePending({
      _id: 'ex-3',
      id_stuffier: friend.id,   // friend is the owner
      id_friend: USER_ID,       // I am the requester
    });

    it('shows the Outgoing section label', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[outgoingPending]} />);
      expect(screen.getByText('Outgoing')).toBeInTheDocument();
    });

    it('shows pending response badge', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[outgoingPending]} />);
      expect(screen.getByText(/Waiting for response/)).toBeInTheDocument();
    });

    it('renders a Cancel button and a Dismiss button', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[outgoingPending]} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });

  describe('outgoing accepted requests', () => {
    const outgoingAccepted: ExchangeRequest = {
      _id: 'ex-4',
      id_stuffier: friend.id!,
      id_stuff: theirProduct.id!,
      id_friend: USER_ID,
      id_friend_stuff: myProduct.id!,
      status: 'accepted',
    };

    it('shows accepted badge', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[outgoingAccepted]} />);
      expect(screen.getByText(/Arrange the meetup/)).toBeInTheDocument();
    });

    it('renders Confirm Trade and Cancel for outgoing accepted', () => {
      wrap(<ExchangeTab {...defaultProps} activeExchanges={[outgoingAccepted]} />);
      expect(screen.getByRole('button', { name: 'Confirm Trade' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });
});
