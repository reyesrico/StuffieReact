export default interface PurchaseRequest {
  _id: string;
  id_stuffier: number;  // Owner (seller)
  id_stuff: number;     // Product being purchased
  id_friend: number;    // Buyer (current user)
  cost: number;         // Price at time of request
};
