import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "react-redux";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";

// todo:
// 1. logout할 때, latest update 지우기
export default function MyPage() {
  const store = useStore();
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

  return (
    <SafeAreaView style={[styles.container]}>
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
            <View style={{ flex: 3 }}></View>
          </View>
        </View>
      )}
      {isAuthorized && (
        <View style={{ flex: 1 }}>
          <View style={[styles.profileContainer]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.bigText,
                  { textAlign: "left", fontSize: 35, color: S.colors.primary },
                ]}
              >
                {name} 님
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
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
          <View
            style={[
              styles.menuContainer,
              { borderTopColor: S.colors.secondary, borderTopWidth: 8 },
            ]}
          ></View>
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
    flex: 2,
    paddingHorizontal: "5%",
  },
  bigText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
  },
});
