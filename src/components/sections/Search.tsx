import React, { Component } from 'react';
import TextField from '../shared/TextField';
import './Search.scss';

class Search extends Component<any, any> {
  state = {
    searchText: '',
    results: []
  };

  renderResults() {
    const { results } = this.state;

    return results.length && (
      <div className="search__results">
        {results.map(result => {
          (<div className="search__result">{result}</div>)
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="search">
        <div className="search__form">
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
        {this.renderResults()}
      </div>
    );
  }
}

export default Search;
