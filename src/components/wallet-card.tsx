"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyable-text";
import { Label } from "@/components/ui/label";
import { EmbeddedWallet } from "@/types/db";
import { Skeleton } from "./ui/skeleton";
import { getWalletCoins } from "@/server/actions/block-vision";
import { SUI_TYPE_ARG } from "@/constant";
import { fromSmall } from "@/utils/token-converter";
import { formatNumber } from "@/utils/format";

interface WalletCardProps {
    wallet: EmbeddedWallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [suiBalance, setSuiBalance] = useState<string>();

    useEffect(() => {
        if (!wallet) return;
        async function fetchBalance() {
            const data = await getWalletCoins({
                walletAddress: wallet.publicKey,
            });
            const suiCoin = data?.data?.data?.coins.find(
                (coin) => coin.coinType === SUI_TYPE_ARG
            );
            const balance = fromSmall(
                suiCoin?.balance ?? "0",
                suiCoin?.decimals ?? 9
            );
            setSuiBalance(balance);
        }
        fetchBalance();
    }, [wallet]);

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
                            {!suiBalance ? (
                                <Skeleton className="h-9 w-32" />
                            ) : (
                                <>
                                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                                        {formatNumber(
                                            Number(suiBalance).toFixed(3),
                                            "number"
                                        )}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        SUI
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Public Key Section */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-normal text-muted-foreground">
                            Public Key
                        </Label>
                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                            <CopyableText
                                text={wallet?.publicKey || ""}
                                showExplorer
                            />
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <Button
                            className="w-full sm:w-auto"
                            // onClick={handleFundWallet}
                            disabled={isLoading}
                        >
                            <Banknote className="mr-2 h-4 w-4" />
                            Fund
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}