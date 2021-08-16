import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { Colors } from "react-native-paper";
import Color from "color";
import DropDownPicker from "react-native-dropdown-picker";
import { isEmpty } from "lodash";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";

export default function SetService() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] =
    useState<Array<any>>(services);
  const [items, setItems] = useState([
    {
      label: "찬양대",
      value: "찬양대",
    },
    {
      label: "미디어선교부",
      value: "미디어선교부",
    },
    {
      label: "교회학교 교사(유)",
      value: "교회학교 교사(유)",
    },
    {
      label: "교회학교 교사(초)",
      value: "교회학교 교사(초)",
    },
    {
      label: "교회학교 교사(중)",
      value: "교회학교 교사(중)",
    },
    {
      label: "교회학교 교사(고)",
      value: "교회학교 교사(고)",
    },
    { label: "청년회 총무팀", value: "청년회 총무팀" },
    {
      label: "방송부",
      value: "방송부",
    },
    {
      label: "서적부",
      value: "서적부",
    },
    {
      label: "시설관리부",
      value: "시설관리부",
    },
    {
      label: "장례부",
      value: "장례부",
    },
    {
      label: "전도부",
      value: "전도부",
    },
    {
      label: "제자교육부",
      value: "제자교육부",
    },
    {
      label: "주차수송부",
      value: "주차수송부",
    },
    {
      label: "해외선교부",
      value: "해외선교부",
    },
    {
      label: "혼례부",
      value: "혼례부",
    },
    {
      label: "환경꾸밈부",
      value: "환경꾸밈부",
    },
  ]);
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
          <Text style={[styles.questionText]}>봉사 그룹을 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <DropDownPicker
            textStyle={{ fontFamily: S.fontMedium }}
            labelStyle={{
              fontFamily: S.fontMedium,
            }}
            badgeTextStyle={{
              fontFamily: S.fontMedium,
            }}
            badgeColors={S.primaryColor}
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
    paddingHorizontal: "5%",
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
