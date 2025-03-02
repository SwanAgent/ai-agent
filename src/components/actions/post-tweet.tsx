import { PostTweetResponse } from "@/lib/ai/actions/twitter";
import { ActionComponentProps } from "@/types/actions";

type PostTweetProps = ActionComponentProps<PostTweetResponse>

export function PostTweet({ result }: PostTweetProps) {
    const { isLoading, toolResult } = result ?? {};
    if(isLoading) {
        return <div>Generating tweet...</div>;
    }

    const { error } = toolResult ?? {};
    if(error) {
        return <div>Error posting tweet</div>;
    }

    return (
        <div>
            <p>Tweet posted✅</p>
        </div>
    );
}