export default interface UserItem {
  _id?: string;           // Codehooks document ID (present after read, absent on create input)
  user_id: number;
  item_id: number;
  asking_price?: number;
  quantity?: number;      // number of copies owned — treat missing as 1
  is_for_sale?: boolean;
  is_for_loan?: boolean;
  is_for_exchange?: boolean;
  on_loan?: boolean;      // true while at least one copy is loaned out
  loaned_to?: number;     // user_id of borrower when on_loan is true
  loan_request_id?: string; // _id of the active loan_request record
}
