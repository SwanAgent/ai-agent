import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { getOrCreateUser } from "@/server/actions/user";
import { authenticateSignedMessage } from "./siwn";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Near",
            credentials: {
                accountId: {
                    label: "Account ID",
                    type: "text",
                    placeholder: "0x0",
                },
                publicKey: {
                    label: "Public Key",
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
                    if (!credentials?.accountId || !credentials?.publicKey || !credentials?.signature || !credentials?.message) {
                        return null;
                    }

                    const { accountId, publicKey, signature, message } = credentials

                    const token = await getCsrfToken({ req: { headers: req.headers } });
                    const encoder = new TextEncoder();
                    const csrfBytes = encoder.encode(token);
                    const nonce = new Uint8Array(32);
                    nonce.set(csrfBytes.slice(0, 32)); // Ensure 32 byte length
        
                    const verifyResult = await authenticateSignedMessage(
                        {
                            accountId,
                            publicKey,
                            signature,
                            message,
                            recipient: "http://localhost:3000",
                            nonce
                        }
                    );

                    if (!verifyResult) {
                        return null;
                    }

                    const user = await getOrCreateUser({ address: accountId });
                    const userId = user?.data?.data?.id;

                    if (!userId) {
                        return null;
                    }

                    return {
                        id: userId,
                        address: accountId,
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
