import React, { useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './toastStyles.css';
import { WalletContext } from './context/WalletContext';  

function App() {
  const { walletAddress, network, balance, loading, connectWallet, disconnectWallet, fetchBalance } = useContext(WalletContext);
  const [inputAddress, setInputAddress] = useState(''); 
  const [manualBalance, setManualBalance] = useState(''); 

  const handleCheckBalance = async () => {
    if (inputAddress.trim() === '') {
      toast.error('Please enter an Ethereum address.', { className: 'custom-toast' });
      return;
    }
    const balance = await fetchBalance(inputAddress);
    setManualBalance(`${balance} ETH`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3Bridge Wallet Connect</h1>
        
        <button onClick={connectWallet} disabled={loading || walletAddress}>
          {loading ? 'Connecting...' : walletAddress ? 'Connected' : 'Connect Wallet'}
        </button>

        {walletAddress && <p>Connected Wallet Address: {walletAddress}</p>}
        {walletAddress && network && <p>Current Network ID: {network}</p>}
        {walletAddress && balance && <p>Balance: {balance}</p>}

        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Enter Ethereum Address"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            style={{ width: '300px', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={handleCheckBalance} disabled={!inputAddress}>
            Check Balance
          </button>
        </div>

        {manualBalance && (
          <p style={{ marginTop: '10px' }}>
            Balance of {inputAddress}: {manualBalance}
          </p>
        )}

        {walletAddress && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={disconnectWallet}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Disconnect Account
            </button>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      </header>
    </div>
  );
}

export default App;
