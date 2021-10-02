import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { useDispatch, useStore } from "react-redux";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { isUndefined } from "lodash";
import { getCookie } from "../utils";

export default function RequestAuthorization({ navigation, route }) {
  console.log(route.params);
  const store = useStore();
  const dispatch = useDispatch();
  const { accessJWT } = store.getState().asyncStorage;
  const [accessToken, setAccessToken] = useState<string>(accessJWT);
  const [inviteCode, setInviteCode] = useState<string>(
    route.params?.inviteCode
  );
  const [request, setRequest] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { church, department, district, group, services, sex } = route.params;

  const goBack = () => {
    const params = { ...route.params, inviteCode: inviteCode };
    navigation.navigate("SetService", {
      ...params,
      inviteCode: inviteCode,
    });
  };

  useEffect(() => {
    isUndefined(inviteCode)
      ? setButtonDisabled(true)
      : setButtonDisabled(false);
  }, [inviteCode]);

  useEffect(() => {
    if (!isUndefined(inviteCode)) {
      setLoading(true);
      checkInviteCode()
        .then((isValid) => {
          if (isValid === true) {
            register().then(() => {
              setLoading(false);
              navigation.navigate("TabNavigator");
            });
          }
        })
        .catch(async (e) => {
          const errorStatus = e.response.status;
          if (errorStatus === 400) {
            // 초대코드 오류
            Alert.alert("초대코드를 확인해주세요", "", [{ text: "확인" }]);
          } else if (errorStatus === 401) {
            // accessToken 만료 -> accessToken 업데이트
            await updateToken();
          } else {
            Alert.alert("비정상적인 접근입니다");
          }
          setLoading(false);
        });
    }
  }, [accessToken, request]);

  const checkInviteCode = async () => {
    const response = await axios.post(
      "/api/users/request-authorization",
      {
        inviteCode: inviteCode,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (response.data.id === inviteCode) {
      return true;
    } else {
      return false;
    }
  };

  const register = async () => {
    const churchGroupId = await axios.get("/api/groups/", {
      params: {
        name: church,
        church: church,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const districtGroupId = await axios.get("/api/groups/", {
      params: {
        name: district,
        church: church,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const departmentGroupId = await axios.get("/api/groups/", {
      params: {
        name: department,
        church: church,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const serviceGroups = await Promise.all(
      services.map(async (service: string) => {
        const serviceGroup = await axios.get("/api/groups/", {
          params: {
            name: service,
            church: church,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return serviceGroup.data;
      })
    );
    const groupIds = {
      churchGroupId: churchGroupId,
      districtGroupId: districtGroupId,
      departmentGroupId: departmentGroupId,
      serviceGroups: serviceGroups,
    };
    axios.post(
      "/api/users/register",
      {
        church: groupIds.churchGroupId.data.id,
        district: groupIds.districtGroupId.data.id,
        department: groupIds.departmentGroupId.data.id,
        services: serviceGroups,
        sex: sex,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
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

  const doNextTime = useCallback(() => {
    navigation.navigate("TabNavigator");
  }, []);

  return (
    <SafeAreaView style={[styles.container]}>
      {loading === true ? (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={S.colors.primary}
        />
      ) : (
        <View style={{ flex: 1 }}>
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
              <Text style={[styles.questionText]}>초대코드를 입력해주세요</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextInput
                defaultValue={inviteCode}
                style={[styles.text]}
                onChangeText={setInviteCode}
                placeholder="초대코드 입력"
                placeholderTextColor="gray"
                autoCapitalize="none"
              />
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={[styles.nextContainer]}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}></View>
              <View style={{ flex: 2 }}></View>
              <View style={{ flex: 1 }}>
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
                  onPress={() => setRequest(!request)}
                >
                  <Text style={[styles.nextText]}>성도 인증하기</Text>
                </TouchableView>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}></View>
              <TouchableView
                style={[
                  S.buttonStyles.longButton,
                  {
                    backgroundColor: "white",
                    borderWidth: 2,
                    borderColor: S.colors.primary,
                  },
                ]}
                onPress={doNextTime}
              >
                <Text style={[styles.nextText, { color: S.colors.primary }]}>
                  다음에 하기
                </Text>
              </TouchableView>
              <View style={{ flex: 2 }}></View>
            </View>
          </View>
        </View>
      )}
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
    textAlign: "center",
    backgroundColor: S.colors.secondary,
    fontFamily: S.fonts.medium,
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
