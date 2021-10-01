import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useStore } from "react-redux";
import axios from "axios";
import { getCookie } from "../utils";

export default function SetService({ navigation, route }) {
  const store = useStore();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { accessJWT } = store.getState().asyncStorage;
  const [accessToken, setAccessToken] = useState<string>(accessJWT);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<Array<any>>([]);
  const [serviceList, setServiceList] = useState<Array<any>>([]);
  const church = route.params.church;

  const goBack = () => {
    const params = { ...route.params, services: selectedServices };
    navigation.navigate("SetGroup", {
      ...params,
      services: selectedServices,
    });
  };

  const goNext = () => {
    const params = { ...route.params, services: selectedServices };
    navigation.navigate("RequestAuthorization", {
      ...params,
      services: selectedServices,
    });
  };

  useEffect(() => {
    // 그룹 리스트 가져오기
    getServiceList().catch(async (e) => {
      const errorStatus = e.response.status;
      if (errorStatus === 401) {
        // accessToken 만료 -> accessToken 업데이트
        await updateToken();
      } else {
        Alert.alert("비정상적인 접근입니다");
      }
    });
  }, [accessToken]);

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

  const getServiceList = async () => {
    axios
      .get("/api/groups/service-list", {
        params: {
          church: church,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((serviceList) => {
        const itemArray: any = [];
        serviceList.data.map((service: any) => {
          const item: object = {
            label: service.name,
            value: service.name,
          };
          itemArray.push(item);
        });
        setServiceList(itemArray);
      });
  };

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
          <Text style={[styles.questionText]}>봉사를 선택해주세요</Text>
        </View>
        <View style={{ flex: 2 }}>
          <DropDownPicker
            textStyle={{ fontFamily: S.fonts.medium }}
            labelStyle={{
              fontFamily: S.fonts.medium,
            }}
            badgeTextStyle={{
              fontFamily: S.fonts.medium,
              color: "white",
            }}
            badgeColors={S.colors.primary}
            maxHeight={140}
            listMode="FLATLIST"
            mode="BADGE"
            showBadgeDot={false}
            multiple={true}
            min={0}
            max={5}
            open={open}
            value={selectedServices}
            items={serviceList}
            setOpen={setOpen}
            setValue={setSelectedServices}
            setItems={setServiceList}
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
    paddingHorizontal: "5%",
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
