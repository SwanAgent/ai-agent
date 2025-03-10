// import { useState } from "react";

// import { ChevronDown, ChevronUp } from "lucide-react";

// import { Token } from "@suilend/frontend-sui";
// import { LstId } from "@suilend/springsui-sdk";

// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { TokenLogo } from "@/components/stake/token-logo";
// import { useLoadedSpringSuiContext } from "@/contexts/spring-sui";
// import { cn } from "@/lib/utils";

// interface TokenPopoverProps {
//   token: Token;
//   onChange: (token: Token) => void;
// }

// export function TokenPopover({ token, onChange }: TokenPopoverProps) {
//   const { appData } = useLoadedSpringSuiContext();

//   // State
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   const Chevron = isOpen ? ChevronUp : ChevronDown;

//   // Change
//   const onChangeWrapper = (_token: Token) => {
//     onChange(_token);
//     setIsOpen(false);
//   };

//   return (
//     <Popover open={isOpen} onOpenChange={setIsOpen}>
//       <PopoverTrigger asChild>
//         <button className="flex flex-row items-center gap-2 py-1.5">
//           <TokenLogo token={token} size={28} />
//           <p className="text-h3">{token.symbol}</p>
//           <Chevron className="-ml-0.5 h-4 w-4" />
//         </button>
//       </PopoverTrigger>
//       <PopoverContent
//         align="end"
//         className="w-[240px]"
//       >
//         <div className="flex w-full flex-row flex-wrap gap-1">
//           {[
//             "SUI",
//             ...Object.values(LstId)
//               .filter(
//                 (lstId) => ![LstId.test1SUI, LstId.ripleysSUI].includes(lstId),
//               )
//               .filter(
//                 (lstId) =>
//                   lstId !== LstId.upSUI ||
//                   (lstId === LstId.upSUI && Date.now() >= 1734609600000), // 2024-12-19 12:00:00 UTC
//               ),
//           ].map((symbol) => {
//             const _token =
//               symbol === "SUI"
//                 ? appData.suiToken
//                 : appData.lstDataMap[symbol as LstId].token;

//             return (
//               <button
//                 key={symbol}
//                 className={cn(
//                   "group h-10 rounded-[20px] px-2 pr-3",
//                   _token.symbol === token.symbol
//                     ? "cursor-default bg-light-blue"
//                     : "bg-navy-100/50 transition-colors",
//                 )}
//                 onClick={() => onChangeWrapper(_token)}
//               >
//                 <div className="flex flex-row items-center gap-2">
//                   <TokenLogo
//                     className="outline outline-1 outline-white"
//                     token={_token}
//                     size={24}
//                   />

//                   <p
//                     className={cn(
//                       "!text-p2",
//                       _token.symbol === token.symbol
//                         ? "text-foreground"
//                         : "text-navy-600 transition-colors group-hover:text-foreground",
//                     )}
//                   >
//                     {_token.symbol}
//                   </p>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }
