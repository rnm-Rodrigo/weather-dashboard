import { useState } from 'react';

export default function CitySearch({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    if (query.trim()) {
      onSearch(query.trim());
      setQuery(''); // Clear the input box after searching
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a city name..."
        style={{ 
          padding: '10px 15px', 
          borderRadius: '8px', 
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          flex: 1
        }}
      />
      <button 
        type="submit" 
        style={{ 
          padding: '10px 20px', 
          cursor: 'pointer', 
          borderRadius: '8px', 
          border: 'none', 
          backgroundColor: '#2ecc71', 
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        Add City
      </button>
    </form>
  );
}