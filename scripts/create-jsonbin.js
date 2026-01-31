/* eslint-disable no-console */

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY;

if (!masterKey) {
  console.error("Missing JSONBIN_MASTER_KEY in .env.local");
  process.exit(1);
}

const name = process.argv[2] || "negotiation-proposals";

const createBin = async () => {
  const res = await fetch(`${baseUrl}/b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": masterKey,
      "X-Bin-Name": name,
      "X-Collection-Name": "adpg-negotiations",
    },
    body: JSON.stringify({
      createdAt: new Date().toISOString(),
      proposalsByConversation: {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSONBin create failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = await res.json();
  const binId = data?.metadata?.id;
  console.log("Created JSONBin:", binId);
  console.log("Bin URL:", `${baseUrl}/b/${binId}`);
};

createBin().catch((err) => {
  console.error(err);
  process.exit(1);
});
