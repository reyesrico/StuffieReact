// import XLSX from 'xlsx';
import Product from '../types/Product';

// const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
// const excelfileExtension = '.xlsx';

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getArrayofArrays(productsArray: Array<Product>) {
  return productsArray.map((product: Product) => {
    return [product.id, product.name, product.category, product.subcategory];
  });
}

function getColsName(product: any) {
  return Object.keys(product).map((key: string) => capitalize(key))
}

/*
*  This is to convert 
*  Products = { [category.id]: [ {id: 1, name: 'Product' ...} ] to
*  Res = [ ['Id', 'Name', ...], [1, 'Product', ...] ]
*  needed for XLSX.
*/
export function getDataToExport(products: any) {
  let data: Array<any> = [];

  Object.keys(products).forEach(key => {
    if (products[key].length > 0) {

      // Setting cols names first
      // [ ['id', 'name', ...]]
      if (!data.length) {
        data = [getColsName({
          id: products[key][0].id,
          name: products[key][0].name,
          category: products[key][0].category,
          subcategory: products[key][0].subcategory
        })];
      }

      const arrayOfCategory = getArrayofArrays(products[key]);
      data = [...data, ...arrayOfCategory];
    }
  });

  return data;
}

/*
 * Generates and downloads a CSV inventory file from the user's products map.
 * products: { [categoryId: number]: Product[] }
 * categories: Category[] — used to resolve category names
 */
export function downloadCSV(products: any, categories: Array<{ id: number; name: string }>, fileName: string) {
  const rows: string[][] = [['Name', 'Category', 'Subcategory', 'Cost']];

  Object.keys(products).forEach(categoryId => {
    const categoryProducts: Array<Product> = products[categoryId];
    const category = categories.find(c => c.id === Number(categoryId));
    const categoryName = category?.name ?? categoryId;

    categoryProducts.forEach(product => {
      rows.push([
        product.name ?? '',
        String(categoryName),
        product.subcategory != null ? String(product.subcategory) : '',
        product.cost != null ? String(product.cost) : '',
      ]);
    });
  });

  const csv = rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
