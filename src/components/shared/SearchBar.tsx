import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import TextField from '../shared/TextField';
import { getSearchResults } from '../../services/stuff';
import './SearchBar.scss';

class SearchBar extends Component<any, any> {
  source: any = null;

  state = {
    isOpen: false,
    results: []
  };

  handleClickOutside() {
    this.setState({ isOpen: false });
  }

  open = () => {
    this.setState({ isOpen: true });
  }

  toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  fetchResults = (searchText: string) => {
    const { products } = this.props;
    console.log(this.source);

    this.source && this.source.cancel('Cancel pending requests.');
    this.source = axios.CancelToken.source();

    if (searchText) {
      getSearchResults(searchText, products, this.source.token).then((results: any) => {
        if (results.length) {
          this.setState({ results, isOpen: true });
        } else {
          this.setState({ isOpen: false });
        }
      });
    } else {
      this.setState({ isOpen: false });
    }
  }

  renderResults() {
    const { results } = this.state;

    if (results.length) {
      return (
        <div className="search__results">
          {results.map((result: any, index: number) => {
            return (
              <Link key={index} className="search__result" to={this.getLinkTo(result)}>
                {result.name} | {result.type}
              </Link> );
          })}
        </div>
      );  
    }
  }

  getLinkTo = (result: any) => {
    return { pathname: `/${result.type.toLowerCase()}/${result.id}`, [result.type.toLowerCase()]: result.name };

  }

  render() {
    const isOpen = this.state.isOpen ? 'dropdown--is-open' : '';

    return (
      <div className="search-bar">
        <div className="search-bar__form">
          <TextField 
            name="search"
            type="input"
            placeholder="Find stuff..."
            onChange={(value: string) => this.fetchResults(value)}
          >
          </TextField>
          <div className="search-bar__button">
            <i className="fas fa-search"></i>
          </div>
        </div>
        <div className="search-bar__content-container">
          <div className={`search-bar__content ${isOpen}`}>
            {this.renderResults()}
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBar;
