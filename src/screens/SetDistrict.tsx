import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import { Picker } from "@react-native-picker/picker";
import * as S from "./Styles";
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
          <Text style={[styles.questionText]}>구역을 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <Picker
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            itemStyle={{
              fontFamily: S.fonts.medium,
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
            <Picker.Item label="11구역" value="11구역" />
            <Picker.Item label="12구역" value="12구역" />
            <Picker.Item label="13구역" value="13구역" />
            <Picker.Item label="21구역" value="21구역" />
            <Picker.Item label="22구역" value="22구역" />
            <Picker.Item label="23구역" value="23구역" />
            <Picker.Item label="31구역" value="31구역" />
            <Picker.Item label="32구역" value="32구역" />
            <Picker.Item label="33구역" value="33구역" />
            <Picker.Item label="41구역" value="41구역" />
            <Picker.Item label="42구역" value="42구역" />
            <Picker.Item label="43구역" value="43구역" />
            <Picker.Item label="51구역" value="51구역" />
            <Picker.Item label="52구역" value="52구역" />
            <Picker.Item label="53구역" value="53구역" />
            <Picker.Item label="61구역" value="61구역" />
            <Picker.Item label="62구역" value="62구역" />
            <Picker.Item label="63구역" value="63구역" />
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
    paddingHorizontal: "5%%",
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
