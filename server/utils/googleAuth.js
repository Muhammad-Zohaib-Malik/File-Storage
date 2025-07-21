import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export const verifyGoogleToken = async (code) => {
  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.REDIRECT_URI,
    });

    const loginTicket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const userData = loginTicket.getPayload();

    return userData;
  } catch (error) {
    console.log(error);
    return error;
  }
};
