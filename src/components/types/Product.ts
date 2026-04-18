export default interface Product {
  name?: string,
  id?: number,
  category_id?: number,
  subcategory_id?: number,
  image_key?: string,
  created_at?: string,
  /** Codehooks auto-timestamp (ISO string) — used for feed recency scoring */
  _created?: string,
  cost?: number
}
