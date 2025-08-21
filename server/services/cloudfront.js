import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = "E2H5BVBGU3TW7A";
const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString();

const distributionName = "https://d3wn6jzi3vsv0.cloudfront.net";

export const createCloudGetFrontSignedurl = ({
  key,
  download = false,
  filename,
}) => {
  const url = `${distributionName}/${key}?response-content-disposition=${encodeURIComponent(`${download ? "attachment" : "inline"};filename=${filename}`)}`;
  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    privateKey,
    dateLessThan,
  });
  return signedUrl;
};
