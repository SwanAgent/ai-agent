import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import {
  getTwitterAccessByOauthToken,
  updateTwitterAccess,
} from "@/server/db/queries";
import { decryptString, encryptString } from "@/utils/encryption";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const oauth_token = url.searchParams.get("oauth_token");
    const oauth_verifier = url.searchParams.get("oauth_verifier");
    const twitterAppKey = process.env.TWITTER_APP_KEY;
    const twitterAppSecret = process.env.TWITTER_APP_SECRET;

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.json(
        { error: "Missing OAuth parameters." },
        { status: 400 }
      );
    }

    if (!twitterAppKey || !twitterAppSecret) {
      return NextResponse.json(
        { error: "Missing developer account keys." },
        { status: 400 }
      );
    }

    const twitterAuthData = await getTwitterAccessByOauthToken({
      oauthToken: oauth_token,
    });

    if (!twitterAuthData || !twitterAuthData?.requestSecret) {
      return NextResponse.json(
        {
          error:
            "Could not find request secret token to fetch long lived keys for user.",
        },
        { status: 400 }
      );
    }

    const decryptedRequestSecret = decryptString(twitterAuthData.requestSecret);

    try {
      const requestClient = new TwitterApi({
        appKey: twitterAppKey,
        appSecret: twitterAppSecret,
        accessToken: oauth_token,
        accessSecret: decryptedRequestSecret,
      });

      const {
        client: loggedClient,
        accessToken,
        accessSecret,
      } = await requestClient.login(oauth_verifier);

      const encryptedAccessToken = encryptString(accessToken);
      const encryptedAccessSecret = encryptString(accessSecret);

      const currUser = await loggedClient.currentUser();

      await updateTwitterAccess({
        oauthToken: oauth_token,
        accessToken: encryptedAccessToken,
        accessSecret: encryptedAccessSecret,
        username: currUser.screen_name, //x username
        isValid: true,
      });

      const baseUrl = url.origin;
      return NextResponse.redirect(`${baseUrl}/account`);
    } catch (error) {
      console.error("Error exchanging verifier for tokens:", error);
      return NextResponse.json(
        { error: "Authentication failed." },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Authentication callback failed - ${err}` },
      { status: 500 }
    );
  }
}