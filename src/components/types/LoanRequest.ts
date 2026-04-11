// States: pending → active (accepted) → return_requested → completed
//         pending → rejected | cancelled
export type LoanStatus = 'pending' | 'active' | 'return_requested' | 'completed' | 'rejected' | 'cancelled';

export default interface LoanRequest {
  _id: string;
  id_stuffier: number;   // borrower (User A who made the request)
  id_stuff: number;      // the item being borrowed
  id_friend: number;     // owner (User B who has the item)
  status: LoanStatus;
  completed_at?: string; // ISO timestamp when loan was fully returned
  completed_by?: number; // user_id who confirmed the return
};
