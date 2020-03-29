import React, { Component } from 'react';
import TextField from '../shared/TextField';
import './Search.scss';

class Search extends Component<any, any> {
  state = {
    searchText: ''
  };

  render() {
    return (
      <div className="search">
        <TextField 
          name="search"
          type="input"
          placeholder="Search"
          onChange={(value: string) => this.setState({ searchText: value })}
        >
        </TextField>
        <div className="search__button">
          <i className="fas fa-search"></i>
        </div>
      </div>
    );
  }
}

export default Search;
