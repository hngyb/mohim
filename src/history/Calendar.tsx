import React, { FC, ComponentProps } from "react";
import { Agenda } from "react-native-calendars";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar, Card } from "react-native-paper";
import { LocaleConfig } from "react-native-calendars";
import { Colors } from "react-native-paper";
import * as C from "../utils";
import Color from "color";
import { green100 } from "react-native-paper/lib/typescript/styles/colors";

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

type AgendaProps = ComponentProps<typeof Agenda>;

export const Calendar: FC<AgendaProps> = ({
  items,
  loadItemsForMonth,
  renderItem,
}) => {
  return (
    <Agenda
      selected={C.timeToString(Date.now())}
      items={items}
      loadItemsForMonth={loadItemsForMonth}
      renderItem={renderItem}
      refreshing={true}
      theme={{
        // calendar
        // "stylesheet.calendar.header": {
        //   dayTextAtIndex0: {
        //     color: Colors.red500,
        //   },
        //   dayTextAtIndex6: {
        //     color: Colors.blue500,
        //   },
        // },
        calendarBackground: "white",
        // todayBackgroundColor: colors.primary,
        // selectedDayBackgroundColor: colors.primary, // calendar sel date
        // dotColor: "white", // dots
        // month
        textMonthFontWeight: "bold",
        textMonthFontSize: 20,
        // day names
        textSectionTitleColor: Colors.grey500,
        textDayHeaderFontSize: 14,
        textDayHeaderFontWeight: "500",
        // dates
        textDayFontSize: 18,
        textDayFontWeight: "500",
        // agenda
        backgroundColor: "white", // background color below agenda
        agendaDayNumColor: Colors.grey500, // day number
        agendaDayTextColor: Colors.grey500, // day name
        // agendaTodayColor:  colors.primary // today in list
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
