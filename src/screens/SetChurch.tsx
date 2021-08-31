import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { concat } from "lodash";

export default function SetChurch() {
  const store = useStore();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const { accessJWT } = store.getState().asyncStorage;
  const [selectedChurch, setSelectedChurch] = useState<string>(church);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const goNext = useCallback(() => {
    navigation.navigate("SetSex");
  }, []);
  const [churches, setChurches] = useState<Array<any>>([]);
  useEffect(() => {
    const response = axios
      .get("/api/groups/church-list", {
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then((response) => {
        setChurches(response.data);
      });
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
          <Text style={[styles.questionText]}>교회를 선택해주세요</Text>
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
            selectedValue={selectedChurch}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedChurch(itemValue);
              dispatch(
                O.setProfile(
                  itemValue,
                  sex,
                  district,
                  group,
                  services,
                  inviteCode
                )
              );
            }}
          >
            {churches.map((church) => {
              return <Picker.Item label={church.name} value={church.name} />;
            })}
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
    flex: 1,
    fontFamily: S.fonts.medium,
    textAlign: "center",
    backgroundColor: S.colors.secondary,
    color: "grey",
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
