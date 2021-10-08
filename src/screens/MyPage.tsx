import { useNavigation, StackActions } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useStore } from "react-redux";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import * as L from "../store/login";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import * as I from "../store/isAuthorized";

export default function MyPage() {
  const store = useStore();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isAuthorized } = store.getState().isAuthorized;
  const { name } = store.getState().login.loggedUser;

  const goOnboarding = useCallback(() => {
    navigation.navigate("OnBoarding");
  }, []);
  const goBelongToGroups = useCallback(() => {
    navigation.navigate("BelongToGroups");
  }, []);
  const goFollowGroups = useCallback(() => {
    navigation.navigate("FollowGroups");
  }, []);

  const logout = useCallback(() => {
    dispatch(L.logoutAction());
    dispatch(A.setJWT("", ""));
    dispatch(I.setIsAuthorized(false));
    U.removeStorage(L.loggedUserKey);
    U.removeStorage("accessJWT");
    U.removeStorage("refreshJWT");
    navigation.dispatch(StackActions.popToTop());
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isAuthorized ? S.colors.primary : "white" },
      ]}
    >
      <NavigationHeader
        Right={() => <TouchableView></TouchableView>}
      ></NavigationHeader>
      {!isAuthorized && (
        <View style={{ flex: 1, paddingHorizontal: "5%" }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text style={[styles.bigText, { paddingBottom: 5 }]}>
              성도 인증을 하시면
            </Text>
            <Text style={[styles.bigText, { paddingBottom: 10 }]}>
              더 많은 서비스를 이용하실 수 있습니다.
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: S.colors.primary,
                  flex: 1,
                },
              ]}
              onPress={goOnboarding}
            >
              <Text
                style={[
                  styles.bigText,
                  {
                    color: "white",
                  },
                ]}
              >
                성도 인증하기
              </Text>
            </TouchableView>
            <View style={{ flex: 2 }}></View>
            <View style={{ flex: 1 }}>
              <TouchableView
                style={[
                  S.buttonStyles.longButton,
                  {
                    backgroundColor: S.colors.primary,
                    flex: 1,
                  },
                ]}
                onPress={() => {
                  Alert.alert("로그아웃하시겠습니까?", "", [
                    {
                      text: "아니요",
                    },
                    {
                      text: "네",
                      onPress: logout,
                    },
                  ]);
                }}
              >
                <Text
                  style={[
                    styles.bigText,
                    {
                      color: "white",
                    },
                  ]}
                >
                  로그아웃
                </Text>
              </TouchableView>
            </View>
          </View>
        </View>
      )}
      {isAuthorized && (
        <View style={{ height: "100%" }}>
          <View
            style={[
              styles.profileContainer,
              { backgroundColor: S.colors.primary },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.bigText,
                  { textAlign: "left", fontSize: 35, color: "white" },
                ]}
              >
                {name}님
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <TouchableView
                  style={{ flexDirection: "column" }}
                  onPress={goBelongToGroups}
                >
                  <FontAwesome5
                    name="church"
                    size={35}
                    color={S.colors.primary}
                    style={{ alignSelf: "center" }}
                  />
                  <Text
                    style={[
                      styles.bigText,
                      { paddingTop: 5, color: S.colors.primary },
                    ]}
                  >
                    소속 그룹
                  </Text>
                </TouchableView>
                <TouchableView
                  style={{ flexDirection: "column" }}
                  onPress={goFollowGroups}
                >
                  <FontAwesome
                    name="group"
                    size={35}
                    color={S.colors.primary}
                    style={{ alignSelf: "center" }}
                  />
                  <Text
                    style={[
                      styles.bigText,
                      { paddingTop: 5, color: S.colors.primary },
                    ]}
                  >
                    팔로우 그룹
                  </Text>
                </TouchableView>
              </View>
            </View>
            <View style={{ flex: 0.2 }}></View>
          </View>
          <View style={[styles.menuContainer]}>
            <View style={{ flex: 1 }}>
              <TouchableView
                style={{
                  flex: 1,
                  borderBottomColor: S.colors.secondary,
                  borderBottomWidth: 1,
                  justifyContent: "center",
                }}
              >
                <Text style={[styles.mediumText]}>프로필 관리</Text>
              </TouchableView>
              <TouchableView
                style={{
                  flex: 1,
                  borderBottomColor: S.colors.secondary,
                  borderBottomWidth: 1,
                  justifyContent: "center",
                }}
              >
                <Text style={[styles.mediumText]}>성도 초대하기</Text>
              </TouchableView>
              <TouchableView
                style={{
                  flex: 1,
                  borderBottomColor: S.colors.secondary,
                  borderBottomWidth: 1,
                  justifyContent: "center",
                }}
              >
                <Text style={[styles.mediumText]}>문의하기</Text>
              </TouchableView>
              <TouchableView
                style={{
                  flex: 1,
                  borderBottomColor: S.colors.secondary,
                  borderBottomWidth: 1,
                  justifyContent: "center",
                }}
                onPress={() => {
                  Alert.alert("로그아웃하시겠습니까?", "", [
                    {
                      text: "아니요",
                    },
                    {
                      text: "네",
                      onPress: logout,
                    },
                  ]);
                }}
              >
                <Text style={[styles.mediumText]}>로그아웃</Text>
              </TouchableView>
            </View>
            <View style={{ flex: 1 }}></View>
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
  profileContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  menuContainer: {
    flex: 3,
    paddingHorizontal: "5%",
    backgroundColor: "white",
  },
  bigText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
  },
  mediumText: {
    fontFamily: S.fonts.medium,
    fontSize: 15,
  },
});
