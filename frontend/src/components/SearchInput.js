import React, { useState, useEffect } from 'react';

const SearchInput = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {

    if (searchTerm.length > 2) {
      const delayDebounce = setTimeout(() => {
        onSearch(searchTerm); 
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm, onSearch]); 

  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ marginBottom: '15px', padding: '5px' }}
    />
  );
};

export default SearchInput;
