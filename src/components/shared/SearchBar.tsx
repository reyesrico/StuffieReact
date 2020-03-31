import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import { getSearchResults } from '../../services/stuff';
import './SearchBar.scss';

class SearchBar extends Component<any, any> {
  source: any = null;

  state = {
    isLoading: false,
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

    this.source && this.source.cancel('Cancel pending requests.');
    this.source = axios.CancelToken.source();
    this.setState({ isOpen: true, isLoading: true });

    if (searchText) {
      getSearchResults(searchText, products, this.source.token).then((results: any) => {
        if (results.length) {
          this.setState({ results, isOpen: true, isLoading: false });
        } else {
          this.setState({ isOpen: false, isLoading: false });
        }
      });
    } else {
      this.setState({ isOpen: false, isLoading: false });
    }
  }

  renderResults() {
    const { results } = this.state;

    if (results.length) {
      return (
        <div className="search__results">
          {results.map((result: any, index: number) => {
            return (
              <div className="search__result">
              <Link key={index} className="search__result-link" to={this.getLinkTo(result)}>
                <div className="search__result-info">
                  <div className="search__result-name">{result.name}</div>
                  <div className={`search__result-type search__result-${result.type[0]}`}>| {result.type[0]}</div>
                </div>                 
              </Link>
              </div>);
          })}
        </div>
      );  
    }
  }

  getLinkTo = (result: any) => {
    return { pathname: `/${result.type.toLowerCase()}/${result.id}`, [result.type.toLowerCase()]: result.name };
  }

  render() {
    const { isLoading } = this.state;
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
            {isLoading && <Loading size="md"></Loading>}
            {!isLoading && this.renderResults()}
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBar;
