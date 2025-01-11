import TweetScraper, { TweetData } from "@/lib/tweet-client";
import { ActionResponse } from "@/types/actions";
import { z } from "zod";

const postTweetSchema = z.object({
    text: z.string().min(1).max(140).describe("The tweet text to post. Must be between 1 and 140 characters."),
    replyToTweetId: z.string().optional().describe("The tweet id to reply to. If not provided, the tweet will be posted as a standalone tweet."),
});

export type PostTweetSchema = z.infer<typeof postTweetSchema>;
export type PostTweetResponse = ActionResponse<{
    tweetLink: string;
    tweet: string;
    replyToTweetId?: string;
    tweetId?: string;
}>;

export const postTweet = {
    description: "Post a tweet to Twitter on behalf of the user. Always confirm the tweet text from user before posting. If you want to reply to a tweet, provide the tweet id in the replyToTweetId field.",
    parameters: postTweetSchema,
    execute: async ({ text, replyToTweetId }: PostTweetSchema): Promise<PostTweetResponse> => {
        try {
            console.log("posting tweet", text);
            const res = await TweetScraper.postTweet(text, replyToTweetId);
            const body = await res.json();

            if(body.errors && body.errors.length > 0) {
                console.log(body.errors);
                return {
                    success: false,
                    error: "Failed to post tweet",
                }
            }

            const tweetId = body.data.create_tweet.tweet_results.result.rest_id;
            const username = body.data.create_tweet.tweet_results.result.core.user_results.result.legacy.screen_name;

            return {
                success: true,
                data: {
                    tweetLink: `https://x.com/${username}/status/${tweetId}`,
                    tweet: text,
                    replyToTweetId: replyToTweetId,
                    tweetId: tweetId,
                },
            }    
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: "Failed to post tweet",
            }
        }
    }
}


const fetchTweetsSchema = z.object({
    username: z.string(),
    count: z.number().optional().describe("The number of tweets to fetch. Defaults to 10. Maximum is 25."),
});

export type FetchTweetsSchema = z.infer<typeof fetchTweetsSchema>;
export type FetchTweetsResponse = ActionResponse<{
    tweets: TweetData[];
    username: string;
}>;

export const fetchTweets = {
    description: "Fetch tweets from a given user's Twitter account",
    parameters: fetchTweetsSchema,
    execute: async ({ username, count = 10 }: FetchTweetsSchema): Promise<FetchTweetsResponse> => {
        try {
            const tweets = await TweetScraper.getTweets(username, count * 4);
            return {
                success: true,
                data: {
                    tweets: tweets,
                    username: username,
                },
            }
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: "Failed to fetch tweets",
            }
        }
    }
}