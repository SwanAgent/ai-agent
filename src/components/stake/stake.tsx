"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import {
  SUI_GAS_MIN,
  Token,
  formatInteger,
  formatPercent,
  formatPoints,
  formatToken,
  getBalanceChange,
} from "@suilend/frontend-sui";
import {
  ParsedObligation,
  createObligationIfNoneExists,
  initializeSuilend,
  sendObligationToUser,
} from "@suilend/sdk";
import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import {
  LstId,
  convertLsts,
  convertLstsAndSendToUser,
} from "@suilend/springsui-sdk";

import { Card } from "@/components/ui/card";

import StakeInput from "@/components/stake/stake-input";

import SubmitButton, { SubmitButtonState } from "@/components/submit-button";

import { useLoadedSpringSuiContext } from "@/contexts/spring-sui";
import { Mode, useSpringSuiLst } from "@/hooks/use-spring-sui-lst";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { suiClient } from "@/lib/clients/sui-client";
import { useUser } from "@/hooks/use-user";
import { executeTransaction } from "@/server/wallet";
import { StakeTokenResponse } from "@/lib/ai/actions/stakeToken";
import { ActionComponentProps } from "@/types/actions";
import { StakeSkeleton } from "../skeleton/stake";
import { useTransaction } from "@/hooks/use-transaction";
import { TransactionStatus } from "../transaction-status";

const getUrl = (tokenInSymbol: string, tokenOutSymbol: string) =>
  `${tokenInSymbol}-${tokenOutSymbol}`;

enum TokenDirection {
  IN = "in",
  OUT = "out",
}

type StakeProps = ActionComponentProps<StakeTokenResponse>;

export default function Stake({
  result, msgToolId
}: StakeProps) {
  const { appData } = useLoadedSpringSuiContext();
  const { isLoading } = result ?? {};
  return (
    <div className="flex flex-col items-center justify-center">
      {(!appData || isLoading) ? <StakeSkeleton /> : <StakeMain result={result} msgToolId={msgToolId} />}
    </div>
  );
}

function StakeMain({
  result, msgToolId
}: StakeProps) {
  const { toolResult } = result ?? {};

  const [slug, setSlug] = useState(toolResult?.data?.slug ?? '');
  const [inValue, setInValue] = useState<string>(toolResult?.data?.amount ?? '');
  const { user } = useUser();
  const address = user?.wallets[0]?.publicKey;

  const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(msgToolId, "SWAP");

  const { appData, getBalance, refresh } = useLoadedSpringSuiContext();
  const { tokenInSymbol, tokenOutSymbol, mode, lstIds } = useSpringSuiLst({
    slug,
  });
  const suiBalance = getBalance(appData.suiToken.coinType);
  const [digest, setDigest] = useState<string | null>(null);

  // Ref
  const inInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inInputRef.current?.focus();
  }, []);

  const reverseTokens = useCallback(() => {
    const slug = getUrl(tokenOutSymbol, tokenInSymbol);
    setSlug(slug);
  }, [tokenOutSymbol, tokenInSymbol]);

  const onTokenChange = useCallback(
    (token: Token, direction: TokenDirection) => {
      if (
        token.symbol ===
        (direction === TokenDirection.IN
          ? tokenOutSymbol
          : tokenInSymbol)
      )
        reverseTokens();
      else {
        const slug = getUrl(
          direction === TokenDirection.IN
            ? token.symbol
            : tokenInSymbol,
          direction === TokenDirection.IN
            ? tokenOutSymbol
            : token.symbol
        );
        setSlug(slug);
      }

      inInputRef.current?.focus();
    },
    [tokenOutSymbol, tokenInSymbol, reverseTokens]
  );

  // Mode
  const isStaking = useMemo(() => mode === Mode.STAKING, [mode]);
  const isUnstaking = useMemo(() => mode === Mode.UNSTAKING, [mode]);
  const isConverting = useMemo(() => mode === Mode.CONVERTING, [mode]);

  // In
  const inLstData = useMemo(
    () =>
      isStaking ? undefined : appData.lstDataMap[tokenInSymbol as LstId],
    [isStaking, appData.lstDataMap, tokenInSymbol]
  );
  const inLstClient = useMemo(
    () =>
      isStaking
        ? undefined
        : appData.lstClientMap[tokenInSymbol as LstId],
    [isStaking, appData.lstClientMap, tokenInSymbol]
  );

  const inToken = isStaking ? appData.suiToken : inLstData!.token;
  const inPrice = isStaking ? appData.suiPrice : inLstData!.price;
  const inBalance = getBalance(inToken.coinType);

  const inValueUsd = new BigNumber(BigNumber.max(0, inValue || 0)).times(
    inPrice
  );

  const formatAndSetInValue = useCallback(
    (_value: string) => {
      let formattedValue;
      if (new BigNumber(_value || 0).lt(0)) formattedValue = _value;
      else if (!_value.includes(".")) formattedValue = _value;
      else {
        const [integers, decimals] = _value.split(".");
        const integersFormatted = formatInteger(
          integers !== "" ? parseInt(integers) : 0,
          false
        );
        const decimalsFormatted = decimals.slice(
          0,
          Math.min(decimals.length, inToken.decimals)
        );
        formattedValue = `${integersFormatted}.${decimalsFormatted}`;
      }

      setInValue(formattedValue);
    },
    [inToken.decimals]
  );

  const onInBalanceClick = () => {
    formatAndSetInValue(
      (isStaking
        ? BigNumber.max(0, inBalance.minus(1))
        : inBalance
      ).toFixed(inToken.decimals, BigNumber.ROUND_DOWN)
    );
    inInputRef.current?.focus();
  };

  // Out
  const outLstData = useMemo(
    () =>
      isUnstaking
        ? undefined
        : appData.lstDataMap[tokenOutSymbol as LstId],
    [isUnstaking, appData.lstDataMap, tokenOutSymbol]
  );
  const outLstClient = useMemo(
    () =>
      isUnstaking
        ? undefined
        : appData.lstClientMap[tokenOutSymbol as LstId],
    [isUnstaking, appData.lstClientMap, tokenOutSymbol]
  );

  const outToken = isUnstaking ? appData.suiToken : outLstData!.token;
  const outPrice = isUnstaking ? appData.suiPrice : outLstData!.price;
  const outBalance = getBalance(outToken.coinType);

  const outValue = useMemo(() => {
    if (inValue === "") return "";

    const getFee = (amount: BigNumber) => {
      if (isStaking) {
        const suiAmount = amount;
        return suiAmount
          .times(outLstData!.mintFeePercent.div(100))
          .decimalPlaces(inToken.decimals, BigNumber.ROUND_UP);
      }
      if (isUnstaking) {
        const lstAmount = amount;
        return lstAmount
          .times(inLstData!.redeemFeePercent.div(100))
          .decimalPlaces(inToken.decimals, BigNumber.ROUND_UP);
      }
      if (isConverting) {
        const inLstAmount = amount;
        const unstakingFee = inLstAmount
          .times(inLstData!.redeemFeePercent.div(100))
          .decimalPlaces(inToken.decimals, BigNumber.ROUND_UP);

        const suiAmount = inLstAmount.minus(unstakingFee);
        const stakingFee = suiAmount
          .times(outLstData!.mintFeePercent.div(100))
          .decimalPlaces(inToken.decimals, BigNumber.ROUND_UP);

        return unstakingFee.plus(stakingFee);
      }
      return new BigNumber(0); // Not possible
    };

    const inToOutExchangeRate = (() => {
      if (isStaking) return outLstData!.suiToLstExchangeRate;
      if (isUnstaking) return inLstData!.lstToSuiExchangeRate;
      if (isConverting)
        return inLstData!.lstToSuiExchangeRate.times(
          outLstData!.suiToLstExchangeRate
        );
      return new BigNumber(1); // Not possible
    })();

    const _inValue = BigNumber.max(0, inValue);
    const result = _inValue
      .minus(getFee(_inValue))
      .times(inToOutExchangeRate);

    return formatToken(result, {
      dp: outToken.decimals,
      useGrouping: false,
      roundLtMinToZero: true,
    });
  }, [
    inValue,
    isStaking,
    outLstData,
    inToken.decimals,
    isUnstaking,
    inLstData,
    isConverting,
    outToken.decimals,
  ]);
  const outValueUsd = new BigNumber(outValue || 0).times(outPrice);

  // Submit
  // Submit - obligations
  const [obligationOwnerCaps, setObligationOwnerCaps] = useState<
    ObligationOwnerCap<string>[] | undefined
  >(undefined);
  const [obligations, setObligations] = useState<
    ParsedObligation[] | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      if (!address) return;
      const result = await initializeSuilend(
        suiClient,
        appData.suilendClient,
        address!
      );

      setObligationOwnerCaps(result.obligationOwnerCaps);
      setObligations(result.obligations);
    })();
  }, [appData.suilendClient, address]);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (digest) {
        await updateTransaction({
          hash: digest,
          status: "SUBMITTED"
        });
        const receipt = await suiClient.waitForTransaction({ digest: digest });
        if (receipt?.errors && receipt?.errors.length > 0) {
          await updateTransaction({
            status: "FAILED"
          });
        } else {
          await updateTransaction({
            status: "SUCCESS"
          });
        }
      }
    }
    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digest]);

  // Submit - button state
  const [isSubmitting_main, setIsSubmitting_main] = useState<boolean>(false);
  const [isSubmitting_stakeAndDeposit, setIsSubmitting_stakeAndDeposit] =
    useState<boolean>(false);

  const getSubmitButtonState_main = (): SubmitButtonState => {
    if (!address) return { title: "Wallet not found", isDisabled: true };
    if (isSubmitting_main) return { isLoading: true, isDisabled: true };

    if (new BigNumber(inValue || 0).lte(0))
      return { title: "Enter an amount", isDisabled: true };
    if (new BigNumber(inValue).gt(inBalance))
      return {
        title: `Insufficient ${inToken.symbol}`,
        isDisabled: true,
      };
    if (
      (isStaking &&
        new BigNumber(inValue).gt(inBalance.minus(SUI_GAS_MIN))) ||
      suiBalance.lt(SUI_GAS_MIN)
    )
      return {
        title: `${SUI_GAS_MIN} SUI should be saved for gas`,
        isDisabled: true,
      };
    if (new BigNumber(outValue).lte(0))
      return { title: "Amount too low", isDisabled: true };

    return {
      title: `${isStaking ? "Stake" : isUnstaking ? "Unstake" : "Convert"
        } ${formatToken(new BigNumber(inValue), {
          dp: inToken.decimals,
        })} ${inToken.symbol}`,
      isDisabled: isSubmitting_stakeAndDeposit,
    };
  };
  const submitButtonState_main = getSubmitButtonState_main();

  const getSubmitButtonState_stakeAndDeposit = (): SubmitButtonState => {
    if (isSubmitting_stakeAndDeposit)
      return { isLoading: true, isDisabled: true };

    return {
      title: `${isStaking ? "Stake" : "Convert"} and deposit in Suilend`,
      isDisabled:
        !address ||
        submitButtonState_main.isDisabled ||
        isSubmitting_main,
    };
  };
  const submitButtonState_stakeAndDeposit =
    getSubmitButtonState_stakeAndDeposit();

  const hasStakeAndDepositButton = useMemo(
    () =>
      (isStaking || isConverting) &&
      outLstData!.suilendReserveStats !== undefined,
    [isStaking, isConverting, outLstData]
  );

  // Submit - send transaction
  const submit = async (isDepositing: boolean) => {
    if (isDepositing) {
      if (submitButtonState_stakeAndDeposit.isDisabled) return;
    } else {
      if (submitButtonState_main.isDisabled) return;
    }

    const setIsSubmitting = isDepositing
      ? setIsSubmitting_stakeAndDeposit
      : setIsSubmitting_main;
    setIsSubmitting(true);

    const submitAmount = new BigNumber(inValue)
      .times(10 ** inToken.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

    const transaction = new Transaction();

    try {
      if (isDepositing) {
        if (!(isStaking || isConverting))
          throw new Error("Unsupported mode");

        const obligation = obligations?.[0]; // Obligation with the highest TVL
        const obligationOwnerCap = obligationOwnerCaps?.find(
          (o) => o.obligationId === obligation?.id
        );

        const { obligationOwnerCapId, didCreate } =
          createObligationIfNoneExists(
            appData.suilendClient,
            transaction,
            obligationOwnerCap
          );

        const lstCoin = isStaking
          ? outLstClient!.mintAmountAndRebalance(
            transaction,
            address!,
            submitAmount
          )
          : convertLsts(
            inLstClient!,
            outLstClient!,
            transaction,
            address!,
            submitAmount
          );
        appData.suilendClient.deposit(
          lstCoin,
          outLstData!.token.coinType,
          obligationOwnerCapId,
          transaction
        );

        if (didCreate)
          sendObligationToUser(
            obligationOwnerCapId,
            address!,
            transaction
          );
      } else {
        if (isStaking) {
          outLstClient!.mintAmountAndRebalanceAndSendToUser(
            transaction,
            address!,
            submitAmount
          );
        } else if (isUnstaking) {
          inLstClient!.redeemAmountAndSendToUser(
            transaction,
            address!,
            submitAmount
          );
        } else if (isConverting) {
          convertLstsAndSendToUser(
            inLstClient!,
            outLstClient!,
            transaction,
            address!,
            submitAmount
          );
        }
      }
    } catch (err) {
      console.log("Error in stake", err);
      toast.error('Failed to process action');
      return;
    }

    try {
      transaction.setSenderIfNotSet(address!)

      const txJson = await transaction.toJSON({
        client: suiClient
      });

      const result = await executeTransaction(txJson);
      if (!result || (result.errors && result.errors.length > 0)) {
        toast.error('Failed to process action');
        return;
      }

      const balanceChangeIn = getBalanceChange(
        result,
        address!,
        inToken,
        -1
      );
      const balanceChangeOut = getBalanceChange(
        result,
        address!,
        outToken
      );

      const title = [
        isStaking ? "Staked" : isUnstaking ? "Unstaked" : "Converted",
        formatToken(
          balanceChangeIn !== undefined
            ? balanceChangeIn
            : new BigNumber(inValue),
          { dp: inToken.decimals }
        ),
        inToken.symbol,
      ].join(" ");

      const subTitle = [
        isDepositing ? "Deposited" : "Received",
        formatToken(
          !isDepositing && balanceChangeOut !== undefined
            ? balanceChangeOut
            : new BigNumber(outValue),
          { dp: outToken.decimals }
        ),
        outToken.symbol,
        isDepositing ? "in Suilend" : false,
      ]
        .filter(Boolean)
        .join(" ");

      const log = `${title}. ${subTitle}`;

      // Create transaction record
      await createTransaction({
        type: "SWAP",
        title: log,
        metadata: {
          fromAmount: inValue,
          fromToken: inToken.coinType,
          fromSymbol: inToken.symbol,
          toAmount: outValue,
          toToken: outToken.coinType,
          toSymbol: outToken.symbol,
        }
      });
      setDigest(result.digest);
      formatAndSetInValue("");
    } catch (err) {
      toast.error(
        `Failed to ${isStaking ? "stake" : isUnstaking ? "unstake" : "convert"
        }`
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
      inInputRef.current?.focus();
      await refresh();
    }
  };

  // Parameters
  type Parameter = {
    labelStartDecorator?: ReactNode;
    label: string;
    labelEndDecorator?: ReactNode;
    values: {
      startDecorator?: ReactNode;
      value: string;
      endDecorator?: ReactNode;
      subValue?: string;
    }[];
  };

  const parameters = useMemo(() => {
    const lstDatas = lstIds.map((lstId) => appData.lstDataMap[lstId]);

    const result: Parameter[] = [
      {
        label: "1 SUI ≈",
        values: lstDatas.reduce(
          (acc, lstData) => [
            ...acc,
            {
              value: [
                formatToken(lstData.suiToLstExchangeRate, {
                  dp: 3,
                }),
                lstDatas.length === 1
                  ? lstData.token.symbol
                  : null,
              ]
                .filter(Boolean)
                .join(" "),
            },
          ],
          [] as Parameter["values"]
        ),
      },
      {
        label: "APR",
        values: lstDatas.reduce(
          (acc, lstData) => [
            ...acc,
            {
              value:
                lstData.aprPercent === undefined
                  ? "--"
                  : formatPercent(lstData.aprPercent),
            },
          ],
          [] as Parameter["values"]
        ),
      },
      {
        label: "Staking fee",
        values: lstDatas.reduce(
          (acc, lstData) => [
            ...acc,
            {
              value: formatPercent(lstData.mintFeePercent),
            },
          ],
          [] as Parameter["values"]
        ),
      },
      {
        label: "Unstaking fee",
        values: lstDatas.reduce(
          (acc, lstData) => [
            ...acc,
            {
              value: formatPercent(lstData.redeemFeePercent),
            },
          ],
          [] as Parameter["values"]
        ),
      },
    ];

    return result;
  }, [lstIds, appData.lstDataMap]);

  // Add this state near other useState declarations
  const [showParameters, setShowParameters] = useState(false);

  if (transaction) {
    return <TransactionStatus
      transaction={transaction}
      isLoading={isTransactionLoading}
    />;
  }

  return (
    <div className="relative z-[1] flex flex-col items-center w-[400px]">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex w-full flex-col gap-4">
          <Card>
            {/* Form */}
            <div className="relative flex w-full flex-col items-center gap-2 p-2 md:gap-4 md:p-4">
              <div className="relative z-[1] w-full">
                <StakeInput
                  ref={inInputRef}
                  title="In"
                  token={inToken}
                  onTokenChange={(_token) =>
                    onTokenChange(
                      _token,
                      TokenDirection.IN
                    )
                  }
                  value={inValue}
                  onChange={formatAndSetInValue}
                  usdValue={inValueUsd}
                  onBalanceClick={onInBalanceClick}
                />
              </div>

              <button
                className="group relative z-[2] -my-5 rounded-[50%] bg-navy-100 p-2 md:-my-7 bg-primary"
                onClick={reverseTokens}
              >
                <ArrowUpDown className="h-4 w-4 text-navy-600 transition-colors group-hover:text-foreground" />
              </button>

              <div className="relative z-[1] w-full">
                <StakeInput
                  title="Out"
                  token={outToken}
                  onTokenChange={(_token) =>
                    onTokenChange(
                      _token,
                      TokenDirection.OUT
                    )
                  }
                  value={outValue}
                  usdValue={outValueUsd}
                />
              </div>

              <div className="flex flex-col w-full bg-background rounded-md">
                <button
                  onClick={() =>
                    setShowParameters(!showParameters)
                  }
                  className={cn(
                    "flex w-full flex-row items-center justify-between p-2 cursor-pointer",
                    showParameters &&
                    "border-b border-border"
                  )}
                >
                  <p className="text-sm font-medium text-primary-foreground">
                    More info
                  </p>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-primary-foreground transition-transform duration-200",
                      showParameters && "rotate-180"
                    )}
                  />
                </button>
                {/* Parameters */}
                {showParameters && (
                  <div className="flex w-full flex-col gap-2 p-3">
                    {lstIds.length > 1 && (
                      <div className="flex w-full flex-row items-center justify-end gap-4 mb-2">
                        {lstIds.map((lstId) => (
                          <div
                            key={lstId}
                            className="flex w-16 flex-col items-end"
                          >
                            <p className="text-xs text-navy-600">
                              {
                                appData
                                  .lstDataMap[
                                  lstId
                                ].token
                                  .symbol
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      {parameters.map(
                        (param, index) => (
                          <div
                            key={index}
                            className="flex w-full flex-row justify-between"
                          >
                            <div className="flex flex-row items-center gap-1">
                              {
                                param.labelStartDecorator
                              }
                              <p className="text-xs text-navy-600">
                                {
                                  param.label
                                }
                              </p>
                              {
                                param.labelEndDecorator
                              }
                            </div>

                            <div className="flex flex-row items-center gap-4">
                              {param.values.map(
                                (
                                  value,
                                  index2
                                ) => (
                                  <div
                                    key={
                                      index2
                                    }
                                    className={cn(
                                      "flex flex-col items-end",
                                      lstIds.length >
                                      1 &&
                                      "w-16"
                                    )}
                                  >
                                    <div className="flex flex-row items-center gap-1">
                                      {
                                        value.startDecorator
                                      }
                                      <p className="text-xs">
                                        {
                                          value.value
                                        }
                                      </p>
                                      {
                                        value.endDecorator
                                      }
                                    </div>
                                    {value.subValue && (
                                      <p className="text-xs text-navy-500">
                                        {
                                          value.subValue
                                        }
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col items-center gap-2">
                <div className="flex w-full flex-col gap-px">
                  <SubmitButton
                    style={
                      hasStakeAndDepositButton
                        ? {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }
                        : undefined
                    }
                    state={submitButtonState_main}
                    submit={() => submit(false)}
                  />
                  {hasStakeAndDepositButton && (
                    <SubmitButton
                      className="min-h-9 bg-background py-2"
                      style={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                      }}
                      labelClassName="text-primary"
                      loadingClassName="h-5 w-5"
                      state={
                        submitButtonState_stakeAndDeposit
                      }
                      submit={() => submit(true)}
                    />
                  )}
                </div>
                {(isStaking || isConverting) &&
                  outLstData &&
                  outLstData.suilendReserveStats !==
                  undefined &&
                  outLstData.suilendReserveStats.sendPointsPerDay.gt(
                    0
                  ) && (
                    <div className="flex flex-row items-center gap-1.5 mt-2">
                      <p className="text-xs text-white/50">
                        Deposit to earn{" "}
                        {outValue === ""
                          ? `${formatPoints(
                            new BigNumber(
                              1
                            ).times(
                              outLstData.suilendReserveStats!
                                .sendPointsPerDay
                            ),
                            { dp: 3 }
                          )} SEND Points / ${outLstData.token
                            .symbol
                          } / day`
                          : `${formatPoints(
                            new BigNumber(
                              outValue || 0
                            ).times(
                              outLstData.suilendReserveStats!
                                .sendPointsPerDay
                            ),
                            { dp: 3 }
                          )} SEND Points / day`}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
