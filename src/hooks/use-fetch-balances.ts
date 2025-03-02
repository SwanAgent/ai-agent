import { suiClient } from "@/lib/clients/sui-client";
import { normalizeStructTag } from "@mysten/sui/utils";
import BigNumber from "bignumber.js";
import { toast } from "sonner";
import useSWR from "swr";

export default function useFetchBalances({ address }: { address?: string }) {
  const dataFetcher = async () => {
    const balancesMap: Record<string, BigNumber> = {};

    if (!address) return balancesMap;

    const rawBalances = (
      await suiClient.getAllBalances({
          owner: address,
        })
      )
        .map((cb) => ({ ...cb, coinType: normalizeStructTag(cb.coinType) }))
        .sort((a, b) => (a.coinType < b.coinType ? -1 : 1));

      for (const rawBalance of rawBalances) {
        const totalBalance = new BigNumber(rawBalance.totalBalance);
      if (totalBalance.gt(0)) balancesMap[rawBalance.coinType] = totalBalance;
    }

    return balancesMap;
  };

  const { data, mutate } = useSWR<Record<string, BigNumber>>(
    `balances-${address}`,
    dataFetcher,
    {
      refreshInterval: 30 * 1000,
      dedupingInterval: 30 * 1000,
      onSuccess: (data) => {
        // console.log("Refreshed wallet balances", data);
      },
      onError: (err) => {
        // toast.error("Failed to refresh wallet balances");
        console.error(err);
      },
    },
  );

  return { data, mutateData: mutate };
}
