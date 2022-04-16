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

      let arrayOfCategory = getArrayofArrays(products[key]);
      data = [...data, ...arrayOfCategory];
    }
  });

  return data;
}

/*
*  XLSX GitHub project
*  https://github.com/SheetJS/sheetjs
*  Example: https://sheetjs.com/demos/writexlsx.html 
*/
export function downloadExcel(products: any, fileName: string) {
  // const data = getDataToExport(products);

  // let worsheet_name = "Products_Sheet";
  // let worksheet_book = XLSX.utils.book_new();

  // /* convert from array of arrays to workbook */
  // let worksheet = XLSX.utils.aoa_to_sheet(data);

  // /* add worksheet to workbook */
  // XLSX.utils.book_append_sheet(worksheet_book, worksheet, worsheet_name);
  // XLSX.writeFile(worksheet_book, `${fileName}${excelfileExtension}`);
}
