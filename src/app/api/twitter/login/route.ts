import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { encryptString } from "@/utils/encryption";
import { saveTwitterAccess } from "@/server/db/queries";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        // Get the session using the auth options
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;

        const twitterAppKey = process.env.TWITTER_APP_KEY;
        const twitterAppSecret = process.env.TWITTER_APP_SECRET;

        if (!twitterAppKey || !twitterAppSecret) {
            return NextResponse.json(
                { error: "Missing developer account keys." },
                { status: 400 }
            );
        }

        const client = new TwitterApi({
            appKey: twitterAppKey,
            appSecret: twitterAppSecret,
        });

        const callbackUrl = `${url.origin}/api/twitter/callback`;
        const authLink = await client.generateAuthLink(callbackUrl);

        const requestTokenSecretValue = authLink.oauth_token_secret;
        const encryptedRequestSecret = encryptString(requestTokenSecretValue);

        await saveTwitterAccess({
            userId: userId,
            requestSecret: encryptedRequestSecret,
            oauthToken: authLink.oauth_token,
            isValid: false, // temp flag as account setup still not complete
        });

        return NextResponse.redirect(authLink.url);
    } catch (err) {
        console.error("Error generating auth link:", err);
        return NextResponse.json(
            { error: `Authentication failed - ${err}` },
            { status: 500 }
        );
    }
}