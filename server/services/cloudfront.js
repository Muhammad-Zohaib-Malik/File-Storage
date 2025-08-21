import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

const keyPairId = "EL4LJEPFSVT9U";

const dateLessThan = Math.floor(Date.now() / 1000) + 60 * 60;


const distributionName = "https://d3rrrvl6vn242e.cloudfront.net";

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
