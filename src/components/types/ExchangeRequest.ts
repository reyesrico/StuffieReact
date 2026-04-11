export type ExchangeStatus = 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled';

export default interface ExchangeRequest {
  _id: string;
  id_stuffier: number;    // requester (User A)
  id_stuff: number;       // A's offered product (X)
  id_friend: number;      // owner (User B)
  id_friend_stuff: number; // B's product being requested (Y)
  status: ExchangeStatus;
  completed_at?: string;  // ISO timestamp when status became 'completed'
  completed_by?: number;  // user_id of who confirmed completion
};
