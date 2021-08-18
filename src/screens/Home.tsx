import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  SectionList,
  Text,
  TextInput,
  LogBox,
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
import * as L from "../store/latestUpdate";
import * as S from "./Styles";
import moment from "moment";
import realm from "../models";
import Realm from "realm";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";

/*
Todo
3. 로컬 디비에서 deleted 데이터 삭제 로직 추가
 */

export default function Home() {
  LogBox.ignoreLogs([
    "Warning: Encountered two children with the same key, `1`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.",
  ]); // toSetMarkedDatesObjects 함수에서 objectKey 중복에 대한 경고 무시하기
  const [refresh, setRefresh] = useState<boolean>(true);
  const [today, setToday] = useState<string>(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState({});
  const [pastSelectedDate, setPastSelectedDate] = useState<string>();
  const [agendaData, setAgendaData] = useState<Array<any>>([]);
  const dispatch = useDispatch();

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
      objects[today] = {
        selected: true,
        selectedColor: S.colors.primary,
        dots: [],
      };
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
          start: arr[i].startTime?.slice(0, 5),
          end: arr[i].endTime?.slice(0, 5),
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
    if (refresh === true) {
      async function getDataFromServer(
        accessToken: string,
        latestUpdatedDate: string | null,
        renewUpdatedDate: string
      ) {
        // authroization 체크, True일 때 진행
        const isAuthorized = await axios.get("/api/users/is-authorized", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (isAuthorized.data.isAuthorized === true) {
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
          dispatch(L.setUpdatedDate(renewUpdatedDate));
        }
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

      // 서버에서 삭제된 이벤트 지우기
      realm.write(() => {
        const deletedEvents = realm
          .objects("Events")
          .filtered("deletedAt != null");
        realm.delete(deletedEvents);
      });
      setRefresh(false);
    }
  }, [refresh]); // 새로고침 dependancy로 넣기 (추가)

  useEffect(() => {
    setTimeout(() => {
      setRefresh(true);
      SplashScreen.hide();
    }, 1500);
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
      <View style={[styles.agendaContainer]}>
        <View
          style={{
            marginBottom: 10,
            flexDirection: "row",
          }}
        >
          <Text style={[styles.agendaText]}>일정</Text>
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
  agendaContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  agendaText: {
    fontFamily: S.fonts.bold,
    fontSize: 20,
  },
});
