// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, Wallet } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { ethers, TransactionResponse } from 'ethers';
// import { ActionComponentProps } from '@/types/actions';
// import { TransferResponse } from '@/lib/ai/actions/transfer';
// import { Skeleton } from '../ui/skeleton';
// import { useTransaction } from '@/hooks/use-transaction';
// import { TransactionStatus } from '../transaction-status';

// type TransferProps = ActionComponentProps<TransferResponse> & {
//   msgToolId: string;
// }

// const formatAddress = (address: string) => {
//   if (!address) return '';
//   if (address.length < 10) return address;
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };

// const ERC20_ABI = [
//   'function transfer(address to, uint256 amount) returns (bool)',
//   'function decimals() view returns (uint8)',
// ];

// export function Transfer({ result, isLoading: isPageLoading, className, msgToolId }: TransferProps) {
//   if (isPageLoading) {
//     return <div className="flex flex-col">
//       <Skeleton className="w-full h-56" />
//     </div>;
//   }

//   const { data, error: toolError } = result ?? {};
//   if (!data || toolError) return <div>Error fetching transfer details.</div>

//   const { walletAddress, amount, tokenToSend } = data;

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { wallets } = useWallets();
//   const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(msgToolId, "TRANSFER");

//   useEffect(() => {
//     if (!transaction) {
//     }
//   }, [transaction, msgToolId, amount, tokenToSend, walletAddress]);

//   const handleTransfer = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const provider = await wallets[0].getEthereumProvider();
//       const ethersProvider = new ethers.BrowserProvider(provider);
//       const signer = await ethersProvider.getSigner();

//       await createTransaction({
//         type: "TRANSFER",
//         title: `Transferring ${amount} ${tokenToSend.symbol.toUpperCase()}`,
//         metadata: {
//           amount,
//           tokenAddress: tokenToSend.address,
//           tokenSymbol: tokenToSend.symbol,
//           recipient: walletAddress,
//         }
//       })

//       let tx: TransactionResponse;
//       if (tokenToSend.address.toUpperCase() === 'ETH') {
//         const transactionRequest = {
//           to: walletAddress,
//           value: ethers.parseEther(amount),
//         };
//         tx = await signer.sendTransaction(transactionRequest);
//       } else {
//         const tokenContract = new ethers.Contract(
//           tokenToSend.address,
//           ERC20_ABI,
//           signer
//         );
        
//         const amountToSend = ethers.parseUnits(amount, tokenToSend.decimals);
//         tx = await tokenContract.transfer(walletAddress, amountToSend);
//       }

//       await updateTransaction({
//         hash: tx.hash,
//         status: "SUBMITTED"
//       });

//       const receipt = await tx.wait();
//       if (receipt?.status === 1) {
//         await updateTransaction({
//           title: "Transferred " + amount + " " + tokenToSend.symbol.toUpperCase(),
//           status: "SUCCESS"
//         });
//       } else {
//         await updateTransaction({
//           status: "FAILED"
//         });
//       }

//     } catch (err: any) {
//       setError(err.message || 'Failed to process transfer');
//       await updateTransaction({
//         status: "FAILED",
//       });
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (transaction) {
//     return <TransactionStatus 
//       transaction={transaction} 
//       isLoading={isTransactionLoading}
//     />;
//   }

//   return (
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
//               <span className="font-medium">{ wallets[0] ? formatAddress(wallets[0].address) : 'Your wallet'}</span>
//             </div>
//             <ArrowRight className="h-4 w-4 text-muted-foreground" />
//             <div className="flex flex-col items-end">
//               <span className="text-sm text-muted-foreground">To</span>
//               <span className="font-medium">{formatAddress(data?.walletAddress ?? "")}</span>
//             </div>
//           </div>

//           <div className="flex flex-col gap-1">
//             <span className="text-sm text-muted-foreground">Amount</span>
//             <span className="font-medium">
//               {amount} {tokenToSend.symbol.toUpperCase()}
//             </span>
//           </div>

//           {error && (
//             <div className="text-sm text-destructive">
//               {error}
//             </div>
//           )}

//           <Button 
//             onClick={handleTransfer} 
//             disabled={isLoading}
//             className="w-full"
//           >
//             {isLoading ? 'Confirming...' : 'Confirm Transfer'}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
