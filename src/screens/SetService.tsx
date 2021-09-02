import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";
import axios from "axios";

export default function SetService() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [open, setOpen] = useState(false);
  const { accessJWT } = store.getState().asyncStorage;
  const [requestAgain, setRequestAgain] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] =
    useState<Array<any>>(services);
  const [items, setItems] = useState<Array<any>>([]);

  useEffect(() => {
    const response = axios
      .get("/api/groups/service-list", {
        params: {
          church: church,
        },
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then((response) => {
        const itemArray: any = [];
        response.data.map((service: any) => {
          const item: object = { label: service.name, value: service.name };
          itemArray.push(item);
        });
        setItems(itemArray);
        setRequestAgain(false);
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
                setRequestAgain(true);
              });
          });
        } else {
          Alert.alert("비정상적인 접근입니다");
        }
      });
  }, [requestAgain]);

  // const [items, setItems] = useState([
  //   {
  //     label: "찬양대",
  //     value: "찬양대",
  //   },
  //   {
  //     label: "미디어선교부",
  //     value: "미디어선교부",
  //   },
  //   {
  //     label: "교회학교 교사(유)",
  //     value: "교회학교 교사(유)",
  //   },
  //   {
  //     label: "교회학교 교사(초)",
  //     value: "교회학교 교사(초)",
  //   },
  //   {
  //     label: "교회학교 교사(중)",
  //     value: "교회학교 교사(중)",
  //   },
  //   {
  //     label: "교회학교 교사(고)",
  //     value: "교회학교 교사(고)",
  //   },
  //   { label: "청년회 총무팀", value: "청년회 총무팀" },
  //   {
  //     label: "방송부",
  //     value: "방송부",
  //   },
  //   {
  //     label: "서적부",
  //     value: "서적부",
  //   },
  //   {
  //     label: "시설관리부",
  //     value: "시설관리부",
  //   },
  //   {
  //     label: "장례부",
  //     value: "장례부",
  //   },
  //   {
  //     label: "전도부",
  //     value: "전도부",
  //   },
  //   {
  //     label: "제자교육부",
  //     value: "제자교육부",
  //   },
  //   {
  //     label: "주차수송부",
  //     value: "주차수송부",
  //   },
  //   {
  //     label: "해외선교부",
  //     value: "해외선교부",
  //   },
  //   {
  //     label: "혼례부",
  //     value: "혼례부",
  //   },
  //   {
  //     label: "환경꾸밈부",
  //     value: "환경꾸밈부",
  //   },
  // ]);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const navigation = useNavigation();
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goNext = useCallback(() => {
    navigation.navigate("RequestAuthorization");
  }, []);

  useEffect(() => {
    dispatch(
      O.setProfile(church, sex, district, group, selectedServices, inviteCode)
    );
    // isEmpty(selectedServices)
    //   ? setButtonDisabled(true)
    //   : setButtonDisabled(false);
  }, [selectedServices]);

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => (
          <TouchableView onPress={goBack}>
            <Icon name="chevron-back" size={30}></Icon>
          </TouchableView>
        )}
      ></NavigationHeader>
      <View style={[styles.QAContainer]}>
        <View style={{ flex: 1 }}></View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={[styles.questionText]}>봉사를 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <DropDownPicker
            textStyle={{ fontFamily: S.fonts.medium }}
            labelStyle={{
              fontFamily: S.fonts.medium,
            }}
            badgeTextStyle={{
              fontFamily: S.fonts.medium,
              color: "white",
            }}
            badgeColors={S.colors.primary}
            maxHeight={140}
            listMode="FLATLIST"
            mode="BADGE"
            showBadgeDot={false}
            multiple={true}
            min={0}
            max={5}
            open={open}
            value={selectedServices}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedServices}
            setItems={setItems}
            placeholder="모두 선택해주세요"
          />
        </View>
      </View>
      <View style={[styles.nextContainer]}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 3 }}></View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}></View>
          <TouchableView
            style={[
              S.buttonStyles.longButton,
              {
                backgroundColor: buttonDisabled
                  ? S.colors.secondary
                  : S.colors.primary,
              },
            ]}
            disabled={buttonDisabled}
            onPress={goNext}
          >
            <Text style={[styles.nextText]}>다음 →</Text>
          </TouchableView>
          <View style={{ flex: 2 }}></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  QAContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  nextContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  questionText: {
    fontFamily: S.fonts.bold,
    fontSize: 30,
  },
  text: {
    fontFamily: S.fonts.medium,
    textAlign: "center",
    backgroundColor: S.colors.secondary,
    color: "black",
    borderRadius: 5,
    fontSize: 18,
    padding: 15,
  },
  nextText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
    color: "white",
  },
});
