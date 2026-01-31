/* eslint-disable no-console */

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

if (!masterKey || !binId) {
  console.error("Missing JSONBIN_MASTER_KEY (or NEXT_PUBLIC_JSONBIN_MASTER_KEY) or JSONBIN_BIN_ID");
  process.exit(1);
}

const testBin = async () => {
  const res = await fetch(`${baseUrl}/b/${binId}/latest`, {
    headers: {
      "X-Master-Key": masterKey,
    },
  });

  const text = await res.text();
  console.log("Status:", res.status, res.statusText);
  console.log("Body:", text);
};

testBin().catch((err) => {
  console.error(err);
  process.exit(1);
});
