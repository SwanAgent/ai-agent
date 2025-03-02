// import { Wallet } from "lucide-react";

// import { Token, formatToken } from "@suilend/frontend-sui";
// import { cn } from "@/lib/utils";

// interface BalanceLabelProps {
//   token: Token;
//   onClick?: () => void;
// }

// export function BalanceLabel({ token, onClick }: BalanceLabelProps) {
//   const { getBalance } = useLoadedSpringSuiContext();

//   const hasOnClick = !!onClick && getBalance(token.coinType).gt(0);

//   return (
//     <button
//       className={cn(
//         "flex flex-row items-center gap-1.5 text-left",
//         hasOnClick && "group",
//       )}
//       onClick={onClick}
//       disabled={!hasOnClick}
//     >
//       <Wallet
//         className={cn(
//           "text-navy-600",
//           hasOnClick && "transition-colors group-hover:text-foreground",
//         )}
//         size={16}
//       />
//       <p
//         className={cn(
//           "!text-p2 text-navy-600",
//           hasOnClick &&
//             "underline decoration-dotted decoration-1 underline-offset-2 transition-colors group-hover:text-foreground group-hover:decoration-solid",
//         )}
//       >
//         {formatToken(getBalance(token.coinType))}
//       </p>
//     </button>
//   );
// }
