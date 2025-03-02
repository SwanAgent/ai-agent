// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, Wallet } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { ethers } from 'ethers';

// interface TransferProps {
//   data: {
//     walletAddress: string;
//     amount: string;
//     tokenAddress: string;
//   };
//   className?: string;
//   isLoading?: boolean;
// }

// const formatAddress = (address: string) => {
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };

// const ERC20_ABI = [
//   'function transfer(address to, uint256 amount) returns (bool)',
//   'function decimals() view returns (uint8)',
// ];

// export function Transfer({ data, className, isLoading: isPageLoading }: TransferProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [signer, setSigner] = useState<any>(null);
//   const [hash, setHash] = useState<string | null>(null);

//   // Check if MetaMask is installed
//   useEffect(() => {
//       if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
//           setIsMetaMaskInstalled(true);
//       }
//   }, []);

//   // Attempt to connect to MetaMask
//   useEffect(() => {
//       const connectWallet = async () => {
//           if (!isMetaMaskInstalled) return;

//           setIsConnecting(true);
//           try {
//               await window.ethereum.request({method: 'eth_requestAccounts'});
//               const accounts = await window.ethereum.request({method: 'eth_accounts'});
//               if (accounts.length > 0) {
//                 setAccount(accounts[0]);
//               }
//               console.log(accounts, 'accounts');
//               console.log("window.ethereum", window.ethereum);
//               const provider = new ethers.providers.Web3Provider(window.ethereum);
//               console.log("provider", provider);
//               const signer = provider.getSigner();
//               setSigner(signer);
//               console.log("signer", signer);
//               // Switch to Base network if not already on it
//             //   try {
//             //     await window.ethereum.request({
//             //       method: 'wallet_switchEthereumChain',
//             //       params: [{ chainId: '0x14a34' }], // Base chainId
//             //     });
//             //   } catch (switchError: any) {
//             //     console.error("Failed to switch to Base network:", switchError);
//             //   }

//           } catch (error) {
//               console.error("Failed to connect to MetaMask:", error);
//               // Handle errors here
//           } finally {
//               setIsConnecting(false);
//           }
//       };

//       connectWallet();
//   }, [isMetaMaskInstalled]);


//   console.log(account);
//   const handleTransfer = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Check if MetaMask is installed
//       if (!window.ethereum) {
//         throw new Error('Please install MetaMask to continue');
//       }

//       // Request account access
//     //   const accounts = await window.ethereum.request({ 
//     //     method: 'eth_requestAccounts' 
//     //   });
      
//       let transaction;

//       if (data.tokenAddress.toUpperCase() === 'ETH') {
//         // ETH transfer
//         transaction = {
//           to: data.walletAddress,
//           value: ethers.utils.parseEther(data.amount)
//         };
//         console.log(transaction);
//         const tx = await signer.sendTransaction(transaction);
//         await tx.wait();
//         setHash(tx.hash);
//       } else {
//         // ERC20 token transfer
//         const tokenContract = new ethers.Contract(
//           data.tokenAddress,
//           ERC20_ABI,
//           signer
//         );
        
//         const decimals = await tokenContract.decimals();
//         const amount = ethers.utils.parseUnits(data.amount, decimals);
        
//         const tx = await tokenContract.transfer(data.walletAddress, amount);
//         await tx.wait();
//       }

//     } catch (err: any) {
//       setError(err.message || 'Failed to process transfer');
//       console.log(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isPageLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//     {/* <Swap /> */}
//     <Card className={cn('mt-3 overflow-hidden', className)}>
//       <CardHeader className="border-b">
//         <CardTitle className="flex items-center gap-2">
//           <Wallet className="h-5 w-5" />
//           Transfer
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-6">
//         <div className="flex flex-col gap-6">
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex flex-col">
//               <span className="text-sm text-muted-foreground">From</span>
//               <span className="font-medium">{account ? formatAddress(account) : 'Your wallet'}</span>
//             </div>
//             <ArrowRight className="h-4 w-4 text-muted-foreground" />
//             <div className="flex flex-col items-end">
//               <span className="text-sm text-muted-foreground">To</span>
//               <span className="font-medium">{formatAddress(data.walletAddress)}</span>
//             </div>
//           </div>

//           <div className="flex flex-col gap-1">
//             <span className="text-sm text-muted-foreground">Amount</span>
//             <span className="font-medium">
//               {data.amount} {data.tokenAddress.toUpperCase() === 'ETH' ? 'ETH' : 'Tokens'}
//             </span>
//           </div>

//           {error && (
//             <div className="text-sm text-destructive">
//               {error}
//             </div>
//           )}

//           {
//             hash && (
//               <div className="text-sm text-green-500">
//                 <p>Transfer Successful!</p>
//               </div>
//             )
//           }

//           {hash ? (
//             <Button onClick={() => window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank')} className="w-full">
//               <p>View on BaseScan</p>
//             </Button>
//           ) : (
//             <Button 
//               onClick={handleTransfer} 
//               disabled={isLoading}
//               className="w-full"
//           >
//             {isLoading ? 'Confirming...' : 'Confirm Transfer'}
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//     </>
//   );
// }
