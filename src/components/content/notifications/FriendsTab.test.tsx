import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../config/i18n';
import FriendsTab from './FriendsTab';
import type User from '../../types/User';

const wrap = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const incomingFriend: User = { id: 10, first_name: 'Diana', last_name: 'Prince', email: 'diana@example.com' };
const sentFriend: User = { id: 20, first_name: 'Clark', last_name: 'Kent', email: 'clark@example.com' };

const defaultProps = {
  friendRequests: [] as User[],
  sentFriendRequests: [] as User[],
  pendingFriendId: null as number | null,
  onFriendRequest: vi.fn(),
  setConfirmCancelTarget: vi.fn(),
};

describe('FriendsTab', () => {
  it('renders the section container even when both lists are empty', () => {
    const { container } = wrap(<FriendsTab {...defaultProps} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('does not show Incoming label when friendRequests is empty', () => {
    wrap(<FriendsTab {...defaultProps} />);
    expect(screen.queryByText('Incoming')).toBeNull();
  });

  it('does not show Sent by you label when sentFriendRequests is empty', () => {
    wrap(<FriendsTab {...defaultProps} />);
    expect(screen.queryByText('Sent by you')).toBeNull();
  });

  describe('incoming friend requests', () => {
    it('shows the Incoming section label', () => {
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} />);
      expect(screen.getByText('Incoming')).toBeInTheDocument();
    });

    it('shows the friend full name and email', () => {
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} />);
      expect(screen.getByText(/Diana Prince/)).toBeInTheDocument();
      expect(screen.getByText('diana@example.com')).toBeInTheDocument();
    });

    it('renders Avatar initials', () => {
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} />);
      expect(screen.getByText('DP')).toBeInTheDocument();
    });

    it('renders Accept and Reject buttons', () => {
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} />);
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    });

    it('calls onFriendRequest(friend, true) when Accept is clicked', () => {
      const onFriendRequest = vi.fn();
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} onFriendRequest={onFriendRequest} />);
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
      expect(onFriendRequest).toHaveBeenCalledWith(incomingFriend, true);
    });

    it('calls onFriendRequest(friend, false) when Reject is clicked', () => {
      const onFriendRequest = vi.fn();
      wrap(<FriendsTab {...defaultProps} friendRequests={[incomingFriend]} onFriendRequest={onFriendRequest} />);
      fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
      expect(onFriendRequest).toHaveBeenCalledWith(incomingFriend, false);
    });

    it('shows loading ellipsis on Accept button when pendingFriendId matches', () => {
      wrap(
        <FriendsTab
          {...defaultProps}
          friendRequests={[incomingFriend]}
          pendingFriendId={incomingFriend.id!}
        />
      );
      expect(screen.getByRole('button', { name: '…' })).toBeInTheDocument();
    });

    it('disables buttons when pendingFriendId is set', () => {
      wrap(
        <FriendsTab
          {...defaultProps}
          friendRequests={[incomingFriend]}
          pendingFriendId={99}
        />
      );
      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('sent friend requests', () => {
    it('shows the Sent by you section label', () => {
      wrap(<FriendsTab {...defaultProps} sentFriendRequests={[sentFriend]} />);
      expect(screen.getByText('Sent by you')).toBeInTheDocument();
    });

    it('shows the sent friend full name and email', () => {
      wrap(<FriendsTab {...defaultProps} sentFriendRequests={[sentFriend]} />);
      expect(screen.getByText(/Clark Kent/)).toBeInTheDocument();
      expect(screen.getByText('clark@example.com')).toBeInTheDocument();
    });

    it('shows a Pending badge', () => {
      wrap(<FriendsTab {...defaultProps} sentFriendRequests={[sentFriend]} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows a Cancel button', () => {
      wrap(<FriendsTab {...defaultProps} sentFriendRequests={[sentFriend]} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('calls setConfirmCancelTarget with the user when Cancel is clicked', () => {
      const setConfirmCancelTarget = vi.fn();
      wrap(
        <FriendsTab
          {...defaultProps}
          sentFriendRequests={[sentFriend]}
          setConfirmCancelTarget={setConfirmCancelTarget}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(setConfirmCancelTarget).toHaveBeenCalledWith(sentFriend);
    });
  });
});
