import { PostTweetResponse } from "@/lib/ai/actions/twitter";


export default function PostTweet({data, isLoading}: {data: PostTweetResponse, isLoading?: boolean}) {
    if(isLoading) {
        return <div>Generating tweet...</div>;
    }

    if(data.error) {
        return <div>Error posting tweet</div>;
    }

    return (
        <div>
            <p>Tweet posted✅</p>
        </div>
    );
}