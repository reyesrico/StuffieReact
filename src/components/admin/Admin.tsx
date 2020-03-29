import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Admin.scss';

class Admin extends Component<any, any> {
  render() {
    return (
      <div className="admin">
        <div className="admin__link"><Link to={`/category/add`}>Add Category</Link></div>
        <hr />
        <div className="admin__link"><Link to={`/subcategory/add`}>Add SubCategory</Link></div>
        <hr />
      </div>
    );
  }
}

export default Admin;
