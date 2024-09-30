import { useState, useEffect } from 'react';
import { createContext } from 'react';
import { BrowserProvider, formatEther , isAddress} from 'ethers';
import { toast } from 'react-toastify';

export const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setLoading(true);
      try {
        const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(newAccounts[0]);

        const initialNetwork = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
        setNetwork(initialNetwork);

        toast.success(`Connected: ${newAccounts[0]} on Network: ${initialNetwork}`, {
          className: 'custom-toast',
        });

        await fetchBalance(newAccounts[0], true); 
      } catch (error) {
        toast.error(`Failed to connect: ${error.message}`, {
          className: 'custom-toast',
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('No Ethereum wallet detected. Please install MetaMask!', {
        className: 'custom-toast',
      });
    }
  };

  const fetchBalance = async (address, isWallet = false) => {
    try {
      if (!isAddress(address)) {
        toast.error(`Invalid Ethereum address: ${address}`, {
          className: 'custom-toast',
        });
        return '';  
      }
  
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const formattedBalance = formatEther(balance);
  
      if (isWallet) {
        setBalance(`${formattedBalance} ETH`);
      }
      return formattedBalance;
    } catch (error) {
      toast.error(`Failed to fetch balance: ${error.message}`, {
        className: 'custom-toast',
      });
      return '';
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setNetwork('');
    setBalance('');
    setLoading(false);
    toast.info('Disconnected', {
      className: 'custom-toast',
    });
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      toast.info(`Account changed to: ${accounts[0]}`, {
        className: 'custom-toast',
      });
      await fetchBalance(accounts[0], true);
    } else {
      disconnectWallet();
      toast.error('No account connected', {
        className: 'custom-toast',
      });
    }
  };

  const handleNetworkChanged = async (chainId) => {
    const decimalChainId = parseInt(chainId, 16); 
    setNetwork(decimalChainId);
    toast.info(`Network changed to: ${decimalChainId}`, {
      className: 'custom-toast',
    });
    if (walletAddress) {
      await fetchBalance(walletAddress, true);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      window.ethereum.on('chainChanged', handleNetworkChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleNetworkChanged);
      }
    };
  }, [walletAddress]);  

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        network,
        balance,
        loading,
        connectWallet,
        disconnectWallet,
        fetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
