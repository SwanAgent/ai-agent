import {
  useCallback,
  useMemo,
} from "react";

import { LstId } from "@suilend/springsui-sdk";

export enum Mode {
  STAKING = "staking",
  UNSTAKING = "unstaking",
  CONVERTING = "converting",
}

export const DEFAULT_TOKEN_IN_SYMBOL = "SUI";
export const DEFAULT_TOKEN_OUT_SYMBOL = LstId.sSUI;

export enum QueryParams {
  LST = "lst",
  AMOUNT = "amount",
}

export interface SpringSuiLst {
  isSlugValid: () => boolean;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  mode: Mode;
  lstIds: LstId[];
}

export function useSpringSuiLst({ slug }: { slug: string }) {
  const isSlugValid = useCallback(() => {
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
  }, [slug]);

  const [tokenInSymbol, tokenOutSymbol] = useMemo(
    () =>
      isSlugValid()
        ? slug.split("-")
        : [
          DEFAULT_TOKEN_IN_SYMBOL,
          DEFAULT_TOKEN_OUT_SYMBOL,
        ],
    [isSlugValid, slug]
  );

  // Mode
  const mode = useMemo(() => {
    if (
      tokenInSymbol === "SUI" &&
      Object.values(LstId).includes(tokenOutSymbol as LstId)
    )
      return Mode.STAKING;
    else if (
      Object.values(LstId).includes(tokenInSymbol as LstId) &&
      tokenOutSymbol === "SUI"
    )
      return Mode.UNSTAKING;
    else if (
      Object.values(LstId).includes(tokenInSymbol as LstId) &&
      Object.values(LstId).includes(tokenOutSymbol as LstId)
    )
      return Mode.CONVERTING;

    return Mode.STAKING; // Not possible
  }, [tokenInSymbol, tokenOutSymbol]);

  // Lsts
  const lstIds = useMemo(() => {
    if (mode === Mode.STAKING) return [tokenOutSymbol as LstId];
    if (mode === Mode.UNSTAKING) return [tokenInSymbol as LstId];
    if (mode === Mode.CONVERTING)
      return [tokenInSymbol as LstId, tokenOutSymbol as LstId];

    return [];
  }, [mode, tokenOutSymbol, tokenInSymbol]);

  // Context
  const data: SpringSuiLst = useMemo(
    () => ({
      isSlugValid,
      tokenInSymbol,
      tokenOutSymbol,
      mode,
      lstIds,
    }),
    [isSlugValid, tokenInSymbol, tokenOutSymbol, mode, lstIds]
  );

  return data;
}
