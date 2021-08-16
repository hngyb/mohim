import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import { Picker } from "@react-native-picker/picker";
import * as S from "./Styles";
import { Colors } from "react-native-paper";
import Color from "color";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";

export default function SetDistrict() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [selectedDistrict, setSelectedDistrict] = useState<string>(district);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const navigation = useNavigation();
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goNext = useCallback(() => {
    navigation.navigate("SetGroup");
  }, []);

  useEffect(() => {
    selectedDistrict === ""
      ? setButtonDisabled(true)
      : setButtonDisabled(false);
  }, [selectedDistrict]);

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
          <Text style={[styles.questionText]}>소속 구역을 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <Picker
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            itemStyle={{
              fontFamily: S.fontMedium,
            }}
            selectedValue={selectedDistrict}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedDistrict(itemValue);
              dispatch(
                O.setProfile(
                  church,
                  sex,
                  itemValue,
                  group,
                  services,
                  inviteCode
                )
              );
            }}
          >
            <Picker.Item label="11구역" value="11" />
            <Picker.Item label="12구역" value="12" />
            <Picker.Item label="13구역" value="13" />
            <Picker.Item label="21구역" value="21" />
            <Picker.Item label="22구역" value="22" />
            <Picker.Item label="23구역" value="23" />
            <Picker.Item label="31구역" value="31" />
            <Picker.Item label="32구역" value="32" />
            <Picker.Item label="33구역" value="33" />
            <Picker.Item label="41구역" value="41" />
            <Picker.Item label="42구역" value="42" />
            <Picker.Item label="43구역" value="43" />
            <Picker.Item label="51구역" value="51" />
            <Picker.Item label="52구역" value="52" />
            <Picker.Item label="53구역" value="53" />
            <Picker.Item label="61구역" value="61" />
            <Picker.Item label="62구역" value="62" />
            <Picker.Item label="63구역" value="63" />
          </Picker>
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
    fontFamily: S.fontMedium,
    textAlign: "center",
    backgroundColor: S.secondayColor,
    color: "black",
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
