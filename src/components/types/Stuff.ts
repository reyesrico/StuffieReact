import Category from "./Category";
import Subcategory from "./Subcategory";

export default interface Stuff {
  id: number,
  name: string,
  category: number, //Category,
  subcategory: number, /// Subcategory,
  fileName: string
}
