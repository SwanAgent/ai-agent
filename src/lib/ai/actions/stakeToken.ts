import { z } from 'zod';
import { ActionResponse } from '@/types/actions';
import { DEFAULT_TOKEN_IN_SYMBOL, DEFAULT_TOKEN_OUT_SYMBOL } from '@/hooks/use-spring-sui-lst';

enum LstId {
    sSUI = "sSUI",
    mSUI = "mSUI",
    fudSUI = "fudSUI",
    kSUI = "kSUI",
    trevinSUI = "trevinSUI",
    upSUI = "upSUI",
}

export const stakeSchema = z.object({
    amount: z.number(),
    fromToken: z.union([z.enum(['SUI']), z.nativeEnum(LstId)]),
    toToken: z.union([z.enum(['SUI']), z.nativeEnum(LstId)]),
    depositToSuiLend: z.boolean().optional().default(false),
});

export type StakeTokenSchema = z.infer<typeof stakeSchema>;
export type StakeTokenResponse = ActionResponse<{
    amount: string;
    slug: string;
    depositToSuiLend: boolean;
}>;

export const stakeToken = {
    description: `Liquid stake SUI to earn staking rewards, or convert between different liquid staking tokens (LSTs).
    
Supported tokens: SUI and ${Object.values(LstId).join(', ')}

You can:
- Stake SUI to receive LSTs (e.g., SUI → sSUI)
- UnStake LSTs back to SUI (e.g., sSUI → SUI)
- Convert between different LSTs (e.g., sSUI → fudSUI)
- Optionally deposit LSTs into SuiLend to earn additional lending yield`,
    parameters: stakeSchema,
    execute: async ({ amount, fromToken, toToken, depositToSuiLend }: StakeTokenSchema): Promise<StakeTokenResponse> => {
        try {
            let slug = `${fromToken}-${toToken}`;
            const isSlugValid = (slug: string) => {
                if (slug === undefined) return false;

                const symbols = slug.split("-");
                if (
                    symbols.length !== 2 ||
                    symbols.includes("") ||
                    symbols[0] === symbols[1]
                )
                    return false;

                const validSymbols = ["SUI", ...Object.values(LstId)];
                if (
                    !validSymbols.includes(symbols[0]) ||
                    !validSymbols.includes(symbols[1])
                )
                    return false;

                return true;
            };

            // Validate conversion path
            if (!isSlugValid(slug)) {
                slug = `${DEFAULT_TOKEN_IN_SYMBOL}-${DEFAULT_TOKEN_OUT_SYMBOL}`;
            }

            return {
                success: true,
                signTransaction: true,
                data: {
                    amount: amount.toString(),
                    slug,
                    depositToSuiLend: depositToSuiLend || false,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: "Failed to process token conversion",
            };
        }
    },
};