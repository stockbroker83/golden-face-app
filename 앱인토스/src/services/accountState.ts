import { PointsData, VIPMembership } from "../types";

const ACCOUNT_API_BASE_URL = import.meta.env.VITE_ACCOUNT_API_BASE_URL || "";
const USER_ID_KEY = "golden_face_user_id";
const VIP_KEY = "golden_face_vip";

interface AccountStatePayload {
  points?: PointsData;
  is_vip?: boolean;
  vip?: VIPMembership;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function getOrCreateUserId(): string {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const next = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(USER_ID_KEY, next);
  return next;
}

export function isVipActive(vip: VIPMembership | null): boolean {
  if (!vip?.is_vip) return false;
  if (!vip.expires_at) return true;

  const expiresAt = new Date(vip.expires_at).getTime();
  if (Number.isNaN(expiresAt)) return Boolean(vip.is_vip);
  return Date.now() < expiresAt;
}

export function loadLocalVip(): VIPMembership | null {
  try {
    const raw = localStorage.getItem(VIP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VIPMembership;
  } catch {
    return null;
  }
}

export function saveLocalVip(vip: VIPMembership): void {
  localStorage.setItem(VIP_KEY, JSON.stringify(vip));
}

export async function fetchServerAccountState(): Promise<AccountStatePayload | null> {
  if (!ACCOUNT_API_BASE_URL) return null;

  try {
    const userId = getOrCreateUserId();
    const response = await withTimeout(
      fetch(`${ACCOUNT_API_BASE_URL}/account/state?userId=${encodeURIComponent(userId)}`),
      2500
    );

    if (!response.ok) return null;
    return (await response.json()) as AccountStatePayload;
  } catch {
    return null;
  }
}

export async function syncPointsToServer(points: PointsData): Promise<void> {
  if (!ACCOUNT_API_BASE_URL) return;

  try {
    await fetch(`${ACCOUNT_API_BASE_URL}/account/points/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: getOrCreateUserId(),
        points,
      }),
    });
  } catch {
    return;
  }
}

export async function grantVipOnServer(vip: VIPMembership): Promise<void> {
  if (!ACCOUNT_API_BASE_URL) return;

  try {
    await fetch(`${ACCOUNT_API_BASE_URL}/account/vip/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: getOrCreateUserId(),
        vip,
      }),
    });
  } catch {
    return;
  }
}
