import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Admin extends Component<any, any> {
  render() {
    return (
      <div className="admin">
        <Link to={`/category/add`}>+ Add Category</Link>
        <hr />
        <Link to={`/subcategory/add`}>+ Add SubCategory</Link>
        <hr />
      </div>
    );
  }
}

export default Admin;
