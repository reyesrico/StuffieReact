import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../config/i18n';
import BuyTab from './BuyTab';
import type PurchaseRequest from '../../types/PurchaseRequest';
import type User from '../../types/User';
import type Product from '../../types/Product';

const wrap = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const USER_ID = 1;

const friend: User = { id: 2, first_name: 'Carol', last_name: 'White' };
const product: Product = { id: 10, name: 'Vintage Camera' };

// In BuyTab: id_stuffier = SELLER (incoming), id_friend = BUYER (outgoing)
const makePurchase = (overrides: Partial<PurchaseRequest> = {}): PurchaseRequest => ({
  _id: 'pu-1',
  id_stuffier: USER_ID,  // I am the seller
  id_friend: friend.id!,  // friend is the buyer
  id_stuff: product.id!,
  cost: 50,
  status: 'pending',
  ...overrides,
});

const defaultProps = {
  friends: [friend],
  requestedProducts: [product],
  pendingPurchaseId: null as string | null,
  userId: USER_ID,
  dismissedIds: new Set<string>(),
  onAccept: vi.fn(),
  onComplete: vi.fn(),
  onDelete: vi.fn(),
  onDismiss: vi.fn(),
};

describe('BuyTab', () => {
  it('renders nothing when there are no active purchases', () => {
    const { container } = wrap(
      <BuyTab {...defaultProps} activePurchases={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('incoming pending (I am the seller)', () => {
    it('shows the Incoming section label', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[makePurchase()]} />);
      expect(screen.getByText('Incoming')).toBeInTheDocument();
    });

    it('shows the buyer name, product and cost', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[makePurchase()]} />);
      expect(screen.getByText(/Carol White/)).toBeInTheDocument();
      expect(screen.getByText(/Vintage Camera/)).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('renders Accept and Decline buttons', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[makePurchase()]} />);
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    });

    it('calls onAccept with _id when Accept is clicked', () => {
      const onAccept = vi.fn();
      wrap(<BuyTab {...defaultProps} activePurchases={[makePurchase()]} onAccept={onAccept} />);
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      expect(onAccept).toHaveBeenCalledWith('pu-1');
    });

    it('calls onDelete with _id when Decline is clicked', () => {
      const onDelete = vi.fn();
      wrap(<BuyTab {...defaultProps} activePurchases={[makePurchase()]} onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
      expect(onDelete).toHaveBeenCalledWith('pu-1');
    });
  });

  describe('incoming accepted (I am the seller, buyer confirmed)', () => {
    it('shows Arrange & Complete section label', () => {
      wrap(
        <BuyTab
          {...defaultProps}
          activePurchases={[makePurchase({ _id: 'pu-2', status: 'accepted' })]}
        />
      );
      expect(screen.getByText(/Arrange meetup/)).toBeInTheDocument();
    });

    it('renders Confirm Transaction and Cancel buttons', () => {
      wrap(
        <BuyTab
          {...defaultProps}
          activePurchases={[makePurchase({ _id: 'pu-2', status: 'accepted' })]}
        />
      );
      expect(screen.getByRole('button', { name: 'Confirm Transaction' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('calls onComplete when Confirm Transaction is clicked', () => {
      const onComplete = vi.fn();
      wrap(
        <BuyTab
          {...defaultProps}
          activePurchases={[makePurchase({ _id: 'pu-2', status: 'accepted' })]}
          onComplete={onComplete}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Transaction' }));
      expect(onComplete).toHaveBeenCalledWith('pu-2');
    });

    it('calls onDelete when Cancel is clicked in accepted state', () => {
      const onDelete = vi.fn();
      wrap(
        <BuyTab
          {...defaultProps}
          activePurchases={[makePurchase({ _id: 'pu-2', status: 'accepted' })]}
          onDelete={onDelete}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onDelete).toHaveBeenCalledWith('pu-2');
    });
  });

  describe('outgoing pending (I am the buyer)', () => {
    const outgoing = makePurchase({
      _id: 'pu-3',
      id_stuffier: friend.id!,  // friend is the seller
      id_friend: USER_ID,       // I am the buyer
    });

    it('shows the Outgoing section label', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoing]} />);
      expect(screen.getByText('Outgoing')).toBeInTheDocument();
    });

    it('shows the seller name, product and cost', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoing]} />);
      expect(screen.getByText(/Carol White/)).toBeInTheDocument();
      expect(screen.getByText(/Vintage Camera/)).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('shows pending response badge', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoing]} />);
      expect(screen.getByText(/Waiting for response/)).toBeInTheDocument();
    });

    it('calls onDelete when Cancel is clicked', () => {
      const onDelete = vi.fn();
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoing]} onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onDelete).toHaveBeenCalledWith('pu-3');
    });
  });

  describe('outgoing accepted (seller accepted, waiting for confirmation)', () => {
    const outgoingAccepted = makePurchase({
      _id: 'pu-4',
      id_stuffier: friend.id!,
      id_friend: USER_ID,
      status: 'accepted',
    });

    it('shows waiting for seller confirm badge', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoingAccepted]} />);
      expect(screen.getByText(/Waiting for seller/)).toBeInTheDocument();
    });

    it('shows Cancel button', () => {
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoingAccepted]} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('calls onDelete when Cancel is clicked in outgoing accepted state', () => {
      const onDelete = vi.fn();
      wrap(<BuyTab {...defaultProps} activePurchases={[outgoingAccepted]} onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onDelete).toHaveBeenCalledWith('pu-4');
    });
  });
});
