import TweetScraper, { TweetData } from "@/lib/tweet-client";
import { ActionResponse } from "@/types/actions";
import { decryptString } from "@/utils/encryption";
import { TwitterApi } from "twitter-api-v2";
import { getTwitterAccessByUserId } from "@/server/db/queries";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

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

            const session = await getServerSession(authOptions);
            if (!session || !session.user || !session.user.id) {
                throw new Error("User not verified");
            }

            const userId = session.user.id;

            const twitterAccess = await getTwitterAccessByUserId({ userId });

            if (
                !twitterAccess ||
                !twitterAccess.accessToken ||
                !twitterAccess.accessSecret ||
                !twitterAccess.username
            ) {
                throw new Error("Twitter connection does not exist.");
            }

            if (!process.env.TWITTER_APP_SECRET || !process.env.TWITTER_APP_KEY) {
                throw new Error("Twitter developers keys not found");
            }

            const decryptedAccessToken = decryptString(twitterAccess?.accessToken);
            const decryptedAccessSecret = decryptString(twitterAccess?.accessSecret);

            const apiClient = new TwitterApi({
                appKey: process.env.TWITTER_APP_KEY,
                appSecret: process.env.TWITTER_APP_SECRET,
                accessToken: decryptedAccessToken,
                accessSecret: decryptedAccessSecret,
            });

            let tweetId = "";
            if (replyToTweetId) {
                const tweet = await apiClient.v2.reply(text, replyToTweetId);
                tweetId = tweet.data.id;
            } else {
                const tweet = await apiClient.v2.tweet(text);
                tweetId = tweet.data.id;
            }

            const username = twitterAccess.username;
            return {
                success: true,
                data: {
                    tweetLink: `https://x.com/${username}/status/${tweetId}`,
                    tweet: text,
                    replyToTweetId: replyToTweetId,
                    tweetId: tweetId,
                },
            };
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