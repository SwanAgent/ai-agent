import { Profile, QueryTweetsResponse, Scraper, SearchMode, Tweet } from "agent-twitter-client-poc";
import config from "./config";

export interface TweetData {
    text: string;
    tweetId: string;
    isQuoted: boolean | undefined;
    timestamp: number;
}

export interface ITweetScraper {
    init(): Promise<void>;
    getProfile(username: string): Promise<string>;
    getTweets(username: string, maxTweets?: number): Promise<TweetData[]>;
    // getSearchTweets(username: string): Promise<string[]>;
    // getAllMentions(username: string, replyToTweetId?: string): Promise<Tweet[]>;
    getTweet(tweetId: string): Promise<Tweet | null>;
    postTweet(tweet: string): Promise<Response>;
}

class TweetScraper implements ITweetScraper {
    private static instance: TweetScraper | null = null;

    private scraper: Scraper;
    private maxTweets: number;
    private maxSearchTweets: number;
    private cookies: string[];

    constructor() {   
        this.scraper = new Scraper();
        this.maxTweets = config.maxTweets;
        this.maxSearchTweets = config.maxSearchTweets;
        this.cookies = this.getCookiesFromArray(config.twitterClientCookies);
    }

    public static getInstance(): TweetScraper {
        if (!TweetScraper.instance) {
            TweetScraper.instance = new TweetScraper();
            TweetScraper.instance.init();
        }
        return TweetScraper.instance;
    }

    async init() {
        await this.scraper.setCookies(this.cookies);
        const isLoggedIn = await this.scraper.isLoggedIn();
        if (!isLoggedIn) throw Error('Failed to login to Twitter');
    }

    getCookiesFromArray(cookiesArray: any[]) {
        const cookieStrings = cookiesArray.map(
            (cookie) =>
                `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${cookie.secure ? 'Secure' : ''
                }; ${cookie.httpOnly ? 'HttpOnly' : ''}; SameSite=${cookie.sameSite || 'Lax'}`,
        );
        return cookieStrings;
    }

    formatTweetsForContext(tweet: Tweet): string {
        if (!tweet.text) return '';

        if (tweet.isQuoted && tweet.quotedStatus && tweet.quotedStatus.text) {
            return `Quote Tweet:
    ➥ Original (@${tweet.quotedStatus.username}): "${this.cleanTweetText(tweet.quotedStatus.text)}"
    ➥ Response: "${this.cleanTweetText(tweet.text)}"`;
        }
        return `Tweet: ${this.cleanTweetText(tweet.text)}`;
    }

    cleanTweetText(text: string): string {
        return text
            .trim()
            .replace(/\n+/g, ' ') // Replace multiple newlines with single space
            .replace(/\s+/g, ' '); // Normalize spaces
    }

    formatProfileForContext(profile: Profile): string {
        return `Profile Information:
        ${profile.name ? `Name: ${profile.name}` : ''}
        ${profile.username ? `Username: @${profile.username}` : ''}
        ${profile.biography ? `Bio: ${this.cleanTweetText(profile.biography)}` : ''}
        ${profile.followersCount ? `Followers: ${profile.followersCount}` : ''}
        ${profile.followingCount ? `Following: ${profile.followingCount}` : ''}
        ${profile.joined ? `Joined: ${profile.joined.toLocaleDateString()}` : ''}
        ${profile.location ? `Location: ${profile.location}` : ''}
        ${profile.tweetsCount ? `Total Tweets: ${profile.tweetsCount}` : ''}
        ${profile.isVerified ? 'Verified Account: Yes' : 'Verified Account: No'}
        ${profile.isBlueVerified ? 'Twitter Blue Verified: Yes' : 'Twitter Blue Verified: No'}
        `.trim().split('\n').filter(line => line.trim() !== '').join('\n');
    }

    async getProfile(username: string): Promise<string> {
        const profile = await this.scraper.getProfile(username);
        return this.formatProfileForContext(profile);
    }

    async getTweets(username: string, maxTweets: number = this.maxTweets): Promise<TweetData[]> {
        console.log('Getting tweets for', username);
        const parsedTweets = [];
        const tweets = this.scraper.getTweets(username, maxTweets);
        for await (const tweet of tweets) {
            if (tweet.isReply || !tweet.id) continue;
            const formattedTweet = {
                text: this.formatTweetsForContext(tweet),
                tweetId: tweet.id,
                isQuoted: (tweet.isQuoted && tweet.quotedStatus && tweet.quotedStatus.text) ? true : false,
                timestamp: tweet.timestamp ?? Math.floor(Date.now() / 1000)
            };
            parsedTweets.push(formattedTweet);
        }
        console.log("parsedTweets", parsedTweets.length);
        return parsedTweets.slice(0, maxTweets);
    }

    async getSearchTweets(username: string): Promise<string[]> {
        const parsedTweets = [];
        const topMentionsAndInteractions = await this.scraper.fetchSearchTweets(`@${username}`, this.maxSearchTweets, SearchMode.Top);

        for await (const tweet of topMentionsAndInteractions.tweets) {
            const formattedTweet = this.formatTweetsForContext(tweet);
            parsedTweets.push(formattedTweet);
        }

        return parsedTweets;
    }

    // async getAllMentions(username: string): Promise<Tweet[]> {
    //     const query = `@${username}`;

    //     const mentions: Tweet[] = []
    //     const result: QueryTweetsResponse = await this.scraper.fetchSearchTweets(query, 100, SearchMode.Latest, next_token);


    //     const filteredTweets = result.tweets.filter(
    //         (tweet) =>
    //             tweet.isReply &&
    //             tweet.mentions.some((mention) => mention && mention.username && mention.username.toLowerCase() === username.toLowerCase()) &&
    //             tweet.text && tweet.text.toLowerCase().includes(`@${username.toLowerCase()} roast`) &&
    //             tweet.username && tweet.username.toLowerCase() !== username.toLowerCase(),
    //     );

    //     console.log(`Found ${mentions.length} mentions of ${query}`);
    //     return mentions;
    // }

    async getTweet(tweetId: string): Promise<Tweet | null> {
        return await this.scraper.getTweet(tweetId);
    }

    async postTweet(tweet: string, replyToTweetId?: string): Promise<Response> {
        return this.scraper.sendTweet(tweet, replyToTweetId);
    }


    async getSearchTweetsTillTimestamp(username: string, timestamp: number): Promise<TweetData[]> {
        let nextToken: string | undefined = undefined;
        let fetchCompleted = false;
        const parsedTweets = [];
        const query = `from:${username}`;

        console.log(`Getting tweets with query ${query} till ${timestamp}`);
        let errorCount = 0;
        while (true && errorCount < 3) {
            console.log("errorCount", errorCount);
            try {
                console.log("query", query, this.maxSearchTweets, SearchMode.Latest, nextToken);
                const topMentionsAndInteractions = await this.scraper.fetchSearchTweets(query, this.maxSearchTweets, SearchMode.Latest, nextToken);
                console.log(`Found ${topMentionsAndInteractions.tweets.length} tweets`);
                if (topMentionsAndInteractions.tweets.length === 0) {
                    break;
                }
                for (const tweet of topMentionsAndInteractions.tweets) {
                    if (tweet.timestamp && tweet.timestamp < timestamp && tweet.id) {
                        fetchCompleted = true;
                        break;
                    }
                    const formattedTweet = this.formatTweetsForContext(tweet);
                    parsedTweets.push({
                        text: formattedTweet,
                        tweetId: tweet.id!,
                        timestamp: tweet.timestamp ?? Math.floor(Date.now() / 1000),
                        isQuoted: (tweet.isQuoted && tweet.quotedStatus && tweet.quotedStatus.text) ? true : false,
                    });
                }
                nextToken = topMentionsAndInteractions.next;
                if (fetchCompleted) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log("error", error);
                console.log(`Error fetching tweets: ${error}`);
                errorCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return parsedTweets;
    }
}

export default TweetScraper.getInstance();