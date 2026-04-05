import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@fluentui/react';

import { Link } from 'react-router-dom';

import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import { searchProductsAndCategories, filterProductsByText } from '../../api/products.api';
import { useCategories, useSubcategories } from '../../hooks/queries';
import './SearchBar.scss';

const SearchBar = (props: any) => {
  const searchBarRef = useRef<HTMLDivElement>(null);

  // React Query hooks for categories/subcategories (used in full search mode)
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);

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
    if (!searchBarRef.current || !searchBarRef.current.contains(event.target)) {
      setSearchText('');
      setIsOpen(false);
    }
  }

  const fetchResults = async (searchText: string) => {
    const { products, selectProduct } = props;

    setSearchText(searchText);
    setIsOpen(true);
    setIsLoading(true);

    if (searchText) {
      if (selectProduct) {
        // Simple product filter for Exchange mode
        setResults(filterProductsByText(searchText, products) as any);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        // Full search including categories and subcategories
        const searchResults = await searchProductsAndCategories(
          searchText, 
          products, 
          categories, 
          subcategories
        );
        if (searchResults.length) {
          setResults(searchResults as any);
          setIsOpen(true);
          setIsLoading(false);
        } else {
          setIsOpen(false);
          setIsLoading(false);
        }
      }
    } else {
      setIsOpen(false);
      setIsLoading(false);
    }
  }

  const renderResults = () => {
    const { selectProduct } = props;

    if (results.length) {
      return (
        <div className="search__results">
          {/* eslint-disable react/no-array-index-key */}
          {results.map((result: any, index: number) => {
            const linkTo = `/${result.type.toLowerCase()}/${result.id}`;
            return (
              <div className="search__result" key={index}>
                {!selectProduct &&
                  <Link key={index} className="search__result-link" to={linkTo}>
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
        <div className={`search__result-type search__result-${type}`}>{type}</div>
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
        />
        <div className="search-bar__button">
          <Icon iconName="Search" />
        </div>
      </div>
      <div className="search-bar__content-container">
        <div className={`search-bar__content ${isOpenCss}`}>
          {isLoading && <Loading size="md" />}
          {!isLoading && renderResults()}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
