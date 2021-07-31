import React, { FC, ComponentProps } from "react";
import {
  Calendar,
  CalendarBaseProps,
  CalendarMarkingProps,
  MultiDotMarking,
} from "react-native-calendars";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar, Card } from "react-native-paper";
import { LocaleConfig } from "react-native-calendars";
import { Colors } from "react-native-paper";
import * as C from "../utils";
import Color from "color";

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
}) => {
  return (
    <Calendar
      markingType="multi-dot"
      onDayPress={onDayPress}
      markedDates={markedDates}
      monthFormat={"yyyy년 MM월"}
      theme={{
        // calendar
        calendarBackground: "white",
        arrowColor: "lightgrey",
        // month
        textMonthFontWeight: "bold",
        textMonthFontSize: 20,
        // day names
        "stylesheet.calendar.header": {
          dayTextAtIndex0: {
            color: Colors.red500,
          },
        },
        textSectionTitleColor: "lightgrey",
        textDayHeaderFontSize: 12,
        textDayHeaderFontWeight: "500",
        // dates
        textDayFontSize: 14,
        textDayFontWeight: "bold",
        textDisabledColor: "lightgrey",
        todayTextColor: "#00adf5",
        selectedDayTextColor: "#ffffff",
      }}
    />
  );
};

export const renderItem = (item) => {
  return (
    <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
      <Card>
        <Card.Content>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>{item.name}</Text>
            <Avatar.Text label="J" />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};
