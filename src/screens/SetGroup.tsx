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

export default function SetGroup() {
  const [selectedGroup, setSelectedGroup] = useState<string>("청년회");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const navigation = useNavigation();
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goNext = useCallback(() => {
    navigation.navigate("SetService");
  }, []);

  useEffect(() => {
    selectedGroup === "" ? setButtonDisabled(true) : setButtonDisabled(false);
  }, [selectedGroup]);

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
          <Text style={[styles.questionText]}>소속 그룹을 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <Picker
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            selectedValue={selectedGroup}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedGroup(itemValue)
            }
          >
            <Picker.Item label="청년회" value="청년회" />
            <Picker.Item label="봉사회" value="봉사회" />
            <Picker.Item label="어머니회" value="어머니회" />
            <Picker.Item label="은빛장년회" value="은빛장년회" />
            <Picker.Item label="교회학교(유)" value="교회학교(유)" />
            <Picker.Item label="교회학교(초)" value="교회학교(초)" />
            <Picker.Item label="교회학교(중)" value="교회학교(중)" />
            <Picker.Item label="교회학교(고)" value="교회학교(고)" />
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
