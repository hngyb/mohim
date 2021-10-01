import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { isUndefined } from "lodash";

export default function SetSex({ navigation, route }) {
  const [selectedSex, setSelectedSex] = useState<string>(route.params?.sex);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

  const goBack = () => {
    const params = { ...route.params, sex: selectedSex };
    navigation.navigate("SetChurch", { ...params, sex: selectedSex });
  };

  const goNext = () => {
    const params = { ...route.params, sex: selectedSex };
    navigation.navigate("SetDistrict", { ...params, sex: selectedSex });
  };

  useEffect(() => {
    isUndefined(selectedSex)
      ? setButtonDisabled(true)
      : setButtonDisabled(false);
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
              borderColor:
                selectedSex === "brother"
                  ? S.colors.primary
                  : S.colors.secondary,
              borderWidth: 3,
            }}
            onPress={() => {
              setSelectedSex("brother");
            }}
          >
            <Text
              style={[
                styles.text,
                {
                  color:
                    selectedSex === "brother"
                      ? S.colors.primary
                      : S.colors.secondary,
                },
              ]}
            >
              형제
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              marginLeft: 10,
              borderColor:
                selectedSex === "sister"
                  ? S.colors.primary
                  : S.colors.secondary,
              borderWidth: 3,
            }}
            onPress={() => {
              setSelectedSex("sister");
            }}
          >
            <Text
              style={[
                styles.text,
                {
                  color:
                    selectedSex === "sister"
                      ? S.colors.primary
                      : S.colors.secondary,
                },
              ]}
            >
              자매
            </Text>
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
    fontFamily: S.fonts.bold,
    textAlign: "center",
    backgroundColor: "white",
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
