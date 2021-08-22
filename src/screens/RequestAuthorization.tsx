import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { useDispatch, useStore } from "react-redux";
import * as O from "../store/onBoarding";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import realm from "../models";
import Realm from "realm";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";

export default function RequestAuthorization() {
  const store = useStore();
  const dispatch = useDispatch();
  const { church, sex, district, group, services } =
    store.getState().onBoarding;
  const { email } = store.getState().login.loggedUser;
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState<string>(
    store.getState().onBoarding.inviteCode
  );
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const randomColor = useCallback((palettes: Array<any>) => {
    return palettes[Math.floor(Math.random() * palettes.length)];
  }, []);

  const requestAuthorization = useCallback(() => {
    setLoading(true);
    // inviteCode 유효성 검사
    U.readFromStorage("accessJWT").then((accessToken) => {
      axios
        .post(
          "/api/users/request-authorization",
          {
            inviteCode: inviteCode,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        .then(async (response) => {
          if (response.data.id === inviteCode) {
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
            const groupGroupId = await axios.get("/api/groups/", {
              params: {
                name: group,
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
            const ids = {
              churchGroupId: churchGroupId,
              districtGroupId: districtGroupId,
              groupGroupId: groupGroupId,
              serviceGroups: serviceGroups,
            };
            return ids;
          }
        })
        .then((ids: any) => {
          realm.write(() => {
            const groupChurch = realm.create(
              "Groups",
              {
                id: ids.churchGroupId.data.id,
                userId: email,
                name: church,
                church: church,
                isPublic: true,
                color: randomColor(S.colorPalettes),
              },
              Realm.UpdateMode.Modified
            );
            const followChurch = realm.create(
              "Follows",
              {
                groupId: ids.churchGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            const belongToChurch = realm.create(
              "BelongTos",
              {
                groupId: ids.churchGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            const groupDistrict = realm.create(
              "Groups",
              {
                id: ids.districtGroupId.data.id,
                userId: email,
                name: district,
                church: church,
                isPublic: true,
                color: randomColor(S.colorPalettes),
              },
              Realm.UpdateMode.Modified
            );
            const followDistrict = realm.create(
              "Follows",
              {
                groupId: ids.districtGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            const belongToDistrict = realm.create(
              "BelongTos",
              {
                groupId: ids.districtGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            const groupGroup = realm.create(
              "Groups",
              {
                id: ids.groupGroupId.data.id,
                userId: email,
                name: group,
                church: church,
                isPublic: true,
                color: randomColor(S.colorPalettes),
              },
              Realm.UpdateMode.Modified
            );
            const followGroup = realm.create(
              "Follows",
              {
                groupId: ids.groupGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            const belongToGroup = realm.create(
              "BelongTos",
              {
                groupId: ids.groupGroupId.data.id,
                userId: email,
              },
              Realm.UpdateMode.Modified
            );
            ids.serviceGroups.forEach((serviceGroup: any) => {
              realm.create(
                "Groups",
                {
                  id: serviceGroup.id,
                  userId: email,
                  name: serviceGroup.name,
                  church: serviceGroup.church,
                  isPublic: true,
                  color: randomColor(S.colorPalettes),
                },
                Realm.UpdateMode.Modified
              );
              realm.create(
                "Follows",
                {
                  groupId: serviceGroup.id,
                  userId: email,
                },
                Realm.UpdateMode.Modified
              );
              realm.create(
                "BelongTos",
                {
                  groupId: serviceGroup.id,
                  userId: email,
                },
                Realm.UpdateMode.Modified
              );
            });
          });
          const serviceGroupIds = ids.serviceGroups.map(
            (serviceGroup: any) => serviceGroup.id
          );
          axios
            .post(
              "/api/users/register",
              {
                church: ids.churchGroupId.data.id,
                district: ids.districtGroupId.data.id,
                group: ids.groupGroupId.data.id,
                services: serviceGroupIds,
                sex: sex,
              },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            .then((response) => {
              if (response.status === 201) {
                setLoading(false);
                Alert.alert("환영합니다!", "", [
                  {
                    text: "확인",
                    onPress: () => navigation.navigate("TabNavigator"),
                  },
                ]);
              }
            });
        })
        .catch((e) => {
          setLoading(false);
          const errorStatus = e.response.status;
          if (errorStatus === 400) {
            // 초대코드 오류
            Alert.alert("초대코드를 확인해주세요", "", [{ text: "확인" }]);
          } else if (errorStatus === 401) {
            // accessToken 만료
            U.readFromStorage("refreshJWT").then((refreshToken) => {
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
                  requestAuthorization();
                });
            });
          } else {
            Alert.alert("비정상적인 접근입니다");
          }
        });
    });
  }, [inviteCode]);

  const doNextTime = useCallback(() => {
    navigation.navigate("TabNavigator");
  }, []);

  useEffect(() => {
    dispatch(O.setProfile(church, sex, district, group, services, inviteCode));
    inviteCode === "" ? setButtonDisabled(true) : setButtonDisabled(false);
  }, [inviteCode]);

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
                  onPress={requestAuthorization}
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
