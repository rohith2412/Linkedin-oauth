// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./auth/[...nextauth]";
// import axios from "axios";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.accessToken || !session?.linkedinSub)
//     return res.status(401).json({ error: "Not logged in" });

//   const { text } = req.body;
//   if (!text) return res.status(400).json({ error: "Post content missing" });

//   try {
//     const response = await axios.post(
//       "https://api.linkedin.com/v2/ugcPosts",
//       {
//         author: `urn:li:person:${session.linkedinSub}`,
//         lifecycleState: "PUBLISHED",
//         specificContent: {
//           "com.linkedin.ugc.ShareContent": {
//             shareCommentary: { text },
//             shareMediaCategory: "NONE",
//           },
//         },
//         visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${session.accessToken}`,
//           "X-Restli-Protocol-Version": "2.0.0",
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.status(200).json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: "Failed to post to LinkedIn" });
//   }
// }
