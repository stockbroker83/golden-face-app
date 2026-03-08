export function vibrateLight() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

export function vibrateMedium() {
  if ('vibrate' in navigator) {
    navigator.vibrate(30);
  }
}

export function vibrateSuccess() {
  if ('vibrate' in navigator) {
    navigator.vibrate([30, 50, 30]);
  }
}

export function vibrateError() {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}
