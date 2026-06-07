import React from 'react';

const SellPage = () => {
  return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h1>Sell Your Tool</h1>

      <p>Search for your tool and activate a listing in seconds.</p>

      <input
        type="text"
        placeholder="Search tool model (example: DCB201)"
        style={{
          width: '400px',
          padding: '12px',
          fontSize: '16px',
          marginTop: '20px'
        }}
      />

      <br /><br />

      <button
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#5B3DF5',
          color: 'white',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        Search Tool
      </button>
    </div>
  );
};

export default SellPage;