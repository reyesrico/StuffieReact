export default interface UserItem {
  user_id: number;
  item_id: number;
  asking_price?: number;
  is_for_sale?: boolean;
  is_for_loan?: boolean;
  is_for_exchange?: boolean;
}
