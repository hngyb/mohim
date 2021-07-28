import React, { useEffect, useCallback } from "react";
import { Image, StyleSheet, View, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as U from "../utils";
import * as L from "../store/login";
import * as A from "../store/asyncStorage";
import axios from "axios";
import { useDispatch } from "react-redux";
import SplashScreen from "react-native-splash-screen";

export default function () {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goAuth = useCallback(() => navigation.navigate("AuthNavigator"), []);
  const goHome = useCallback(() => navigation.navigate("Home"), []);

  useEffect(() => {
    U.readFromStorage(L.loggedUserKey).then((value) => {
      if (value.length > 0) {
        U.readFromStorage("refreshJWT").then((refreshToken) => {
          axios
            .get("/api/users/refresh", {
              headers: { Authorization: `Bearer ${refreshToken}` },
            })
            .then((response) => {
              // 자동 로그인 진행
              const { accessToken, refreshToken } = response.data;
              U.writeToStorage("accessJWT", accessToken);
              U.writeToStorage("refreshJWT", refreshToken);
              dispatch(A.setJWT(accessToken, refreshToken));
              U.readFromStorage(L.loggedUserKey).then((value) => {
                const user = JSON.parse(value);
                const { email, name, password } = user;
                dispatch(L.loginAction({ email, name, password }));
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
        const id = setTimeout(() => {
          SplashScreen.hide();
          goAuth(); // 첫 로그인 화면으로 이동
        }, 2000);
      }
    });
  }, []);

  return null;
}
