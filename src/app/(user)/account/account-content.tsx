"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyable-text";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

import { LoadingStateSkeleton } from "./loading-skeleton";
import { formatPrivyId, formatUserCreationDate } from "@/utils/format";
import { WalletCard } from "@/components/wallet-card";
import { EmbeddedWallet } from "@/types/db";

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
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage
                      src={avatarLabel}
                      className="rounded-lg bg-sidebar-accent"
                    />
                    <AvatarFallback className="rounded-lg bg-sidebar-accent">
                      {avatarLabel}
                    </AvatarFallback>
                  </Avatar>
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
      </div>
    </div>
  );
}