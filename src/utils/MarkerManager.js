// MarkerManager.js
// 지도 위 카페 마커들을 관리하는 유틸 클래스.

import cafeDummy from "../assets/cafeInfoDummy.png";

export default class MarkerManager {
  /**
   * @param {naver.maps.Map} map   - Naver 지도 인스턴스
   * @param {typeof naver.maps} maps - naver.maps 네임스페이스 (생성자/유틸 접근용)
   * @param {objects} options
   *  - options.cafeIcon: 카페 마커 아이콘 URL
   */
  constructor(map, maps, options = {}) {
    this.map = map;
    this.maps = maps;

    // 현재 지도에 올려진 마커들을 id -> Marker 형태로 보관
    this.markers = new Map();

    // InfoWindow(말풍선)는 1개만 만들어서 재사용
    this.infoWindow = new maps.InfoWindow({ content: "" });

    // 마커 아이콘 경로 저장
    this.cafeIcon = options.cafeIcon || null;
  }

  // ✅ 마커/포커스에서 공통으로 쓸 ID 규칙
  _getId(cafe, idx) {
    return cafe._mmId ?? cafe.id ?? cafe.storeId ?? `idx-${idx ?? 0}`;
  }

  // 마커 클릭/포커스에서 공통으로 쓸 상세 말풍선 HTML
  _buildInfoHtml(cafe) {
    const stockInfo =
      cafe.subscriptionStock != null
        ? `<div style="color:#137333; font-weight:600; font-size:12px; margin-top:4px;">
            남은 구독권 ${cafe.subscriptionStock}개
          </div>`
        : "";

    const statusColor =
      cafe.storeStatus === "OPEN"
        ? "#E6F4EA"
        : cafe.storeStatus === "CLOSED"
        ? "#F1F3F4"
        : cafe.storeStatus === "HOLIDAY"
        ? "#FFF8E1"
        : "#EEE";

    const statusText =
      cafe.storeStatus === "OPEN"
        ? "영업중"
        : cafe.storeStatus === "CLOSED"
        ? "영업종료"
        : cafe.storeStatus === "HOLIDAY"
        ? "휴무일"
        : "정보없음";

    // 카페 더미 데이터
    const thumbnailSrc =
      cafe.storeImage && cafe.storeImage.trim() ? cafe.storeImage : cafeDummy;
    // "../assets/cafeInfoDummy.png"

    // const actionButton = cafe.isSubscribed
    //   ? `<button style="
    //         background:#fff;
    //         border:1px solid #aaa;
    //         color:#333;
    //         border-radius:20px;
    //         font-size:12px;
    //         padding:3px 10px;
    //         margin-top:6px;
    //         cursor:default;
    //       ">✓ 구독중</button>`
    //   : `<button style="
    //         background:#000;
    //         color:#fff;
    //         border:none;
    //         border-radius:20px;
    //         font-size:12px;
    //         padding:4px 12px;
    //         margin-top:6px;
    //         cursor:pointer;
    //       ">+ 구독하기</button>`;

    // const subscribeButton = `
    //   <a href="/me/store/${cafe.storeId}"
    //     style="
    //       display:inline-block;
    //       margin-top:6px;
    //       text-decoration:none;
    //       color:#fff;
    //       background:#1976d2;
    //       border-radius:20px;
    //       padding:4px 10px;
    //       font-size:12px;
    //     ">
    //     자세히 보기 →
    //   </a>
    // `;

    const detailButton = `
      <a href="/me/store/${cafe.storeId}" 
        style="
          display:inline-block;
          margin-top:6px;
          text-decoration:none;
          color:#fff;
          background:#1976d2;
          border-radius:20px;
          padding:4px 10px;
          font-size:12px;
        ">
        자세히 보기 →
      </a>
    `;

    return `
      <div style="
        display:flex;
        align-items:flex-start;
        gap:10px;
        padding:10px;
        width:350px;
        background:white;
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
        font-family:'Pretendard', sans-serif;
      ">
        <img src="${thumbnailSrc}" 
            style="width:70px; height:70px; border-radius:8px; object-fit:cover; flex-shrink:0;"
            alt="thumbnail" />
        <div style="flex:1; min-width:0; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
            <span style="
              background:${statusColor};
              color:#333;
              font-size:11px;
              padding:2px 6px;
              border-radius:10px;
              font-weight:600;
              white-space:nowrap;
            ">${statusText}</span>
            <span style="font-size:11px; color:#666; white-space:nowrap;">
              ${cafe.distance ? `${cafe.distance}m` : ""}
            </span>
          </div>
          <div style="font-weight:700; font-size:14px; margin:4px 0; word-break:keep-all;">
            ${cafe.storeName ?? ""}
          </div>
          <div style="
            font-size:12px; color:#666;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
            max-width:100%;
          ">
            ${cafe.roadAddress ?? ""}
          </div>

          <div style="font-size:12px; color:#444; margin-top:3px;">
            👥 ${cafe.subscriberCount ?? 0}명 · ⭐ ${cafe.reviewCount ?? 0}개
          </div>
          <div style=" display:flex; gap:6px; align-items:center; justify-content: right;">
            ${detailButton}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 카페 데이터로 마커를 동기화
   * @param {Array} cafes - [{id, storeName, xPoint(lng), yPoint(lat), ...}]
   */
  setData(cafes) {
    const nextIds = new Set();
    const bounds = new this.maps.LatLngBounds();

    cafes.forEach((cafe, idx) => {
      const id = this._getId(cafe, idx);
      nextIds.add(id);

      const lat = Number(cafe.yPoint); // 위도
      const lng = Number(cafe.xPoint); // 경도
      if (!isFinite(lat) || !isFinite(lng)) return;

      const pos = new this.maps.LatLng(lat, lng);
      bounds.extend(pos);

      if (this.markers.has(id)) {
        // 기존 마커 업데이트
        const marker = this.markers.get(id);
        const current = marker.getPosition();
        if (current.lat() !== lat || current.lng() !== lng) {
          marker.setPosition(pos);
        }
        if (marker.getTitle?.() !== cafe.storeName) {
          marker.setTitle?.(cafe.storeName);
        }
      } else {
        // 새 마커 생성
        // const marker = new this.maps.Marker({
        //   position: pos,
        //   map: this.map,
        //   title: cafe.storeName,
        // });
        const markerOptions = {
          position: pos,
          map: this.map,
          title: cafe.storeName,
        };

        // 아이콘을 파라미터로 받아왔다면 아이콘을 세팅
        if (this.cafeIcon) {
          markerOptions.icon = {
            url: this.cafeIcon,
            size: new this.maps.Size(36, 36), // 원본 크기
            scaledSize: new this.maps.Size(36, 36), // 스케일된 크기
            origin: new this.maps.Point(0, 0),
            anchor: new this.maps.Point(18, 36), // 아래쪽 중앙 기준
          };
        }
        const marker = new this.maps.Marker(markerOptions);

        // 마커 클릭 시 상세 말풍선 나오는 이벤트 추가 (자세히 보기 포함)
        this.maps.Event.addListener(marker, "click", () => {
          const html = this._buildInfoHtml(cafe);
          this.infoWindow.setContent(html);
          this.infoWindow.open(this.map, marker);
        });

        this.markers.set(id, marker);
      }
    });

    // 필요 없는 마커 제거
    for (const [id, marker] of this.markers.entries()) {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        this.markers.delete(id);
      }
    }

    // 뷰 조정
    if (cafes.length === 1) {
      const only = cafes[0];
      const center = new this.maps.LatLng(
        Number(only.yPoint),
        Number(only.xPoint)
      );
      this.map.setCenter(center);
      if (this.map.getZoom() > 17) this.map.setZoom(17);
    } else if (cafes.length > 1) {
      this.map.fitBounds(bounds); // 줌이 빠지게 됨.
      // this.map.setZoom(15); // 줌 기본 세팅
    }
  }

  /**
   * 리스트에서 선택한 카페를 지도에서도 선택한 것처럼 보여주기
   * @param {string|number} cafeId
   * @param {object} cafe - 리스트에서 넘어온 원본 데이터
   */
  focusCafe(cafeId, cafe) {
    if (!cafe) return;

    // 리스트에서 _mmId를 넘겼을 수도 있으니, 동일 규칙으로 id 계산
    const id = this._getId({ ...cafe, _mmId: cafeId });
    const marker = this.markers.get(id) || this.markers.get(cafeId);
    if (!marker) return;

    const pos = marker.getPosition();
    this.map.setCenter(pos);

    // 클릭 말풍선과 동일한 템플릿 사용
    const html = this._buildInfoHtml(cafe);
    this.infoWindow.setContent(html);
    this.infoWindow.open(this.map, marker);
  }

  clear() {
    for (const [, marker] of this.markers) {
      marker.setMap(null);
    }
    this.markers.clear();
    this.infoWindow?.close();
  }

  destroy() {
    this.clear();
    this.infoWindow = null;
    this.map = null;
    this.maps = null;
  }
}
