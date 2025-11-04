const DAY_CODE = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export default function getStoreStatusByDate(
  storeHours = [],
  now = new Date()
) {
  if (!Array.isArray(storeHours) || storeHours.length === 0) {
    return "CLOSED";
  }

  const dayCode = DAY_CODE[now.getDay()]; // 오늘 요일 코드 ex) "MON"
  const todayRule = storeHours.find((h) => h.dayOfWeek === dayCode);

  // 오늘 요일 정보가 아예 없으면 닫힘으로 본다
  if (!todayRule) return "CLOSED";

  const { isClosed, openTime, closeTime } = todayRule;

  // 1) 휴무일로 명시돼 있으면 무조건 HOLIDAY
  if (isClosed === "Y") {
    return "HOLIDAY";
  }

  // 2) openTime/closeTime 이 없으면 영업 안 하는 날로 본다
  if (!openTime || !closeTime) {
    return "HOLIDAY";
  }

  // 3) 시간 비교
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(openTime); // 예: "09:00" → 540
  const closeMinutes = toMinutes(closeTime); // 예: "22:00" → 1320

  // (야간영업/자정 넘어가는 케이스 없다고 보고 같은 날 기준으로 비교)
  if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
    return "OPEN";
  } else {
    return "CLOSED";
  }
}
