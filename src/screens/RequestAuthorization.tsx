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
  const goNext = useCallback(() => {
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
          <View style={{ flex: 2 }}>
            <Text style={[styles.mediumText]}>초대코드를 갖고 계시면,</Text>
            <Text style={[styles.mediumText]}>
              관리자 승인 없이 바로 이용하실 수 있습니다.
            </Text>
          </View>
        </View>
        <View style={{ flex: 2 }}>
          <View style={{ flex: 1 }}>
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: buttonDisabled
                    ? Color(Colors.grey300).alpha(0.5).string()
                    : "lightgrey",
                },
              ]}
              disabled={buttonDisabled}
              onPress={goNext}
            >
              <Text
                style={[
                  styles.nextText,
                  { color: buttonDisabled ? Colors.grey400 : "black" },
                ]}
              >
                시작하기
              </Text>
            </TouchableView>
          </View>
          <View style={{ flex: 1 }}></View>
          <TouchableView style={[S.buttonStyles.longButton]} onPress={goNext}>
            <Text style={[styles.nextText]}>초대코드 없이 시작하기</Text>
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
    fontSize: 35,
    fontWeight: "bold",
  },
  text: {
    flex: 1,
    textAlign: "center",
    backgroundColor: "lightgrey",
    fontWeight: "bold",
    color: "grey",
    borderRadius: 5,
    fontSize: 18,
    padding: 15,
  },
  nextText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  mediumText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
