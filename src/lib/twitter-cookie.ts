export type TwitterCookie = {
    key: string;
    value: string;
    domain: string;
}

export type TwitterCookies = TwitterCookie[];

export const twitterProdClientCookies: TwitterCookies = [
    { key: 'auth_token', value: 'ea90d02e672a1b76dcbebf4926cfa039b19abc95', domain: '.twitter.com' },
    { key: 'ct0', value: '2338f29b114322b1676f391d0c2f58bd1fbc1fbdbbf8ded1c6e8f7b49ddd7818eb75b99b7d3da872755f601d2a7f7ce61e99435fba660d99c69ad81518fed4a2d9aa2fabc46bb778c26eb5f447fdd782', domain: '.twitter.com' },
    { key: 'guest_id', value: 'v1:173893587954054893', domain: '.twitter.com' },
];