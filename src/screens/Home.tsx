import React, { useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { useDispatch, useStore } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import { isEqual } from "lodash";
import { getCookie } from "../utils";

export default function Home() {
  LogBox.ignoreLogs(["Warning: Encountered two children with the same key,"]); // toSetMarkedDatesObjects 함수에서 objectKey 중복에 대한 경고 무시하기

  const store = useStore();
  const { accessJWT } = store.getState().asyncStorage;
  const [accessToken, setAccessToken] = useState<string>(accessJWT);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [today, setToday] = useState<string>(moment().format("YYYY-MM-DD"));
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(
    moment().format("YYYY-MM")
  );
  const [monthlyEventData, setMonthEventData] = useState<Array<any>>([]);
  const prevMonthEventData = useRef(monthlyEventData);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [pastSelectedDate, setPastSelectedDate] = useState<string>("");
  const [agendaData, setAgendaData] = useState<Array<any>>([]);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    // Authorization Check
    checkAuthorized().catch(async (e) => {
      const errorStatus = e.response.status;
      if (errorStatus === 401) {
        // accessToken 만료 -> accessToken 업데이트
        await updateToken();
      } else {
        Alert.alert("비정상적인 접근입니다");
      }
    });
  }, [accessToken]);

  useEffect(() => {
    // Get monthly data from server
    getMonthlyEventDataFromServer().catch(async (e) => {
      const errorStatus = e.response.status;
      if (errorStatus === 401) {
        // accessToken 만료 -> accessToken 업데이트
        await updateToken();
      } else {
        Alert.alert("비정상적인 접근입니다");
      }
    });
  }, [isAuthorized, isFocused, currentYearMonth, accessToken]);

  useEffect(() => {
    // 캘린더 마킹
    if (
      monthlyEventData &&
      !isEqual(monthlyEventData, prevMonthEventData.current)
    ) {
      prevMonthEventData.current = monthlyEventData;
      setMarkedDates({});
      markCalendar();
      setLoading(false);
    }
  });

  const updateToken = async () => {
    U.readFromStorage("refreshJWT").then((refreshJWT: any) => {
      // accessJWT 재발급
      axios
        .get("/api/users/refresh-access", {
          headers: { Authorization: `Bearer ${refreshJWT}` },
        })
        .then((response) => {
          const tokens = response.headers["set-cookie"][0];
          const renewedAccessToken = getCookie(tokens, "accessToken");
          U.writeToStorage("accessJWT", renewedAccessToken);
          dispatch(A.setJWT(renewedAccessToken, refreshJWT));
          setAccessToken(renewedAccessToken);
        });
    });
  };

  const checkAuthorized = async () => {
    await axios
      .get("/api/users/is-authorized", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        const isAuthorized = response.data.isAuthorized;
        setIsAuthorized(isAuthorized);
        dispatch(I.setIsAuthorized(isAuthorized));
      });
  };

  const getMonthlyEventDataFromServer = async () => {
    // 월별 이벤트 데이터 가져오기
    if (isAuthorized === true) {
      const followGroups = await axios.get("/api/follows/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const followGroupsArray = followGroups.data;
      const monthlyEvents: Array<any> = [];
      await Promise.all(
        followGroupsArray.map(async (group: any) => {
          const response = await axios.get("/api/events/monthly", {
            params: {
              groupId: group.GroupId,
              year: currentYearMonth.slice(0, 4),
              month: currentYearMonth.slice(5),
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const groupInfo: any = await axios.get("/api/groups/group-info", {
            params: {
              groupId: group.GroupId,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const events = await Promise.all(
            response.data.map((event: any) => ({
              ...event,
              color: group.color,
              groupName: groupInfo.data.name,
            }))
          );
          monthlyEvents.push(...events);
        })
      );
      setMonthEventData(monthlyEvents);
    } else {
      setLoading(false);
    }
  };

  const toSetMarkedDatesObjects = (monthlyEventData: Array<any>) => {
    const objects: any = {};
    objects[today] = {
      selected: true,
      selectedColor: S.colors.primary,
      dots: [],
    };
    for (let i = 0; i < monthlyEventData.length; ++i) {
      const objectKey = monthlyEventData[i].date;
      const groupId = monthlyEventData[i].GroupId.toString();
      const color = monthlyEventData[i].color;
      const selected = objectKey === today ? true : false;

      objectKey in objects
        ? (objects[objectKey] = {
            ...objects[objectKey],
            dots: [...objects[objectKey].dots, { key: groupId, color: color }],
          })
        : (objects[objectKey] = {
            selected: selected,
            dots: [{ key: groupId, color: color }],
          });
    }
    return objects;
  };

  const toAgendaType = (arr: Array<any>) => {
    const agenda = [];
    for (let i = 0; i < arr.length; ++i) {
      const object: any = {};
      object.title = arr[i].title;
      object.data = [
        {
          group: arr[i].groupName,
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
  };

  const markCalendar = async () => {
    const toBeMarkedDatesObjects = await toSetMarkedDatesObjects(
      monthlyEventData
    );

    setMarkedDates(toBeMarkedDatesObjects);

    // 오늘의 아젠다 불러오기
    const todayAgenda = await Promise.all(
      monthlyEventData.filter((event) => event.date == today)
    );
    todayAgenda.sort((a, b) =>
      a.startTime > b.startTime
        ? 1
        : a.startTime == b.startTime
        ? a.GroupId > b.GroupId
          ? 1
          : -1
        : -1
    );
    setAgendaData(toAgendaType(todayAgenda));
  };

  const onDayPress = async (day: dayType) => {
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
    const updatedAgenda = await Promise.all(
      monthlyEventData.filter(
        (event) => event.date.slice(0, 10) == selectedDate
      )
    );
    updatedAgenda.sort((a, b) =>
      a.startTime > b.startTime
        ? 1
        : a.startTime == b.startTime
        ? a.GroupId > b.GroupId
          ? 1
          : -1
        : -1
    );
    setAgendaData(toAgendaType(updatedAgenda));
  };

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
            <CalendarView
              onVisibleMonthsChange={(month) =>
                setCurrentYearMonth(
                  moment(month[0].dateString).format("YYYY-MM")
                )
              }
              onDayPress={onDayPress}
              markedDates={markedDates}
            />
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
