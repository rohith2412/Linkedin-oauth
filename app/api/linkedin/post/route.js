// app/api/linkedin/post/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // Get the session with auth options
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    console.log("=== LinkedIn Post Debug ===");
    console.log("Session Data:", {
      hasAccessToken: !!session.accessToken,
      linkedinSub: session.linkedinSub,
      linkedinId: session.linkedinId,
      tokenPreview: session.accessToken?.substring(0, 30) + "...",
    });

    // Get the post content from the request body
    const { text, visibility = "PUBLIC" } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Post text is required" },
        { status: 400 }
      );
    }

    // LinkedIn API endpoint for creating posts
    const linkedInApiUrl = "https://api.linkedin.com/v2/ugcPosts";

    // Prepare the post payload - EXACTLY as it works in Postman
    const postData = {
      author: `urn:li:person:${session.linkedinSub}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility,
      },
    };

    console.log("Request URL:", linkedInApiUrl);
    console.log("Request Body:", JSON.stringify(postData, null, 2));
    console.log("Authorization Header:", `Bearer ${session.accessToken.substring(0, 30)}...`);

    // Make the request to LinkedIn API
    const response = await fetch(linkedInApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postData),
    });

    console.log("LinkedIn API Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    // Read response body
    const responseText = await response.text();
    console.log("Response Body:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }

      console.error("LinkedIn API Error:", errorData);

      // More helpful error messages
      if (errorData.serviceErrorCode === 100) {
        return NextResponse.json(
          {
            error: "LinkedIn API Permission Error",
            message: "Your LinkedIn app doesn't have the required 'Share on LinkedIn' product enabled, or the access token doesn't have the correct permissions.",
            details: errorData,
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        { error: "Failed to post to LinkedIn", details: errorData },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log("Success! Post ID:", result.id);

    return NextResponse.json(
      {
        success: true,
        message: "Post published successfully",
        postId: result.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error posting to LinkedIn:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}