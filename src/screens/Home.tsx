import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  SectionList,
  Text,
  TextInput,
  LogBox,
  Alert,
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
import * as I from "../store/isAuthorized";
import * as S from "./Styles";
import * as A from "../store/asyncStorage";
import moment from "moment";
import realm from "../models";
import Realm from "realm";
import axios from "axios";
import { useDispatch, useStore } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";

export default function Home() {
  LogBox.ignoreLogs([
    "Warning: Encountered two children with the same key, `1`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.",
  ]); // toSetMarkedDatesObjects 함수에서 objectKey 중복에 대한 경고 무시하기
  const store = useStore();
  const { email } = store.getState().login.loggedUser;
  const [refresh, setRefresh] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [today, setToday] = useState<string>(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState<any>({});
  const [pastSelectedDate, setPastSelectedDate] = useState<string>("");
  const [agendaData, setAgendaData] = useState<Array<any>>([]);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  useEffect(() => {
    setRefresh(true);
  }, [isFocused]);

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
        .filtered(
          `date == "${selectedDate}" and deletedAt == null and userId = "${email}"`
        )
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
        const groupInfo: any = realm
          .objects("Follows")
          .filtered(`userId == "${email}" and groupId == ${arr[i].groupId}`);
        const color = groupInfo[0].color;
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
      const groupColor: any = realm
        .objects("Follows")
        .filtered(`userId == "${email}" and groupId == ${arr[i].groupId}`);
      const color = groupColor[0].color;
      object.title = arr[i].title;
      object.data = [
        {
          group: groupName,
          location: arr[i].location,
          start: arr[i].startTime?.slice(0, 5),
          end: arr[i].endTime?.slice(0, 5),
          notice: arr[i].notice,
          memo: arr[i].memo,
          color: color,
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
        await axios
          .get("/api/users/is-authorized", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .then((response) => {
            setIsAuthorized(response.data.isAuthorized);
          })
          .catch((e) => {
            const errorStatus = e.response.status;
            if (errorStatus === 401) {
              // accessToken 만료
              U.readFromStorage("refreshJWT").then((refreshToken: any) => {
                // accessToken 재발급
                axios
                  .get("/api/users/refresh-access", {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                  })
                  .then((response) => {
                    const renewedAccessToken = response.data.accessToken;
                    U.writeToStorage("accessJWT", renewedAccessToken);
                    dispatch(A.setJWT(renewedAccessToken, refreshToken));
                  })
                  .then(() => {
                    // 재요청
                    axios
                      .get("/api/users/is-authorized", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                      })
                      .then((response) => {
                        setIsAuthorized(response.data.isAuthorized);
                      });
                  });
              });
            } else {
              Alert.alert("비정상적인 접근입니다");
            }
          });
        if (isAuthorized === true) {
          // isAuthorized 상태 저장
          dispatch(I.setIsAuthorized(isAuthorized));

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
                  userId: email,
                  color: data.color,
                  isBelongTo: data.isBelongTo,
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
            .filtered(`deletedAt == null and userId == "${email}"`);
          await followGroupIds.forEach(async (groupId: any) => {
            // 기존에 soft deleted event 복구
            realm.write(() => {
              const events = realm
                .objects("Events")
                .filtered(
                  `deletedAt != null and userId == "${email}" and groupId == "${groupId.groupId}"`
                )
                .forEach((event: any) => {
                  realm.create("Events", {
                    id: event.id,
                    deletedAt: null,
                  });
                });
            });
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
                "Follows",
                data.GroupId
              );
              const groupColor = groupInfo.color;
              realm.write(() => {
                const event = realm.create(
                  "Events",
                  {
                    id: data.id,
                    userId: email,
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
          realm.write(() => {
            realm.create(
              "LatestUpdatedDates",
              {
                userId: email,
                latestDate: renewUpdatedDate,
              },
              Realm.UpdateMode.Modified
            );
          });
        }
      }
      // 로컬 DB 와 서버 DB 동기화
      U.readFromStorage("accessJWT")
        .then((accessToken) => {
          const updatedDate: any = realm.objectForPrimaryKey(
            "LatestUpdatedDates",
            email
          );
          let latestUpdatedDate = null;
          updatedDate != null
            ? (latestUpdatedDate = updatedDate.latestDate)
            : null;
          return { latestUpdatedDate, accessToken };
        })
        .then(({ latestUpdatedDate, accessToken }) => {
          const renewUpdatedDate = moment().format("YYYY-MM-DD");
          getDataFromServer(accessToken, latestUpdatedDate, renewUpdatedDate); // latestUpdateDate 정책 수정 필요, 일단 latestUpdatedDate => null
        });

      // 캘린더 마킹
      const toBeMarkedDates = realm
        .objects("Events")
        .filtered(`deletedAt == null and userId = "${email}"`);
      const toBeMarkedDatesObjects = toSetMarkedDatesObjects(toBeMarkedDates);
      setMarkedDates(toBeMarkedDatesObjects);

      // 오늘의 아젠다 불러오기
      const todayAgenda = realm
        .objects("Events")
        .filtered(
          `date == "${today}" && deletedAt == null && userId == "${email}"`
        )
        .sorted("startTime");
      setAgendaData(toAgendaType(todayAgenda));

      // 서버에서 삭제된 이벤트 지우기
      // realm.write(() => {
      //   const deletedEvents = realm
      //     .objects("Events")
      //     .filtered(`deletedAt != null && userId == "${email}"`);
      //   realm.delete(deletedEvents);
      // });
      setRefresh(false);
    }
  }, [refresh]); // 새로고침 dependancy로 넣기 (추가)

  useEffect(() => {
    const id = setTimeout(() => {
      setRefresh(true);
      setLoading(false);
      SplashScreen.hide();
    }, 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <SafeAreaView style={[styles.container]}>
      {loading && (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={S.colors.primary}
        />
      )}
      {!loading && (
        <View style={{ flex: 1 }}>
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
              disableVirtualization={false}
              stickySectionHeadersEnabled={false}
              sections={agendaData}
              renderItem={({ item, section }) => (
                <Agenda title={section.title} data={item} />
              )}
              keyExtractor={(item, index) => item.group + index}
            />
          </View>
        </View>
      )}
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
