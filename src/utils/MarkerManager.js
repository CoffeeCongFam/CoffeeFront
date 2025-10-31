// MarkerManager.js
// 지도 위 카페 마커들을 "차분 업데이트(diff)" 방식으로 관리하는 유틸 클래스.
// - React 상태/useEffect에 의존하지 않음 (완전 독립)
// - 카페 목록이 바뀔 때, 기존 마커를 모두 지우지 않고 변경분만 반영하여 성능 개선
// - InfoWindow는 1개만 만들어 재사용(필요할 때 내용만 교체해서 open)

export default class MarkerManager {
  /**
   * @param {naver.maps.Map} map   - Naver 지도 인스턴스
   * @param {typeof naver.maps} maps - naver.maps 네임스페이스 (생성자/유틸 접근용)
   */
  constructor(map, maps) {
    this.map = map;
    this.maps = maps;

    // 현재 지도에 올려진 마커들을 id -> Marker 형태로 보관
    this.markers = new Map();

    // InfoWindow(말풍선)는 1개만 만들어서 재사용 (메모리 절약 + 생성 비용 감소)
    this.infoWindow = new maps.InfoWindow({ content: "" });
  }

  /**
   * 카페 데이터로 마커를 동기화
   * @param {Array} cafes - [{id, storeName, xPoint(lat), yPoint(lng), roadAddress, detailAddress}, ...]
   *
   * 흐름:
   *  1) nextIds 집합에 새 데이터의 id들을 모아둔다.
   *  2) 새 리스트를 순회하며:
   *     - 기존 마커가 있으면 위치/타이틀만 변경(필요할 때만)
   *     - 없으면 새 마커 생성 + 클릭 이벤트 연결
   *     - 지도 영역(bounds) 갱신
   *  3) 기존에 있었지만 이제는 없는 id의 마커는 지도에서 제거(가비지)
   *  4) 마커 수에 따라 지도의 뷰를 적절히 조정(1개면 center, 여러 개면 fitBounds)
   */
  setData(cafes) {
    const nextIds = new Set(); // 이번에 유지/생성할 마커들의 id
    const bounds = new this.maps.LatLngBounds(); // 지도 화면 영역 계산용

    cafes.forEach((cafe, idx) => {
      // 마커 식별용 id 결정: 우선순위 (cafe.id) > (cafe.storeId) > (인덱스 기반 임시키)
      const id = cafe.id ?? cafe.storeId ?? `idx-${idx}`;
      nextIds.add(id);

      // 경위도 숫자 변환 (문자열일 수 있어서 Number로 안전 변환)
      const lat = Number(cafe.xPoint);
      const lng = Number(cafe.yPoint);
      if (!isFinite(lat) || !isFinite(lng)) return; // 좌표 이상 시 스킵

      const pos = new this.maps.LatLng(lat, lng);
      bounds.extend(pos); // 화면 영역 계산에 포함

      if (this.markers.has(id)) {
        // ─ 기존 마커가 존재: 바뀐 게 있을 때만 최소 변경
        const marker = this.markers.get(id);
        const current = marker.getPosition();

        // 위치가 달라졌다면 이동
        if (current.lat() !== lat || current.lng() !== lng) {
          marker.setPosition(pos);
        }
        // 타이틀이 달라졌다면 반영 (getTitle 지원 여부는 SDK 버전에 따라 다를 수 있어 optional chaining)
        if (marker.getTitle?.() !== cafe.storeName) {
          marker.setTitle?.(cafe.storeName);
        }
      } else {
        // ─ 마커가 없다: 새로 생성
        const marker = new this.maps.Marker({
          position: pos,
          map: this.map,
          title: cafe.storeName,
        });

        // 마커 클릭 시 InfoWindow 오픈 (내용만 교체해서 재사용)
        // this.maps.Event.addListener(marker, "click", () => {
        //   const html = `
        //     <div style="padding:8px 10px; font-size:12px;">
        //       <b>${cafe.storeName ?? ""}</b><br/>
        //       <div>${cafe.roadAddress ?? ""}</div>
        //       <div style="color:#666;">${cafe.detailAddress ?? ""}</div>
        //     </div>`;
        //   this.infoWindow.setContent(html);
        //   this.infoWindow.open(this.map, marker);
        // });

        this.maps.Event.addListener(marker, "click", () => {
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

          const actionButton = cafe.isSubscribed
            ? `<button style="
                  background:#fff;
                  border:1px solid #aaa;
                  color:#333;
                  border-radius:20px;
                  font-size:12px;
                  padding:3px 10px;
                  margin-top:6px;
                  cursor:default;
                ">✓ 구독중</button>`
            : `<button style="
                  background:#000;
                  color:#fff;
                  border:none;
                  border-radius:20px;
                  font-size:12px;
                  padding:4px 12px;
                  margin-top:6px;
                  cursor:pointer;
                ">+ 구독하기</button>`;

          // 상세 보기 버튼 (라우팅 링크)
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

          const html = `
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
              <img src="${cafe.storeImage ?? ""}" 
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
                ${stockInfo}
                <div style="font-size:12px; color:#444; margin-top:3px;">
                  👥 ${cafe.subscriberCount ?? 0}명 · ⭐ ${
            cafe.reviewCount ?? 0
          }개
                </div>
                <div style="margin-top:6px; display:flex; gap:6px; align-items:center;">
                  ${actionButton}
                  ${detailButton}
                </div>
              </div>
            </div>
          `;

          this.infoWindow.setContent(html);
          this.infoWindow.open(this.map, marker);
        });

        // 등록
        this.markers.set(id, marker);
      }
    });

    // ─ 더 이상 필요 없는 마커들 제거 (새 목록에 id가 없으면 제거)
    for (const [id, marker] of this.markers.entries()) {
      if (!nextIds.has(id)) {
        marker.setMap(null); // 지도에서 제거
        this.markers.delete(id); // Map에서도 제거
      }
    }

    // ─ 화면 뷰 조정: 0개면 그대로, 1개면 center/zoom, 여러 개면 bounds에 맞춤
    if (cafes.length === 1) {
      const only = cafes[0];
      const center = new this.maps.LatLng(
        Number(only.xPoint),
        Number(only.yPoint)
      );
      this.map.setCenter(center);
      // 너무 확대되어 있으면 적당히(예: 17)로
      if (this.map.getZoom() > 17) this.map.setZoom(17);
    } else if (cafes.length > 1) {
      this.map.fitBounds(bounds);
    }
  }

  /**
   * 리스트에서 선택한 카페를 지도에서도 선택한 것처럼 보여주기
   * @param {string|number} cafeId
   * @param {object} cafe (옵션) - 리스트에서 넘어온 원본 데이터
   */
  focusCafe(cafeId, cafe) {
    const marker = this.markers.get(cafeId);
    if (!marker) return;

    // 지도 중심 이동
    const pos = marker.getPosition();
    this.map.setCenter(pos);

    // 말풍선 내용
    const html = `
      <div style="padding:8px 10px; font-size:12px;">
        <b>${cafe?.storeName ?? ""}</b><br/>
        <div>${cafe?.roadAddress ?? ""}</div>
        <div style="color:#666;">${cafe?.detailAddress ?? ""}</div>
      </div>
    `;
    this.infoWindow.setContent(html);
    this.infoWindow.open(this.map, marker);
  }

  /**
   * 모든 마커/말풍선 닫기 (지도는 유지)
   * - 리스트를 비우거나 다른 화면으로 넘어가기 전에 호출 가능
   */
  clear() {
    for (const [, marker] of this.markers) {
      marker.setMap(null);
    }
    this.markers.clear();
    this.infoWindow?.close();
  }

  /**
   * 리소스 완전 해제
   * - 컴포넌트 unmount 시 호출
   */
  destroy() {
    this.clear();
    this.infoWindow = null;
    this.map = null;
    this.maps = null;
  }
}
