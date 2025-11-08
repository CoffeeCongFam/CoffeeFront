import dayjs from "dayjs";

/**
 * 한국어 날짜/시간 포맷 함수
 * 예시: 2025년 11월 2일 오후 5시 08분
 */
export function formatKoreanDateTime(date) {
  const d = dayjs(date);
  const ampm = d.hour() >= 12 ? "PM" : "AM";
  const hour = d.hour() % 12 === 0 ? 12 : d.hour() % 12;
  const minute = d.minute().toString().padStart(2, "0");

  const emoji = ampm === "AM" && hour >= 6 && hour <= 12 ? "☀️" : "🌠";
  return `${d.year()}년 ${
    d.month() + 1
  }월 ${d.date()}일 ${ampm} ${hour}: ${minute} ${emoji}`;
}

/**
 * (선택) 날짜만 포맷 (예: 2025년 11월 2일)
 */
export function formatKoreanDate(date) {
  const d = dayjs(date);
  return `${d.year()}년 ${d.month() + 1}월 ${d.date()}일`;
}
