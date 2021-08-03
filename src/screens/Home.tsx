import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  SectionList,
  Text,
  TextInput,
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import {
  NavigationHeader,
  TouchableView,
  CalendarView,
  dayType,
  Agenda,
} from "../components";
import * as U from "../utils";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import realm from "../models";
import axios from "axios";

/*
Todo
1. 캘린더 구현
2. search bar 구현 in header
2. 서버에서 정보 가져오기
 */

export default function Home() {
  const [today, setToday] = useState<string>(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState({});
  const [pastSelectedDate, setPastSelectedDate] = useState<string>();

  const onDayPress = useCallback(
    (day: dayType) => {
      const selectedDate = day.dateString;
      const newMark = {
        ...markedDates,
        [pastSelectedDate]: {
          ...markedDates[pastSelectedDate],
          selected: false,
        },
        [selectedDate]: { ...markedDates[selectedDate], selected: true },
      };
      setMarkedDates(newMark);
      if (selectedDate === today) {
        setPastSelectedDate("");
      } else {
        setPastSelectedDate(selectedDate);
      }
      // 아래 일정 정보 표시
    },
    [markedDates]
  );

  useEffect(() => {
    async function getDataFromServer(
      accessToken: string,
      latestUpdatedDate: string | null
    ) {
      const followGroupIds = await realm.objects("Follows");
      followGroupIds.forEach(async (groupId: any) => {
        const response = await axios.get("/api/events/", {
          params: {
            groupId: groupId.groupId,
            date: latestUpdatedDate,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const toBeUpdatedData = response.data;
        toBeUpdatedData.forEach((data: any) => {
          realm.write(() => {
            const event = realm.create("Events", {
              id: data.id,
              groupId: data.GroupId,
              title: data.title,
              date: data.date.split("T")[0],
              startTime: data.startTime,
              endTime: data.endTime,
              location: data.location,
              notice: data.notice,
              contents: data.contents,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
        });
      });
    }
    // 로컬 DB 와 서버 DB 동기화
    U.readFromStorage("accessJWT").then((accessToken) => {
      U.readFromStorage("latestUpdatedDate")
        .then((value) => {
          const latestUpdatedDate = value.length === 0 ? null : value;
          getDataFromServer(accessToken, latestUpdatedDate);
        })
        .catch((e) => console.log(e));
    });

    /*
    "YYYY-MM-DD": {dots: [{key: "그룹명", color: "그룹별 색"}]}
     */
    const toBeMarkedDates = realm.objects("Events");
    console.log(toBeMarkedDates);
    setMarkedDates({
      [today]: { selected: true, selectedColor: "#00adf5" }, // 전개 연산 복사 필요
      "2021-07-24": {
        selected: false,
        dots: [
          { key: "일산교회", color: "blue" },
          { key: "미디어선교부", color: "red" },
          { key: "청년회", color: "orange" },
          { key: "23구역", color: "purple" },
        ],
      },
      "2021-07-25": {
        selected: false,
        dots: [
          { key: "일산교회", color: "blue" },
          { key: "교회학교", color: "green" },
        ],
      },
    });
    SplashScreen.hide();
  }, []);

  const DATA = [
    {
      title: "청년회 전체교제",
      data: [
        {
          group: "청년회",
          attendees: "참석자",
          location: "교회당",
          start: "오후 7시",
          end: "오후 9시",
          summary: "설명",
          color: "red",
        },
      ],
    },
    {
      title: "청년회 전체교제",
      data: [
        {
          group: "청년회",
          attendees: "참석자",
          location: "교회당",
          start: "오후 7시",
          end: "오후 9시",
          summary: "설명",
          color: "blue",
        },
      ],
    },
    {
      title: "청년회 전체교제",
      data: [
        {
          group: "청년회",
          attendees: "참석자",
          location: "교회당",
          start: "오후 7시",
          end: "오후 9시",
          summary: "설명",
          color: "green",
        },
      ],
    },
    {
      title: "청년회 전체교제",
      data: [
        {
          group: "청년회",
          attendees: "참석자",
          location: "교회당",
          start: "오후 7시",
          end: "오후 9시",
          summary: "설명",
          color: "yellow",
        },
      ],
    },
  ];
  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => <TextInput></TextInput>}
        Right={() => <TouchableView></TouchableView>}
      ></NavigationHeader>
      <View style={[styles.calendarViewContainer]}>
        <CalendarView onDayPress={onDayPress} markedDates={markedDates} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 26 }}>
        <View
          style={{
            marginBottom: 10,
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>일정</Text>
        </View>
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={DATA}
          renderItem={({ item, section }) => (
            <Agenda title={section.title} data={item} />
          )}
          keyExtractor={(item, index) => item.group + index}
        />
      </View>
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
