export default interface Product {
  _id?: string,
  name?: string,
  id?: number,
  category_id?: number,
  subcategory_id?: number,
  image_key?: string,
  pending_image_key?: string,
  created_at?: string,
  /** Codehooks auto-timestamp (ISO string) — used for feed recency scoring */
  _created?: string,
  cost?: number,
  ss_id?: string,
  quantity?: number
}
