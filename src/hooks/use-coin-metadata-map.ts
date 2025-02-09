import { useEffect, useRef, useState } from "react";

import { CoinMetadata } from "@mysten/sui/client";

import { suiClient } from "@/lib/clients/sui-client";
import { getCoinMetadataMap } from "@/lib/coin-metadata";

const useCoinMetadataMap = (coinTypes: string[]) => {
  const coinTypesBeingFetchedRef = useRef<string[]>([]);
  const [coinMetadataMap, setCoinMetadataMap] = useState<
    Record<string, CoinMetadata> | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      const filteredCoinTypes = Array.from(new Set(coinTypes)).filter(
        (coinType) => !coinTypesBeingFetchedRef.current.includes(coinType),
      );
      if (filteredCoinTypes.length === 0) return;

      coinTypesBeingFetchedRef.current.push(...filteredCoinTypes);

      const _coinMetadataMap = await getCoinMetadataMap(
        suiClient as any,
        filteredCoinTypes,
      );
      setCoinMetadataMap((prev) => ({
        ...(prev ?? {}),
        ..._coinMetadataMap,
      }));
    })();
  }, [coinTypes, suiClient]);

  return coinMetadataMap;
};

export default useCoinMetadataMap;
