"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyable-text";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { XLogo } from "@phosphor-icons/react";

import { LoadingStateSkeleton } from "./loading-skeleton";
import { formatPrivyId, formatUserCreationDate } from "@/utils/format";
import { WalletCard } from "@/components/wallet-card";
import { EmbeddedWallet } from "@/types/db";
import { useRouter } from "next/navigation";
import { getTwitterAccess, removeTwitterAccess } from "@/server/actions/user";

export function AccountContent() {
    const { isLoading: isUserLoading, user } = useUser();

    if (isUserLoading || !user) {
        return <LoadingStateSkeleton />;
    }

    const userData = {
        privyId: user?.id,
        walletAddress: user?.address,
        createdAt: formatUserCreationDate(user?.createdAt?.toString()),
    };

    const legacyWallets = user.wallets;

    const avatarLabel = user.id.substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-1 flex-col py-8 w-full">
            <div className="max-w-3xl space-y-6">
                {/* Profile Information Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Profile Information
                    </h2>

                    <Card className="bg-sidebar">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* User basic information */}
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <WalletIcon className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Wallet Connected
                                        </p>

                                        <p className="text-sm font-medium">
                                            {userData.walletAddress}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-sidebar-accent/50" />

                                {/* Contact information */}
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Account ID
                                        </Label>
                                        <div className="mt-1">
                                            <CopyableText
                                                text={formatPrivyId(
                                                    userData.privyId
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Joined
                                        </Label>
                                        <div className="mt-1 flex h-8 items-center">
                                            <span
                                                className={cn(
                                                    "text-sm font-medium"
                                                )}
                                            >
                                                {userData.createdAt}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Embedded Wallet Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Embedded Wallet
                    </h2>
                    {legacyWallets.map((wallet: EmbeddedWallet) => (
                        <WalletCard key={wallet.id} wallet={wallet} />
                    ))}
                </section>

                {/* New Integrations Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Integrations
                    </h2>
                    <Card className="bg-sidebar">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* X Integration */}
                                <XIntegration />
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

const XIntegration = () => {
    const [isLinking, setIsLinking] = useState(false);
    const router = useRouter();
    const [twitterUsername, setTwitterUsername] = useState<string | null>();

    useEffect(() => {
        const twitterCheck = async () => {
            setIsLinking(true);
            const result = await getTwitterAccess();
            if (result?.data?.success && result?.data?.data) {
                setTwitterUsername(result.data.data.username);
            }
            setIsLinking(false);
        };
        twitterCheck();
    }, []);

    const handleXLink = async () => {
        setIsLinking(true);
        try {
            // TODO: Implement X auth flow
            if (!twitterUsername) {
                router.push("/api/twitter/login");
            } else {
                window.open(`https://x.com/${twitterUsername}`);
            }
        } catch (error) {
            console.error("Error linking X account:", error);
        } finally {
            setIsLinking(false);
        }
    };

    /**
     * removes twitter key info for user from DB
     */
    const handleRemoveTwitter = useCallback(async () => {
        try {
            const result = await removeTwitterAccess();
            if (result?.data?.success) {
                setTwitterUsername(null);
            } else {
                console.error(
                    "Failed to remove twitter connection:",
                    result?.data?.error
                );
            }
        } catch (error) {
            console.error("Failed to remove twitter connection", error);
        }
    }, []);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <XLogo size={20} className="text-primary-foreground" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">X ( Twitter )</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Allow your agent to post on X
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                {twitterUsername && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveTwitter}
                        disabled={isLinking}
                    >
                        Unlink
                    </Button>
                )}
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleXLink}
                    disabled={isLinking}
                >
                    {isLinking ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                    ) : twitterUsername ? (
                        `@${twitterUsername}`
                    ) : (
                        "Link"
                    )}
                </Button>
            </div>
        </div>
    );
};