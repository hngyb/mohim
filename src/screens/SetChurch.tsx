import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import { useDispatch, useStore } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { getCookie } from "../utils";

export default function SetChurch({ navigation, route }) {
  const store = useStore();
  const dispatch = useDispatch();
  const { accessJWT } = store.getState().asyncStorage;
  const [accessToken, setAccessToken] = useState<string>(accessJWT);
  const [selectedChurch, setSelectedChurch] = useState<string>(
    route.params?.church
  );
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [churchList, setChurcList] = useState<Array<any>>([]);

  const goNext = () => {
    const params = { ...route.params, church: selectedChurch };
    navigation.navigate("SetSex", { ...params, church: selectedChurch });
  };

  useEffect(() => {
    getChurchList()
      .then(() => {
        SplashScreen.hide();
      })
      .catch(async (e) => {
        const errorStatus = e.response.status;
        if (errorStatus === 401) {
          await updateToken();
        } else {
          Alert.alert("비정상적인 접근입니다");
        }
      });
  }, []);

  const getChurchList = async () => {
    const response = await axios.get("/api/groups/church-list", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setSelectedChurch(response.data[0].name);
    setChurcList(response.data);
  };

  const updateToken = async () => {
    U.readFromStorage("refreshJWT").then((refreshJWT: any) => {
      // accessToken 재발급
      axios
        .get("/api/users/refresh-access", {
          headers: { Authorization: `Bearer ${refreshJWT}` },
        })
        .then((response) => {
          const tokens = response.headers["set-cookie"][0];
          const renewedAccessToken = getCookie(tokens, "accessToken");
          U.writeToStorage("accessJWT", renewedAccessToken);
          dispatch(A.setJWT(renewedAccessToken, refreshJWT));
          setAccessToken(renewedAccessToken);
        });
    });
  };

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
            }}
          >
            {churchList.map((church) => {
              return (
                <Picker.Item
                  key={church}
                  label={church.name}
                  value={church.name}
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
