import React, { useState, useEffect, useRef } from 'react';

const SearchInput = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimeout = useRef(null);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setHasSearched(false);
  };

  useEffect(() => {
    if (searchTerm.length >= 1) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (!hasSearched) {
          onSearch(searchTerm);
          setHasSearched(true);
        }
      }, 300);
    }

    return () => {

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, onSearch, hasSearched]);

  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={handleChange}
      style={{ marginBottom: '15px', padding: '5px' }}
    />
  );
};

export default SearchInput;
