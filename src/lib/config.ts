import { TwitterCookies, twitterProdClientCookies } from './twitter-cookie';

export interface Config {
    twitterUsername: string;
    twitterPassword: string;
    twitterClientCookies: TwitterCookies;
    maxTweets: number;
    maxSearchTweets: number;
}

const config = (): Config => {
    // const twitterUsername = process.env.TWITTER_USERNAME
    // const twitterPassword = process.env.TWITTER_PASSWORD

    const twitterUsername = 'jason_w_lee'
    const twitterPassword = 'jasonwlee123'
    const maxTweets = process.env.MAX_TWEETS || 10;
    const maxSearchTweets = process.env.MAX_SEARCH_TWEETS || 30;

    if (!twitterUsername || !twitterPassword) {
        throw Error(`Missing twitter credentials`);
    }

    const twitterClientCookies = twitterProdClientCookies;

    return {
        twitterUsername,
        twitterPassword,
        twitterClientCookies,
        maxTweets: Number(maxTweets),
        maxSearchTweets: Number(maxSearchTweets),
    };
};

export default config();