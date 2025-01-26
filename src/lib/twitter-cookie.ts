export type TwitterCookie = {
    key: string;
    value: string;
    domain: string;
}

export type TwitterCookies = TwitterCookie[];

export const twitterProdClientCookies: TwitterCookies = [
    { key: 'auth_token', value: 'c9912a47aaf2dc10a39593cda143ec1ab9e4ff70', domain: '.twitter.com' },
    { key: 'ct0', value: 'a6395d9ea9845c9fd7724274be5e93c4234ff3ce3ae209c3382d264e4a07d5f0e39adc6490eb1ee0c5d4705d83cfdaa42d149c742e0430a95d11f63098234df552cf6ac3f714647248f48c0a0499bc9b', domain: '.twitter.com' },
    { key: 'guest_id', value: 'v1%3A173530637900822823', domain: '.twitter.com' },
];