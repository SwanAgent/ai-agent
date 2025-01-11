import { z } from "zod";
import { resolveAddress, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

export const resolveBasenamesSchema = z.object({
    basename: z.string(),
});

export type ResolveBasenamesParams = z.infer<typeof resolveBasenamesSchema>;

export type ResolveBasenamesResult = {
    success: boolean;
    data?: {
        address: string;
    };
    error?: string;
}

export const resolveBasenames = {
    description: 'Resolve the basename to the token address. Base name is in format of "example.base.eth".',
    parameters: resolveBasenamesSchema,
    execute: async ({ basename }: ResolveBasenamesParams): Promise<ResolveBasenamesResult> => {
        try {
            const client = createThirdwebClient({
                clientId: process.env.THIRDWEB_CLIENT_ID,
                secretKey: process.env.THIRDWEB_SECRET_KEY || '',
            });

            const address = await resolveAddress({
                client,
                name: basename,
                resolverAddress: BASENAME_RESOLVER_ADDRESS,
                resolverChain: base,
              });
              
            if (!address) {
                return {
                    success: false,
                    error: 'Failed to resolve basename for ' + basename,
                };
            }

            return {
                success: true,
                data: {
                    address,
                },
            };  
        } catch (error) {
            console.error('Failed to resolve basename for ' + basename, error);
            return {
                success: false,
                error: 'Failed to resolve basename',
            };
        }
    }
}