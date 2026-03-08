const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ message: "TOSS_SECRET_KEY is not configured." });
  }

  const body = parseBody(req);
  const paymentKey = body?.paymentKey;
  const orderId = body?.orderId;
  const amount = body?.amount;

  if (!paymentKey || !orderId || typeof amount !== "number") {
    return res.status(400).json({ message: "paymentKey, orderId, amount(number) are required." });
  }

  try {
    const authorization = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
    const response = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.message || "Toss payment confirmation failed.",
        code: data?.code || "TOSS_CONFIRM_FAILED",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unexpected error while confirming payment.",
    });
  }
}
