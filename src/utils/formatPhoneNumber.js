export default function formatPhoneNumber (num) {
    if (!num) return "-";

    const onlyNum = num.replace(/[^0-9]/g, ""); // 숫자만 남기기

    // 휴대폰 (010 등)
    if (/^01[016789]/.test(onlyNum)) {
      return onlyNum.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    // 서울 (02)
    if (/^02/.test(onlyNum)) {
      return onlyNum.replace(/(02)(\d{3,4})(\d{4})/, "$1-$2-$3");
    }

    // 나머지 지역번호 (031, 051 등)
    if (/^0\d{2}/.test(onlyNum)) {
      return onlyNum.replace(/(0\d{2})(\d{3,4})(\d{4})/, "$1-$2-$3");
    }

    // 예외
    return num;
};