export default interface Friendship {
  _id?: string;
  user_id: number;
  friend_id: number;
  status: 'accepted' | 'pending';
  initiated_by: number;
}
