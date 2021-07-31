import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import SplashScreen from "react-native-splash-screen";
import {
  NavigationHeader,
  TouchableView,
  CalendarView,
  renderItem,
  dayType,
} from "../components";
import * as C from "../utils";
import Icon from "react-native-vector-icons/Ionicons";
import { TextInput } from "react-native-gesture-handler";

/*
Todo
1. 캘린더 구현
2. search bar 구현 in header
2. 서버에서 정보 가져오기
 */

export default function Home() {
  const [markedDates, setMarkedDates] = useState({
    "2021-07-24": { selected: false, dots: [ {key: "일산교회", color: "blue"},{key: "미디어선교부", color: "red"},{key: "청년회", color: "orange"},{key: "23구역", color: "purple"}]},
    "2021-07-25": { selected: false, dots: [ {key: "일산교회", color: "blue"},{key: "교회학교", color: "green"} ]},
  });
  const [pastSelectedDate, setPastSelectedDate] = useState<string>("");

  const onDayPress = useCallback((day: dayType) => {
    const selectedDate = day.dateString;
    const newMark = {
      ...markedDates,
      [pastSelectedDate]: {...markedDates.[pastSelectedDate], selected: false},
      [selectedDate]: {...markedDates.[selectedDate], selected: true },
    };
    setMarkedDates(newMark);
    setPastSelectedDate(selectedDate)
    // 아래 일정 정보 표시
  }, [markedDates]);

  useEffect(() => {
    // 서버에서 정보 가져오기 -> markedDates initialize
    SplashScreen.hide();
  }, []);

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => <TextInput></TextInput>}
        Right={() => <TouchableView></TouchableView>}
      ></NavigationHeader>
      <View style={[styles.calendarViewContainer]}>
        <CalendarView onDayPress={onDayPress} markedDates={markedDates} />
      </View>
      <View style={{ flex: 1, backgroundColor: "black" }}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarViewContainer: {
    flex: 1,
  },
});
