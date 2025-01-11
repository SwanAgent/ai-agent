import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { getOrCreateUser } from "@/server/actions/user";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Ethereum",
            credentials: {
                address: {
                    label: "Address",
                    type: "text",
                    placeholder: "0x0",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                    placeholder: "0x0",
                },
                message: {
                    label: "Message",
                    type: "text",
                    placeholder: "0x0",
                },
            },
            async authorize(credentials, req) {
                try {
                    if (!credentials?.address || !credentials?.signature || !credentials?.message) {
                        return null;
                    }

                    const { address, signature, message } = credentials

                    const token = await getCsrfToken({ req: { headers: req.headers } });
                    const encodedMessage = new TextEncoder().encode(JSON.stringify({ message, nonce: token }));

                    const verifyResult = await verifyPersonalMessageSignature(
                        encodedMessage,
                        signature,
                        {
                            address: address,
                        }
                    );
                    
                    if (!verifyResult.verifyAddress(address)) {
                        return null;
                    }

                    const user = await getOrCreateUser({ address });
                    const userId = user?.data?.data?.id;

                    if (!userId) {
                        return null;
                    }

                    return {
                        id: userId,
                        address: address,
                    };
                } catch (e) {
                    console.log("auth error", e);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.address = user.address;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.address = token.address;
            }
            return session;
        },
    },
};
