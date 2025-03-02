import { FetchTweetsResponse } from "@/lib/ai/actions/twitter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TweetRowProps {
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

export default function FetchTweets({ data, isLoading, className }: { 
  data: FetchTweetsResponse, 
  isLoading?: boolean,
  className?: string 
}) {
    if (isLoading) {
        return (
            <Card className={cn(
                "mt-3 max-w-96 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30",
                className
            )}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4" type="always">
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

    if (data.error) {
        return (
            <Card className={cn("mt-3 max-w-96", className)}>
                <CardContent className="p-4">
                    <p className="text-destructive">Error: {data.error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "mt-3 max-w-96 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30",
            className
        )}>
            <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <span>Tweets from @{data.data?.username}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]" type="always">
                    <div className="divide-y divide-border/40">
                        {data.data?.tweets.map((tweet, index) => (
                            <TweetRow key={index} tweet={tweet.text} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}