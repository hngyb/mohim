import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { Colors } from "react-native-paper";
import Color from "color";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";
import * as U from "../utils";
import realm from "../models";
import Realm from "realm";
import axios from "axios";

export default function RequestAuthorization() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services } =
    store.getState().onBoarding;
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState<string>(
    store.getState().onBoarding.inviteCode
  );
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const requestAuthorization = useCallback(() => {
    // inviteCode 유효성 검사
    U.readFromStorage("accessJWT").then((accessToken) => {
      axios
        .post(
          "/api/users/request-authorization",
          {
            inviteCode: inviteCode,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        .then((response) => {
          if (response.data.id === inviteCode) {
            console.log("authorized");
            // realm 저장하고 서버에 post (authorization = True)
            navigation.navigate("TabNavigator");
          }
        })
        .catch((e) => {
          console.log(e); // 에러코드에 따라 accesstoken 만료랑 초대코드 잘못된 걸로 나누어서 처리
          // error code === 401 -> refreshToken으로 accessToken 재발급후  request 재진행
          // error code === 400 -> 잘못된 초대코드 모달창 띄우기
        });
    });
  }, [inviteCode]);

  const doNextTime = useCallback(() => {
    navigation.navigate("TabNavigator");
  }, []);

  useEffect(() => {
    dispatch(O.setProfile(church, sex, district, group, services, inviteCode));
    inviteCode === "" ? setButtonDisabled(true) : setButtonDisabled(false);
  }, [inviteCode]);

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
          <Text style={[styles.questionText]}>초대코드를 입력해주세요</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            defaultValue={inviteCode}
            style={[styles.text]}
            onChangeText={setInviteCode}
            placeholder="초대코드 입력"
            placeholderTextColor="gray"
            autoCapitalize="none"
          />
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={[styles.nextContainer]}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 2 }}></View>
        </View>
        <View style={{ flex: 2 }}>
          <View style={{ flex: 1 }}>
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: buttonDisabled
                    ? Color(S.secondayColor).alpha(0.5).string()
                    : S.secondayColor,
                },
              ]}
              disabled={buttonDisabled}
              onPress={requestAuthorization}
            >
              <Text
                style={[
                  styles.nextText,
                  { color: buttonDisabled ? Colors.grey400 : "black" },
                ]}
              >
                성도 인증하기
              </Text>
            </TouchableView>
          </View>
          <View style={{ flex: 1 }}></View>
          <TouchableView
            style={[S.buttonStyles.longButton]}
            onPress={doNextTime}
          >
            <Text style={[styles.nextText]}>다음에 하기</Text>
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
    paddingHorizontal: "5%%",
  },
  nextContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  questionText: {
    fontFamily: S.fontBold,
    fontSize: 30,
  },
  text: {
    flex: 1,
    textAlign: "center",
    backgroundColor: S.secondayColor,
    fontFamily: S.fontMedium,
    color: "grey",
    borderRadius: 5,
    fontSize: 18,
    padding: 15,
  },
  nextText: {
    fontFamily: S.fontBold,
    textAlign: "center",
    fontSize: 18,
  },
});
