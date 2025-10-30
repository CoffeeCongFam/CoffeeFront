// 내 위치 ex) 강남역(37.4979, 127.0276) 기준 반경 약 2km 내 카페 리스트
const subscriptionList = [
  {
    storeName: "스타벅스",
    subscriptionType: "STANDARD",
    price: 10000,
    subscriptionPeriod: 1,
    maxDailyUsage: 2,
    subscriptionDesc: "아메리카노 굳",
    menuNameList: ["아메리카노"]
  },
  {
    storeName: "이디야",
    subscriptionType: "STANDARD",
    price: 5000,
    subscriptionPeriod: 2,
    maxDailyUsage: 1,
    subscriptionDesc: "카페라떼 굳",
    menuNameList: ["카페라떼"]
  },
    {
    storeName: "할리스",
    subscriptionType: "STANDARD",
    price: 20000,
    subscriptionPeriod: 1,
    maxDailyUsage: 3,
    subscriptionDesc: "아이스티 굳",
    menuNameList: ["아이스티", "샌드위치"]
  },
    {
    storeName: "진심커피",
    subscriptionType: "STANDARD",
    price: 40000,
    subscriptionPeriod: 1,
    maxDailyUsage: 3,
    subscriptionDesc: "샌드위치 굳",
    menuNameList: ["샌드위치", "아메리카노"]
  },
];

export default subscriptionList;
