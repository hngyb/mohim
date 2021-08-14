import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { Colors } from "react-native-paper";
import Color from "color";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";

export default function SetSex() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [selectedSex, setSelectedSex] = useState<string>(sex);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const navigation = useNavigation();
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goNext = useCallback(() => {
    navigation.navigate("SetDistrict");
  }, []);

  useEffect(() => {
    selectedSex === "" ? setButtonDisabled(true) : setButtonDisabled(false);
  }, [selectedSex]);

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
          <Text style={[styles.questionText]}>성별을 선택해주세요</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              marginRight: 10,
              borderColor: selectedSex === "brother" ? "black" : "lightgrey",
              borderWidth: 3,
            }}
            onPress={() => {
              setSelectedSex("brother");
              dispatch(
                O.setProfile(
                  church,
                  "brother",
                  district,
                  group,
                  services,
                  inviteCode
                )
              );
            }}
          >
            <Text style={[styles.text]}>형제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              marginLeft: 10,
              borderColor: selectedSex === "sister" ? "black" : "lightgrey",
              borderWidth: 3,
            }}
            onPress={() => {
              setSelectedSex("sister");
              dispatch(
                O.setProfile(
                  church,
                  "sister",
                  district,
                  group,
                  services,
                  inviteCode
                )
              );
            }}
          >
            <Text style={[styles.text]}>자매</Text>
          </TouchableOpacity>
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
    fontSize: 35,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    backgroundColor: "lightgrey",
    fontWeight: "bold",
    color: "black",
    borderRadius: 5,
    fontSize: 18,
    padding: 15,
  },
  nextText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
