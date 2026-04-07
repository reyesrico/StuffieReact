export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export default interface ExchangeRequest {
  _id: string;
  id_stuffier: number;
  id_stuff: number;
  id_friend: number;
  id_friend_stuff: number;
  status: ExchangeStatus;
};
