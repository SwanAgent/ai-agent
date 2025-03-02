interface User {
  id: number;
  documentId: string;
  address: string;
  coin_held: string[];
  name: string;
  bio: string | null;
  avatar: string;
  twitter_screen_name: string;
  verified_type: string | null;
  ref_code: string | null;
  from_ref_code: string | null;
  follower_count: number | null;
  following_count: number | null;
  like_count: number | null;
  point: number;
  total_ref: number;
  task_done: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  is_follow_twitter: boolean;
  telegram_username: string | null;
  is_join_tele: boolean;
  number_gen: number;
  is_retweet: boolean | null;
  image_url: string | null;
}

export interface SuiAiPools {
  id: number;
  documentId: string;
  pool_id: string;
  total_supply: string;
  max_pool_sui: string;
  marketcap: number;
  volume_24h: number;
  total_volume: string;
  name: string;
  symbol: string;
  decimals: number;
  reply_count: number;
  icon_url: string;
  token_address: string;
  virtual_coin_reserves: string;
  virtual_sui_reserves: string;
  creator: string;
  x: string;
  telegram: string;
  website: string;
  price: number;
  is_suai_pool: boolean | null;
  cetus_pool_id: string;
  cetus_atob: any | null;
  is_partner: boolean | null;
  waring: string | null; // Note: This appears to be a typo in the original data ("waring" instead of "warning")
  tvl_usd: number;
  price_change: number;
  holders: number;
  dataset: any | null;
  verified_type: string | null;
  user: User;
}