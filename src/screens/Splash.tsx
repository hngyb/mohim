import React, { useEffect, useCallback } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as U from "../utils";
import * as L from "../store/login";
import * as A from "../store/asyncStorage";
import axios from "axios";
import { useDispatch } from "react-redux";
import SplashScreen from "react-native-splash-screen";
import { Image, StyleSheet, View } from "react-native";
import { getCookie } from "../utils";

export default function Splash() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const goAuth = useCallback(() => navigation.navigate("AuthNavigator"), []);
  const goHome = useCallback(() => navigation.navigate("TabNavigator"), []);

  useEffect(() => {
    U.readFromStorage(L.loggedUserKey).then((value) => {
      if (value.length > 0) {
        U.readFromStorage("refreshJWT").then((refreshToken) => {
          axios
            .get("/api/users/refresh-all", {
              headers: { Authorization: `Bearer ${refreshToken}` },
            })
            .then((response) => {
              // 자동 로그인 진행
              const tokens = response.headers["set-cookie"][0];
              const accessToken = getCookie(tokens, "accessToken");
              const refreshToken = getCookie(tokens, "refreshToken");
              U.writeToStorage("accessJWT", accessToken);
              U.writeToStorage("refreshJWT", refreshToken);
              dispatch(A.setJWT(accessToken, refreshToken));
              U.readFromStorage(L.loggedUserKey)
                .then((value) => {
                  const user = JSON.parse(value);
                  const { email, name, password } = user;
                  dispatch(L.loginAction({ email, name, password }));
                })
                .then(() => {
                  SplashScreen.hide();
                  goHome();
                });
            })
            .catch((e) => {
              SplashScreen.hide(); // splashScreen 닫기
              goAuth(); // refresh 토큰 만료 -> 재로그인 과정으로 이동
            });
        });
      } else {
        // 로그인 정보가 없을 때
        SplashScreen.hide();
        goAuth(); // 첫 로그인 화면으로 이동
      }
    });
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/images/splash.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: "30%",
    width: "30%",
    resizeMode: "contain",
  },
});
