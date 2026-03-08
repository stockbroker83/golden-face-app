// ==========================================
// Notification Manager
// ==========================================

const NOTICE_KEY = "golden_face_notice_permission_requested";
const NOTICE_ENABLED_KEY = "golden_face_notification_enabled";

// ==========================================
// Daily Notification Messages Pool
// ==========================================
const DAILY_MESSAGES = [
  '🌅 오늘의 운세가 업데이트되었어요! 연애운 92점 🔥',
  '💰 오늘은 재물운이 최고조! 지금 확인하세요',
  '❤️ 오늘 만나는 사람과 궁합은? 지금 바로 체크',
  '🎁 출석 체크하고 5포인트 받아가세요!',
  '⭐ 오늘 당신의 행운 색은 골드! 확인해보세요',
  '🔮 AI가 분석한 오늘의 특별 운세가 도착했어요',
  '💎 연속 출석하면 보너스 포인트! 지금 확인',
  '🌟 오늘의 귀인 방향을 확인하세요',
];

// ==========================================
// Request Notification Permission
// ==========================================
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (Notification.permission === "granted") {
    localStorage.setItem(NOTICE_ENABLED_KEY, "true");
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  // Already asked before
  if (localStorage.getItem(NOTICE_KEY) === "true") {
    return false;
  }

  const allow = window.confirm(
    "매일 오전 9시, 오늘의 운세를 보내드릴게요 🔮\n알림을 허용하시겠어요?"
  );
  
  if (!allow) {
    localStorage.setItem(NOTICE_KEY, "true");
    return false;
  }

  const permission = await Notification.requestPermission();
  localStorage.setItem(NOTICE_KEY, "true");
  
  if (permission === "granted") {
    localStorage.setItem(NOTICE_ENABLED_KEY, "true");
  }
  
  return permission === "granted";
}

// ==========================================
// Check if Notifications are Enabled
// ==========================================
export function isNotificationEnabled(): boolean {
  return localStorage.getItem(NOTICE_ENABLED_KEY) === "true" && 
         Notification.permission === "granted";
}

// ==========================================
// Send Local Notification (for testing)
// ==========================================
export function sendLocalNotification(
  title: string, 
  body: string,
  icon?: string
): void {
  if (!isNotificationEnabled()) {
    console.log('알림이 비활성화되어 있습니다.');
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: icon || '/logo-600x600.png',
      badge: '/logo-600x600.png',
      tag: 'golden-face-notification',
      requireInteraction: false,
    });
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
}

// ==========================================
// Schedule Daily Notification (Client-side simulation)
// Note: In production, this should be handled by a backend service
// ==========================================
export function scheduleDailyNotification(): void {
  const enabled = isNotificationEnabled();
  if (!enabled) {
    console.log('알림이 비활성화되어 있습니다.');
    return;
  }

  // Get random message
  const randomMessage = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
  
  // Calculate time until 9 AM tomorrow
  const now = new Date();
  const tomorrow9AM = new Date();
  tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
  tomorrow9AM.setHours(9, 0, 0, 0);
  
  const timeUntilNotification = tomorrow9AM.getTime() - now.getTime();
  
  console.log(`다음 알림 예정: ${tomorrow9AM.toLocaleString()}`);
  console.log(`알림 내용: ${randomMessage}`);
  
  // In a real app, this would be handled by:
  // 1. Backend cron job
  // 2. Push notification service (e.g., Firebase Cloud Messaging)
  // 3. Toss Apps notification API
  
  // For demo purposes, we'll schedule it locally
  setTimeout(() => {
    sendLocalNotification('금빛관상', randomMessage);
    scheduleDailyNotification(); // Reschedule for next day
  }, timeUntilNotification);
}

// ==========================================
// Try Toss Apps Notification
// ==========================================
export async function tryTossNotification(
  title: string,
  body: string
): Promise<boolean> {
  try {
    const tossModule = (await import("@apps-in-toss/web-framework")) as any;
    const maybeNotify = tossModule?.showNotification;
    
    if (typeof maybeNotify === "function") {
      await maybeNotify({ title, body });
      return true;
    }
  } catch {
    // Toss SDK not available, fallback to Web Notification
  }

  // Fallback to standard notification
  sendLocalNotification(title, body);
  return false;
}

// ==========================================
// Notification Presets
// ==========================================
export const NOTIFICATION_PRESETS = {
  dailyFortune: () => {
    const messages = DAILY_MESSAGES;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    return {
      title: '금빛관상',
      body: randomMsg,
    };
  },
  
  streakReminder: (days: number) => ({
    title: `${days}일 연속 출석! 🔥`,
    body: '오늘도 출석하고 포인트 받아가세요!',
  }),
  
  pointsEarned: (points: number, action: string) => ({
    title: '포인트 적립!',
    body: `${action}으로 ${points}포인트를 받았어요! 🎁`,
  }),
  
  premiumExpiring: (daysLeft: number) => ({
    title: '프리미엄 만료 예정',
    body: `프리미엄이 ${daysLeft}일 후 만료돼요. 지금 갱신하세요!`,
  }),
  
  specialOffer: () => ({
    title: '특별 할인! 💰',
    body: '오늘만 프리미엄 20% 할인! 놓치지 마세요',
  }),
};

// ==========================================
// Disable Notifications
// ==========================================
export function disableNotifications(): void {
  localStorage.setItem(NOTICE_ENABLED_KEY, "false");
  console.log('알림이 비활성화되었습니다.');
}

// ==========================================
// Re-enable Notifications
// ==========================================
export async function enableNotifications(): Promise<boolean> {
  if (Notification.permission === "denied") {
    alert('브라우저 설정에서 알림 권한을 허용해주세요.');
    return false;
  }

  if (Notification.permission === "default") {
    const granted = await requestNotificationPermission();
    return granted;
  }

  localStorage.setItem(NOTICE_ENABLED_KEY, "true");
  return true;
}
