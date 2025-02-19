import React, { useState, useEffect, useRef } from 'react';

const SearchInput = ({ searchTerm, setSearchTerm, onSearch }) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimeout = useRef(null);

  // Define se vai usar o estado interno ou externo
  const currentSearchTerm = searchTerm !== undefined ? searchTerm : internalSearchTerm;
  const updateSearchTerm = setSearchTerm || setInternalSearchTerm;

  const handleChange = (e) => {
    updateSearchTerm(e.target.value);
    setHasSearched(false);
  };

  useEffect(() => {
    if (currentSearchTerm.length >= 1) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (!hasSearched) {
          onSearch(currentSearchTerm);
          setHasSearched(true);
        }
      }, 300);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [currentSearchTerm, onSearch, hasSearched]);

  return (
    <input
      type="text"
      placeholder="Search..."
      value={currentSearchTerm}  // Usa o termo de busca correto
      onChange={handleChange}
      style={{ marginBottom: '15px', padding: '5px' }}
    />
  );
};

export default SearchInput;
