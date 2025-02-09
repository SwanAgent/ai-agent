import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useMemo,
} from "react";

import { CoinMetadata } from "@mysten/sui/client";
import BigNumber from "bignumber.js";
import { SpringSuiData } from "@/types/spring-sui";
import useFetchSpringSuiData from "@/hooks/use-spring-sui-data";
import useFetchBalances from "@/hooks/use-fetch-balances";
import { NORMALIZED_LST_COINTYPES } from "@suilend/springsui-sdk";
import { NORMALIZED_SUI_COINTYPE } from "@/lib/coin-type";
import useCoinMetadataMap from "@/hooks/use-coin-metadata-map";
import useRefreshOnBalancesChange from "@/hooks/use-refresh-on-balance-change";
import { useUser } from "@/hooks/use-user";

interface SpringSuiContext {
    appData: SpringSuiData | undefined;
    balancesCoinMetadataMap: Record<string, CoinMetadata> | undefined;
    getBalance: (coinType: string) => BigNumber;
    refresh: () => Promise<void>;
}

type LoadedSpringSuiContext = SpringSuiContext & {
    appData: SpringSuiData;
};

const SpringSuiContext = createContext<SpringSuiContext>({
    appData: undefined,
    balancesCoinMetadataMap: undefined,
    getBalance: () => {
        throw Error("AppContextProvider not initialized");
    },
    refresh: async () => {
        throw Error("AppContextProvider not initialized");
    },
});

export const useSpringSuiContext = () => useContext(SpringSuiContext);
export const useLoadedSpringSuiContext = () => useSpringSuiContext() as LoadedSpringSuiContext;

export function SpringSuiContextProvider({ children }: PropsWithChildren) {
    const { user } = useUser();
    const address = user?.wallets[0]?.publicKey;

    // App data
    const { data: appData, mutateData: mutateAppData } = useFetchSpringSuiData();

    // Balances
    const { data: rawBalancesMap, mutateData: mutateRawBalancesMap } =
        useFetchBalances({ address });

    const balancesCoinTypes = useMemo(
        () => [NORMALIZED_SUI_COINTYPE, ...NORMALIZED_LST_COINTYPES],
        [],
    );
    const balancesCoinMetadataMap = useCoinMetadataMap(balancesCoinTypes);

    const getBalance = useCallback(
        (coinType: string) => {
            if (rawBalancesMap?.[coinType] === undefined) return new BigNumber(0);

            const coinMetadata = balancesCoinMetadataMap?.[coinType];
            if (!coinMetadata) return new BigNumber(0);

            return new BigNumber(rawBalancesMap[coinType]).div(
                10 ** coinMetadata.decimals,
            );
        },
        [rawBalancesMap, balancesCoinMetadataMap],
    );

    // Refresh
    const refresh = useCallback(async () => {
        await mutateAppData();
        await mutateRawBalancesMap();
    }, [mutateAppData, mutateRawBalancesMap]);

    useRefreshOnBalancesChange(refresh, address);

    // Context
    const contextValue: SpringSuiContext = useMemo(
        () => ({
            appData,
            balancesCoinMetadataMap,
            getBalance,
            refresh,
        }),
        [appData, balancesCoinMetadataMap, getBalance, refresh],
    );

    return (
        <SpringSuiContext.Provider value= { contextValue } > { children } </SpringSuiContext.Provider>
    );
}
