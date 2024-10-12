import React from 'react';
import MarketCards from './components/MarketCards';
import RentalAgreement from './components/RentalAgreement';
import Staking from './components/Staking';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Property Marketplace</h1>
      </header>
      <main>
        <MarketCards />
        <RentalAgreement />
        <Staking />
      </main>
    </div>
  );
}

export default App; 