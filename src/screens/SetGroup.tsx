import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import { Picker } from "@react-native-picker/picker";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import * as O from "../store/onBoarding";
import { useDispatch, useStore } from "react-redux";
import axios from "axios";

export default function SetGroup() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services, inviteCode } =
    store.getState().onBoarding;
  const [selectedGroup, setSelectedGroup] = useState<string>(group);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const { accessJWT } = store.getState().asyncStorage;
  const [groups, setGroups] = useState<Array<any>>([]);
  const [requestAgain, setRequestAgain] = useState<boolean>(false);
  const navigation = useNavigation();
  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goNext = useCallback(() => {
    navigation.navigate("SetService");
  }, []);

  useEffect(() => {
    const response = axios
      .get("/api/groups/group-list", {
        params: {
          church: church,
        },
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then((response) => {
        setGroups(response.data);
        setRequestAgain(false);
      })
      .catch((e) => {
        const errorStatus = e.response.status;
        if (errorStatus === 401) {
          // accessToken 만료
          U.readFromStorage("refreshJWT").then((refreshToken: any) => {
            // accessToken 재발급
            axios
              .get("/api/users/refresh-access", {
                headers: { Authorization: `Bearer ${refreshToken}` },
              })
              .then((response) => {
                const renewedAccessToken = response.data.accessToken;
                U.writeToStorage("accessJWT", renewedAccessToken);
                dispatch(A.setJWT(renewedAccessToken, refreshToken));
              })
              .then(() => {
                // 재요청
                setRequestAgain(true);
              });
          });
        } else {
          Alert.alert("비정상적인 접근입니다");
        }
      });
  }, [requestAgain]);

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
          <Text style={[styles.questionText]}>소속을 선택해주세요</Text>
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
            selectedValue={selectedGroup}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedGroup(itemValue);
              dispatch(
                O.setProfile(
                  church,
                  sex,
                  district,
                  itemValue,
                  services,
                  inviteCode
                )
              );
            }}
          >
            {groups.map((group) => {
              return (
                <Picker.Item
                  key={group}
                  label={group.name}
                  value={group.name}
                />
              );
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
