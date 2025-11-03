// https://zindex.tistory.com/313 블로그 참조

import React, { forwardRef, useState } from 'react';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko';
import { getMonth, getYear, getDate } from 'date-fns'; // date-fns 모듈 사용은 유지
import dayjs from 'dayjs'; // dayjs 모듈 사용은 유지

// MUI 아이콘
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// CSS 파일 경로 가정
import './calendarCustomThree.scss';

// 날짜 한국어로 표시 등록 (date-fns 사용)
registerLocale('ko', ko);

// CustomInput 컴포넌트 (Ref 전달을 위해 forwardRef 사용)
const CustomInput = forwardRef((props, ref) => {
  return (
    <div className="calendar-input-wrap">
      {/* DatePicker에서 전달되는 props를 input에 전달합니다. */}
      <input {...props} ref={ref} type="text" readOnly />
      <CalendarMonthIcon />
    </div>
  );
});

// displayName 설정 (선택 사항)
CustomInput.displayName = 'CustomInput';

export default function CalendarCustomThree() {
  // ⭐️ useState 타입 제거 및 초기화 수정 (순수 JS 문법)
  const [startDate, setStartDate] = useState(new Date());

  // 연도 선택 select box에 보여질 데이터: lodash 대신 Array.from()을 사용합니다.
  const currentYear = getYear(new Date());
  const startYear = currentYear - 10;
  const yearCount = currentYear - startYear + 1; // 연도 개수

  // startYear부터 currentYear까지의 배열 생성 (순수 JS)
  const years = Array.from(
    { length: yearCount },
    (_, index) => startYear + index
  );

  // 월 선택 select box에 보여질 데이터 (문자열로 유지)
  const months = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ];

  // 선택된 날짜 포맷팅
  const date = startDate ? dayjs(startDate).format('YYYY-MM-DD') : '';

  // 캘린더의 최소/최대 날짜 설정
  // minDate: years 배열의 첫 번째 해 (10년 전)의 1월 1일로 설정
  const minDate = new Date(startYear, 0, 1); // 0은 1월을 의미
  // maxDate: 현재 날짜
  const maxDate = new Date();

  return (
    <div className="custom-wrap3">
      <DatePicker
        // Input 커스텀
        customInput={<CustomInput />}
        // Header 커스텀
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div
            style={{
              margin: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* 이전 달 버튼 */}
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="month-button"
            >
              <ArrowBackIosIcon style={{ width: 18, height: 18 }} />
            </button>

            {/* 연도 선택 Select Box */}
            <select
              value={getYear(date)}
              // changeYear는 Number 타입의 인수를 받으므로 Number()로 변환
              onChange={({ target: { value } }) => changeYear(Number(value))}
              className="selectbox year-select"
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}년
                </option>
              ))}
            </select>

            {/* 월 선택 Select Box */}
            <select
              // date-fns의 getMonth()는 0부터 시작하므로, months 배열의 인덱스로 사용
              value={months[getMonth(date)]}
              // 선택된 월 문자열을 months 배열에서 찾아 해당 인덱스(0~11)를 changeMonth에 전달
              onChange={({ target: { value } }) =>
                changeMonth(months.indexOf(value))
              }
              className="selectbox month-select"
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {option}월
                </option>
              ))}
            </select>

            {/* 다음 달 버튼 */}
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="month-button"
            >
              <ArrowForwardIosIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>
        )}
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        dayClassName={(d) => 'custom-day'}
        dateFormat="yyyy.MM.dd"
        disabledKeyboardNavigation
        locale="ko" // 한국어로 설정
        minDate={minDate}
        maxDate={maxDate}
        showPopperArrow={false}
      />
    </div>
  );
}
