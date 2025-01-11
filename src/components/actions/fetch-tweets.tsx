import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FetchTweetsResponse } from "@/lib/ai/actions/twitter";
import { ActionComponentProps } from "@/types/actions";

type FetchTweetsProps = ActionComponentProps<FetchTweetsResponse>

type TweetRowProps = {
    tweet: string;
}

const TweetRow = ({ tweet }: TweetRowProps) => (
  <div className="p-4 hover:bg-muted/50 transition-colors">
    <p className="text-sm">{tweet}</p>
  </div>
);

const TweetSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
    </div>
  </div>
);

export function FetchTweets({ result, isLoading, className }: FetchTweetsProps) {
    if (isLoading) {
        return (
            <Card className={cn(
                "mt-3 overflow-auto max-w-96 border-border/50 bg-gradient-to-br from-background to-muted/30",
                className
            )}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className=" pr-4" type="always">
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TweetSkeleton key={i} />
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    }
    const { data, error } = result ?? {};

    if (error) {
        return (
            <Card className={cn("mt-3 max-w-96", className)}>
                <CardContent className="p-4">
                    <p className="text-destructive">Error fetching tweets</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "mt-3 overflow-hidden  max-w-96 border-border/50 bg-gradient-to-br from-background to-muted/30",
            className
        )}>
            <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <span>Tweets from @{data?.username}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[320px] overflow-auto">
                    <div className="divide-y divide-border/40">
                        {data?.tweets.map((tweet: { text: string; tweetId: string | undefined }, index) => (
                            <TweetRow key={index} tweet={tweet.text} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}