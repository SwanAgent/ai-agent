"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrismaUser } from "@/types/db";
import { useNearWallet } from "@/contexts/near-wallet";
import { connect, utils } from "near-api-js";

export default function WalletDelegate({ children, user }: { children: React.ReactNode, user: PrismaUser | undefined }) {
    const publicKey = user?.wallets[0]?.publicKey;
    const { accounts, wallet } = useNearWallet();
    const account = accounts[0];

    async function handleDelegationToggle() {
        try {
            if (!account || !publicKey || !wallet) {
                throw new Error("Account or public key not found");
            }
            // const nearConnection = await connect();
            // const account = nearConnection.account(account.accountId);

            // // Generate a new sub account ID based on user's ID
            // const newSubAccountId = `p.${account.accountId}`;

            // // Create the sub account using the createAccount method
            // // Create the sub account using createAccount action
            // const createSubAccountResult = await wallet.signAndSendTransaction({
            //     receiverId: account.accountId,
            //     actions: [
            //         {
            //             type: 'CreateAccount',
            //             params: {
            //                 beneficiaryId: newSubAccountId,
            //                 newPublicKey: publicKey,
            //             }
            //         },
            //         {
            //             type: 'Transfer',
            //             params: {
            //                 deposit: utils.format.parseNearAmount("0.1") || "0"
            //             }
            //         },
            //         {
            //             type: 'AddKey',
            //             params: {
            //                 publicKey: publicKey,
            //                 accessKey: {
            //                     permission: 'FullAccess'
            //                 }
            //             }
            //         }
            //     ],
            // });

            // console.log("Sub account created:", createSubAccountResult);

            // TODO: Update user's accountCreated status in your backend
        } catch (error) {
            console.error("Error creating sub account:", error);
        }
    }

    if (user && !user.accountCreated) {
        return (
            <div className="relative">
                {children}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className='bg-secondary rounded-lg p-8 w-[480px]'>
                        <CardContent className="flex p-0 items-start gap-1">
                            <div className="flex flex-col">
                                <div className="text-base text-primary mb-2">Create Your Swan Account</div>
                                <div className="text-sm text-muted-foreground mb-4">To get started with Swan, we need to create a secure wallet for your account. This wallet will be used to manage your transactions and assets.</div>
                                <Button variant="default" className="w-fit" onClick={handleDelegationToggle}>Create Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return <div>{children}</div>;
}