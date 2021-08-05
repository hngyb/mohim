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
import Realm from "realm";
import axios from "axios";

/*
Todo
2. 성도 인증할 때 사용자가 그룹 색깔도 함께 설정
3. 로컬 디비에서 deleted 데이터 삭제 로직 추가
 */

export default function Home() {
  const [today, setToday] = useState<string>(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState({});
  const [pastSelectedDate, setPastSelectedDate] = useState<string>();
  const [agendaData, setAgendaData] = useState<Array<any>>([]);

  const onDayPress = useCallback(
    (day: dayType) => {
      const selectedDate = day.dateString;
      // markDates 업데이트
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
      // 아젠다 업데이트
      const agenda = realm
        .objects("Events")
        .filtered(`date == "${selectedDate}"`)
        .sorted("startTime");
      setAgendaData(toAgendaType(agenda));
    },
    [markedDates, agendaData]
  );

  const toSetMarkedDatesObjects = useCallback(
    (arr: Realm.Results<Realm.Object | any>) => {
      const objects: any = {};
      objects[today] = { selected: true, selectedColor: "#00adf5", dots: [] };
      for (let i = 0; i < arr.length; ++i) {
        const objectKey = arr[i].date;
        const groupId = arr[i].groupId.toString();
        const color = arr[i].color;
        const selected = objectKey === today ? true : false;
        objectKey in objects
          ? (objects[objectKey] = {
              ...objects[objectKey],
              dots: [
                ...objects[objectKey].dots,
                { key: groupId, color: color },
              ],
            })
          : (objects[objectKey] = {
              selected: selected,
              dots: [{ key: groupId, color: color }],
            });
      }

      return objects;
    },
    []
  );

  const toAgendaType = useCallback((arr: Realm.Results<Realm.Object | any>) => {
    const agenda = [];
    for (let i = 0; i < arr.length; ++i) {
      const object: any = {};
      const groupInfo: any = realm.objectForPrimaryKey(
        "Groups",
        arr[i].groupId
      );
      const groupName = groupInfo.name;
      object.title = arr[i].title;
      object.data = [
        {
          group: groupName,
          location: arr[i].location,
          start: arr[i].startTime.slice(0, 5),
          end: arr[i].endTime.slice(0, 5),
          notice: arr[i].notice,
          memo: arr[i].memo,
          color: arr[i].color,
        },
      ];
      agenda.push(object);
    }
    return agenda;
  }, []);

  useEffect(() => {
    // 샘플 데이터 생성
    realm.write(() => {
      const group1 = realm.create(
        "Groups",
        {
          id: 1,
          name: "일산교회",
          church: "일산교회",
          isPublic: true,
          color: "red",
        },
        Realm.UpdateMode.Modified
      );
      const group2 = realm.create(
        "Groups",
        {
          id: 2,
          name: "청년회",
          church: "일산교회",
          isPublic: true,
          color: "blue",
        },
        Realm.UpdateMode.Modified
      );
      const follow1 = realm.create(
        "Follows",
        {
          groupId: 1,
        },
        Realm.UpdateMode.Modified
      );
      const follow2 = realm.create(
        "Follows",
        {
          groupId: 2,
        },
        Realm.UpdateMode.Modified
      );
    });

    // belongTo 와 follow 서버와 동기화 추가하기
    async function getDataFromServer(
      accessToken: string,
      latestUpdatedDate: string | null,
      renewUpdatedDate: string
    ) {
      // const GroupId = 1;
      // axios.post(
      //   "/api/follows/",
      //   {
      //     GroupId,
      //   },
      //   { headers: { Authorization: `Bearer ${accessToken}` } }
      // );

      // belongTo 서버 동기화
      const belongToGroups = await axios.get("/api/belong-tos/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const belongToGroupsArray = belongToGroups.data;
      belongToGroupsArray.forEach((data: any) => {
        realm.write(() => {
          const belongToGroup = realm.create(
            "BelongTos",
            {
              groupId: data.GroupId,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              deletedAt: data.deletedAt,
            },
            Realm.UpdateMode.Modified
          );
        });
      });

      // follow 서버 동기화
      const followGroups = await axios.get("/api/follows/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const followGroupsArray = followGroups.data;
      followGroupsArray.forEach((data: any) => {
        realm.write(() => {
          const followGroup = realm.create(
            "Follows",
            {
              groupId: data.GroupId,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              deletedAt: data.deletedAt,
            },
            Realm.UpdateMode.Modified
          );
        });
      });

      // follow 그룹에 속한 이벤트 동기화
      const followGroupIds = await realm
        .objects("Follows")
        .filtered("deletedAt == null");
      await followGroupIds.forEach(async (groupId: any) => {
        const response = await axios.get("/api/events/", {
          params: {
            groupId: groupId.groupId,
            date: latestUpdatedDate,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const toBeUpdatedData = response.data;
        toBeUpdatedData.forEach((data: any) => {
          const groupInfo: any = realm.objectForPrimaryKey(
            "Groups",
            data.GroupId
          );
          const groupColor = groupInfo.color;
          realm.write(() => {
            const event = realm.create(
              "Events",
              {
                id: data.id,
                groupId: data.GroupId,
                title: data.title,
                date: data.date.split("T")[0],
                startTime: data.startTime,
                endTime: data.endTime,
                location: data.location,
                notice: data.notice,
                color: groupColor,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                deletedAt: data.deletedAt,
              },
              Realm.UpdateMode.Modified
            );
          });
        });
      });
      await U.writeToStorage("latestUpdatedDate", renewUpdatedDate);
    }
    // 로컬 DB 와 서버 DB 동기화
    U.readFromStorage("accessJWT").then((accessToken) => {
      U.readFromStorage("latestUpdatedDate")
        .then((value) => {
          const latestUpdatedDate = value.length === 0 ? null : value;
          const renewUpdatedDate = moment().format("YYYY-MM-DD");
          getDataFromServer(accessToken, latestUpdatedDate, renewUpdatedDate);
        })
        .catch((e) => console.log(e));
    });

    // 캘린더 마킹
    const toBeMarkedDates = realm
      .objects("Events")
      .filtered("deletedAt == null");
    const toBeMarkedDatesObjects = toSetMarkedDatesObjects(toBeMarkedDates);
    setMarkedDates(toBeMarkedDatesObjects);

    // 오늘의 아젠다 불러오기
    const todayAgenda = realm
      .objects("Events")
      .filtered(`date == "${today}" and deletedAt == null`)
      .sorted("startTime");
    setAgendaData(toAgendaType(todayAgenda));

    // deleted data 지우기

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
          sections={agendaData}
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
