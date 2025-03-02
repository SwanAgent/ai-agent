"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyable-text";
import { Label } from "@/components/ui/label";
import { EmbeddedWallet } from "@/types/db";
import { Skeleton } from "./ui/skeleton";
import { formatNumber } from "@/utils/format";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PortfolioView } from "@/components/actions/portfolio-view";
import { useUser } from "@/hooks/use-user";
import { useNearWallet } from "@/contexts/near-wallet";

// Define the NEAR token symbol
const NEAR_TOKEN_SYMBOL = "NEAR";

interface WalletCardProps {
    wallet: EmbeddedWallet;
}

interface NearAccountView {
    amount: string;
    block_hash: string;
    block_height: number;
    code_hash: string;
    locked: string;
    storage_usage: number;
}

export function WalletCard({ wallet }: WalletCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [nearBalance, setNearBalance] = useState<string>();
    const [showPortfolio, setShowPortfolio] = useState(false);
    const { user } = useUser();
    const { accountId, getProvider } = useNearWallet();
    const address = user?.wallets[0]?.publicKey;

    const [portfolio, setPortfolio] = useState<any>();

    useEffect(() => {
        if (portfolio) return;

        async function fetchPortfolio() {
            if (!accountId) return;
            
            try {
                // For NEAR, we'll just use the balance as the portfolio for now
                // In a real implementation, you might want to fetch all tokens owned by the account
                const balance = await fetchNearBalance(accountId);
                
                if (balance) {
                    setPortfolio({
                        coins: [
                            {
                                coinType: "NEAR",
                                symbol: "NEAR",
                                name: "NEAR Protocol",
                                balance: balance,
                                decimals: 24,
                                usdPrice: "0", // You would need to fetch this from an API
                                usdValue: "0", // You would need to calculate this
                            }
                        ],
                        usdValue: "0", // You would need to calculate this
                    });
                }
            } catch (error) {
                console.error("Error fetching portfolio:", error);
            }
        }

        fetchPortfolio();
    }, [accountId, portfolio]);

    useEffect(() => {
        if (!wallet || !accountId) return;
        
        async function fetchBalance() {
            try {
                if (accountId) {
                    const balance = await fetchNearBalance(accountId);
                    setNearBalance(balance);
                }
            } catch (error) {
                console.error("Error fetching NEAR balance:", error);
            }
        }
        
        fetchBalance();
    }, [wallet, accountId]);

    // Helper function to fetch NEAR balance
    async function fetchNearBalance(accountId: string): Promise<string> {
        const provider = getProvider();
        if (!provider) return "0";
        
        try {
            const account = await provider.query<NearAccountView>({
                request_type: "view_account",
                account_id: accountId,
                finality: "final",
            });
            
            // Convert yoctoNEAR (10^-24) to NEAR
            const balanceInYocto = account.amount || "0";
            const balanceInNear = (Number(balanceInYocto) / 10**24).toFixed(5);
            return balanceInNear;
        } catch (error) {
            console.error("Error fetching NEAR balance:", error);
            return "0";
        }
    }

    return (
        <>
            <Card className="relative overflow-hidden">
                <CardContent className="space-y-4 p-6">
                    {/* Balance Section */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-normal text-muted-foreground">
                                Available Balance
                            </Label>
                            <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Active
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                            {!nearBalance ? (
                                <Skeleton className="h-9 w-32" />
                            ) : (
                                <>
                                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                                        {formatNumber(
                                            Number(nearBalance).toFixed(3),
                                            "number"
                                        )}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {NEAR_TOKEN_SYMBOL}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Account ID Section */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-normal text-muted-foreground">
                            Account ID
                        </Label>
                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                            <CopyableText
                                text={accountId || wallet?.publicKey || ""}
                                showExplorer
                            />
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <Popover open={showPortfolio} onOpenChange={setShowPortfolio}>
                            <PopoverTrigger asChild>
                                <Button
                                    className="w-full sm:w-auto"
                                    disabled={isLoading}
                                >
                                    <Banknote className="mr-2 h-4 w-4" />
                                    Portfolio
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 m-0 mb-3" align="start">
                                <PortfolioView
                                    result={{
                                        toolResult: {
                                            success: true,
                                            data: {
                                                coins: portfolio?.coins ?? [],
                                                usdValue: portfolio?.usdValue ?? "0",
                                            },
                                        },
                                        isLoading: !portfolio,
                                    }} msgToolId={""} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}