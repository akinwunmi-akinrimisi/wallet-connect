import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther, isAddress } from 'ethers'; // Updated imports for ethers v6
import { toast } from 'react-toastify';

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async (address, isWallet = false) => {
    try {
      if (!window.ethereum) {
        toast.error('No Ethereum wallet detected. Please install MetaMask!', {
          className: 'custom-toast',
        });
        return '';
      }

      // Use BrowserProvider directly for ethers v6
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const formattedBalance = formatEther(balance);

      if (isWallet) {
        setBalance(`${formattedBalance} ETH`); // Update state if it is for the connected wallet
      }
      return formattedBalance; // Return balance for manual check
    } catch (error) {
      toast.error(`Failed to fetch balance: ${error.message}`, {
        className: 'custom-toast',
      });
      return '';
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setLoading(true);
      try {
        const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(newAccounts[0]);

        // Get and set the initial network ID, converted to decimal for readability
        const initialNetwork = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
        setNetwork(initialNetwork);

        toast.success(`Connected: ${newAccounts[0]} on Network: ${initialNetwork}`, {
          className: 'custom-toast',
        });

        await fetchBalance(newAccounts[0], true); // Fetch the balance for connected wallet
      } catch (error) {
        toast.error(`Failed to connect: ${error.message}`, {
          className: 'custom-toast',
        });
      } finally {
        // Ensure loading state is reset regardless of success or failure
        setLoading(false);
      }
    } else {
      toast.error('No Ethereum wallet detected. Please install MetaMask!', {
        className: 'custom-toast',
      });
    }
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
    const decimalChainId = parseInt(chainId, 16); // Convert chain ID to decimal for consistency
    setNetwork(decimalChainId);
    toast.info(`Network changed to: ${decimalChainId}`, {
      className: 'custom-toast',
    });
    if (walletAddress) {
      await fetchBalance(walletAddress, true);
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
  }, [handleAccountsChanged, handleNetworkChanged]);

  return {
    walletAddress,
    network,
    balance,
    loading,
    connectWallet,
    fetchBalance,
    disconnectWallet,
  };
}
