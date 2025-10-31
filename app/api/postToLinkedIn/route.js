import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken || !session.linkedinId) {
      return NextResponse.json(
        { error: "You must be logged in with LinkedIn." },
        { status: 401 }
      );
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${session.linkedinId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ message: "Post created!", data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
