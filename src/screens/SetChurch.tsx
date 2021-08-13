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

export default function SetChurch() {
  const navigation = useNavigation();
  const [selectedChurch, setSelectedChurch] = useState<string>("일산교회");
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
});
