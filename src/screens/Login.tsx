import React, { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import * as U from "../utils";
import * as L from "../store/login";
import * as A from "../store/asyncStorage";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { NavigationHeader, TouchableView } from "../components";

/*
Todo
1. 비밀번호 잊었을 때
2. 비밀번호 피드백
 */
export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(() => navigation.navigate("Auth"), []);
  const goHome = useCallback(() => navigation.navigate("Home"), []);
  const goTabNavigator = useCallback(() => {
    axios
      .post("/api/users/login", { email, password })
      .then((response) => {
        const { accessToken, refreshToken, name } = response.data;
        U.writeToStorage("accessJWT", accessToken);
        U.writeToStorage("refreshJWT", refreshToken);
        U.writeToStorage(
          L.loggedUserKey,
          JSON.stringify({ email, name, password })
        );
        dispatch(A.setJWT(accessToken, refreshToken));
        dispatch(L.loginAction({ email, name, password }));
        goHome();
      })
      .catch((e) => {
        if (e.response.status === 401) {
          Alert.alert("이메일 또는 비밀번호를 확인해주세요.");
        } else {
          Alert.alert("비정상적인 접근입니다.");
        }
      });
  }, [email, password]);
  const goSignUp = useCallback(() => navigation.navigate("SignUp"), []);

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => (
          <TouchableView onPress={goBack}>
            <Icon name="close" size={30}></Icon>
          </TouchableView>
        )}
      ></NavigationHeader>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
