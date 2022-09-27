import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';
import { Link } from 'react-router-dom';

import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import { getSearchResults, getProductResults } from '../../services/stuff';
import './SearchBar.scss';

const SearchBar = (props: any) => {
  let source: any = null;

  const searchBarRef = useRef<HTMLDivElement>(null);

  let [isLoading, setIsLoading] = useState(false);
  let [isOpen, setIsOpen] = useState(false);
  let [searchText, setSearchText] = useState('');;
  let [results, setResults] = useState([]);

  useEffect(() => {
    // if (searchBarRef.current) {
    //   console.log(searchBarRef.current);
    // }
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });


  const handleClickOutside = (event: any) => {
    const domNode = ReactDOM.findDOMNode(searchBarRef.current);

    if (!domNode || !domNode.contains(event.target)) {
      setSearchText('');
      setIsOpen(false);
    }
  }

  const fetchResults = (searchText: string) => {
    const { products, selectProduct } = props;

    source && source.cancel('Cancel pending requests.');
    source = axios.CancelToken.source();
    setSearchText(searchText);
    setIsOpen(true);
    setIsLoading(true);

    if (searchText) {
      if (selectProduct) {
        setResults(getProductResults(searchText, products));
        setIsOpen(true);
        setIsLoading(false);
      } else {
        getSearchResults(searchText, products, source.token).then((results: any) => {
          if (results.length) {
            setResults(results);
            setIsOpen(true);
            setIsLoading(false);
          } else {
            setIsOpen(false);
            setIsLoading(false);
          }
        });
      }
    } else {
      setIsOpen(false);
      setIsLoading(false);
    }
  }

  const getLinkTo = (result: any) => {
    return { pathname: `/${result.type.toLowerCase()}/${result.id}`, [result.type.toLowerCase()]: result.name };
  }

  const renderResults = () => {
    const { selectProduct } = props;

    if (results.length) {
      return (
        <div className="search__results">
          {results.map((result: any, index: number) => {
            return (
              <div className="search__result" key={index}>
                {!selectProduct &&
                  <Link key={index} className="search__result-link" to={getLinkTo(result)}>
                    {renderResultName(result)}
                  </Link>
                }
                {selectProduct &&
                  <button key={index} onClick={event => event && selectProduct(result)}>
                    {renderResultName(result)}
                  </button>
                }
              </div>);
          })}
        </div>
      );
    }
  }

  const renderResultName = (result: any) => {
    const type = result.type ? result.type[0] : 'P';

    return (
      <div className="search__result-info">
        <div className="search__result-name">{result.name}</div>
        <div className={`search__result-type search__result-${type}`}>| {type}</div>
      </div>
    );
  }

  const isOpenCss = isOpen ? 'dropdown--is-open' : '';
  const width = window.screen.width <= 900 ? "100%" : "auto";

  return (
    <div className="search-bar" ref={searchBarRef}>
      <div className="search-bar__form">
        <TextField
          name="search"
          type="input"
          placeholder="Find stuff..."
          onChange={(e: any) => fetchResults(e.target.value)}
          value={searchText}
          containerStyle={{ width }}
        >
        </TextField>
        <div className="search-bar__button">
          <i className="fas fa-search"></i>
        </div>
      </div>
      <div className="search-bar__content-container">
        <div className={`search-bar__content ${isOpenCss}`}>
          {isLoading && <Loading size="md"></Loading>}
          {!isLoading && renderResults()}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
