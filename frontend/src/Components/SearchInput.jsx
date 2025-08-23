import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function SearchInput({ searchTerm, setSearchTerm, onSearch }) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimeout = useRef(null);

  const currentSearchTerm = searchTerm !== undefined ? searchTerm : internalSearchTerm;
  const updateSearchTerm = setSearchTerm || setInternalSearchTerm;

  const handleChange = (e) => {
    updateSearchTerm(e.target.value);
    setHasSearched(false);
  };

  useEffect(() => {
    if (currentSearchTerm.length >= 1) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(() => {
        if (!hasSearched) {
          onSearch(currentSearchTerm);
          setHasSearched(true);
        }
      }, 300);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [currentSearchTerm, onSearch, hasSearched]);

  return (
    <input
      className="search-input"
      type="text"
      placeholder="Search..."
      value={currentSearchTerm}
      onChange={handleChange}
    />
  );
}

SearchInput.propTypes = {
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
};

SearchInput.defaultProps = {
  searchTerm: undefined,
  setSearchTerm: undefined,
};

export default SearchInput;
