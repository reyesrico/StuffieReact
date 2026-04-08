export type LoanStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'returned';

export default interface LoanRequest {
  _id: string,
  id_stuffier: number,
  id_stuff: number,
  id_friend: number,
  status: LoanStatus,
};
