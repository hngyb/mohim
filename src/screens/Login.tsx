import React, { useState, useCallback } from "react";
import { AutoFocusProvider, useAutoFocus } from "../contexts";
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
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../store";
import * as U from "../utils";
import * as L from "../store/login";
import * as A from "../store/asyncStorage";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const focus = useAutoFocus();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
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
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity activeOpacity={0.8} onPress={goBack}>
        <Icon name="chevron-back-outline" size={30}></Icon>
      </TouchableOpacity>
      <View style={{ flex: 1 }}></View>
      <View style={{ flex: 3, paddingRight: 10, paddingLeft: 10 }}>
        <Text style={[styles.startText]}>로그인</Text>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={[
              styles.circleTouchableOpacity,
              { backgroundColor: "lightgrey" },
            ]}
            onPress={goTabNavigator}
          >
            <Text style={{ textAlign: "center", fontSize: 15 }}>
              카카오톡으로 로그인하기
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flex: 2,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Text style={{ textAlign: "center" }}>또는</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.textInputView]}>
            <TextInput
              onFocus={focus}
              style={[styles.textInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor="gray"
            />
            <TextInput
              onFocus={focus}
              style={[styles.textInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="gray"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.circleTouchableOpacity,
              { backgroundColor: "lightgrey" },
            ]}
            onPress={goTabNavigator}
          >
            <Text style={{ textAlign: "center", fontSize: 15 }}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{}}>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={goSignUp}>
            <Text style={{ textDecorationLine: "underline" }}> 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1, justifyContent: "center", alignItems: "center" },
  startText: {
    justifyContent: "flex-start",
    fontSize: 25,
  },
  textInputView: {
    flex: 3,
    justifyContent: "space-between",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "lightgrey",
    backgroundColor: "lightgrey",
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 5,
    fontSize: 15,
  },
  circleTouchableOpacity: {
    flex: 1,
    borderRadius: 25,
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 10,
  },
});
