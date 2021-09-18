import React, { FC } from "react";
import {
  Calendar,
  CalendarBaseProps,
  CalendarList,
  CalendarMarkingProps,
  MultiDotMarking,
} from "react-native-calendars";
import { LocaleConfig } from "react-native-calendars";
import { Colors } from "react-native-paper";
import * as S from "../screens/Styles";

LocaleConfig.locales["kor"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "kor";

type CalendarViewProps = CalendarBaseProps &
  CalendarMarkingProps & {
    markedDates: {
      [date: string]: MultiDotMarking;
    };
  };

export type dayType = {
  dateString: string;
  day: number;
  month: number;
  timestamp: number;
  year: number;
};

export const CalendarView: FC<CalendarViewProps> = ({
  onDayPress,
  markedDates,
  onVisibleMonthsChange,
}) => {
  return (
    <CalendarList
      horizontal
      onVisibleMonthsChange={onVisibleMonthsChange}
      pagingEnabled={true}
      markingType="multi-dot"
      onDayPress={onDayPress}
      markedDates={markedDates}
      key={1}
      monthFormat={"yyyy년 MM월"}
      theme={{
        // calendar
        // month, day header
        "stylesheet.calendar.header": {
          dayTextAtIndex0: {
            color: Colors.red500,
          },
          monthText: {
            textAlign: "center",
            fontFamily: S.fonts.bold,
            fontSize: 20,
            flex: 1,
          },
        },
        textSectionTitleColor: S.colors.secondary,
        textDayFontFamily: S.fonts.medium,
        textDayFontWeight: "500",
        textDayHeaderFontSize: 12,
        // dates
        textDayFontSize: 14,
        textDayHeaderFontFamily: S.fonts.bold,
        textDisabledColor: S.colors.secondary,
        selectedDayBackgroundColor: S.colors.secondary,
        selectedDayTextColor: "#ffffff",
      }}
    />
  );
};
