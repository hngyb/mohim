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

export default function SetChurch() {
  const store = useStore();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [selectedChurch, setSelectedChurch] = useState<string>(church);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const goNext = useCallback(() => {
    navigation.navigate("SetSex");
  }, []);
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  useEffect(() => {
    selectedChurch === "" ? setButtonDisabled(true) : setButtonDisabled(false);
  }, [selectedChurch]);

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader></NavigationHeader>
      <View style={[styles.QAContainer]}>
        <View style={{ flex: 1 }}></View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={[styles.questionText]}>소속 교회를 선택해주세요</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={[styles.text]}>일산교회</Text>
        </View>
        <View style={{ flex: 1 }}></View>
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
                  ? Color(S.secondayColor).alpha(0.5).string()
                  : S.secondayColor,
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
              다음 →
            </Text>
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
    fontFamily: S.fontMedium,
    textAlign: "center",
    backgroundColor: S.secondayColor,
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