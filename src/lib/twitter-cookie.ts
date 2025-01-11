export type TwitterCookie = {
    key: string;
    value: string;
    domain: string;
}

export type TwitterCookies = TwitterCookie[];

export const twitterProdClientCookies: TwitterCookies = [
    { key: 'auth_token', value: '6e17846d8f6c230cd307f5362530136024a06eff', domain: '.twitter.com' },
    { key: 'ct0', value: 'aa5d1805248803f1eb995f2dde4a4371fa20244ed1ca5f0b855775397a203c5087e99cb46aebcc5890176ffbbebac207d192b697d4f3e4bb2ebff6a7e16ee639788927a08d9bf3f03309af2f7935822e', domain: '.twitter.com' },
    { key: 'guest_id', value: 'v1%3A173591181069338262', domain: '.twitter.com' },
];