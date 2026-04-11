// States: pending → accepted → completed | rejected | cancelled
export type PurchaseStatus = 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled';

export default interface PurchaseRequest {
  _id: string;
  id_stuffier: number;   // seller (owner of the item)
  id_stuff: number;      // product being purchased
  id_friend: number;     // buyer (user who made the request)
  cost: number;          // asking_price at time of request (locked in)
  status: PurchaseStatus;
  completed_at?: string; // ISO timestamp when transaction was confirmed
  completed_by?: number; // user_id who confirmed completion
};
