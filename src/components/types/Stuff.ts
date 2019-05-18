import Category from "./Category";
import Subcategory from "./Subcategory";

export default interface Stuff {
  id: number;
  name: string;
  category: Category;
  subcategory: Subcategory;
  fileName: string;
}
