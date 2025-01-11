import { PostTweetResponse } from "@/lib/ai/actions/twitter";
import { ActionComponentProps } from "@/types/actions";

type PostTweetProps = ActionComponentProps<PostTweetResponse>

export function PostTweet({ result, isLoading }: PostTweetProps) {
    if(isLoading) {
        return <div>Generating tweet...</div>;
    }

    const { error } = result ?? {};
    if(error) {
        return <div>Error posting tweet</div>;
    }

    return (
        <div>
            <p>Tweet posted✅</p>
        </div>
    );
}