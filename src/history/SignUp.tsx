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
import { useDispatch } from "react-redux";
import * as L from "../store/login";
import * as U from "../utils";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import * as A from "../store/asyncStorage";

/*
1. '시작하기' 버튼 비활성화
2. 비밀번호 숨김 및 보이기 기능
3. 키보드 가리지 않게 하기
4. 자동 대문자 기능 없애기
5. 오토포커싱
6. 이메일 입력 필드는 이메일 키보드로
7. 이메일 형식 피드백 표시
 */
export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>(password);
  const focus = useAutoFocus();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    []
  );
  const goTabNavigator = useCallback(() => {
    if (password === confirmPassword) {
      axios
        .post("/api/users", {
          email,
          name,
          password,
        })
        .then(() => {
          axios
            .post("/api/users/login", { email, password })
            .then((response) => {
              const { accessToken, refreshToken } = response.data;
              U.writeToStorage("accessJWT", accessToken);
              U.writeToStorage("refreshJWT", refreshToken);
              dispatch(L.signUpAction({ name, email, password }));
              const tokens = { accessToken, refreshToken };
              return tokens;
            })
            .then((tokens) => {
              dispatch(A.setJWT(tokens.accessToken, tokens.refreshToken));
              dispatch(L.loginAction({ email, name, password }));
              navigation.navigate("Home");
            })
            .catch((e) => {
              Alert.alert("비정상적인 접근입니다.");
            });
        })
        .catch((e) => {
          if (e.response.status === 409) {
            Alert.alert("이미 존재하는 계정입니다.");
          }
        });
    } else Alert.alert("비밀번호를 확인해주세요.");
  }, [name, email, password, confirmPassword]);
  const goLogin = useCallback(() => navigation.navigate("Login"), []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity activeOpacity={0.8} onPress={goBack}>
        <Icon name="chevron-back-outline" size={30}></Icon>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.startText]}>시작하기</Text>
        <View style={[styles.textInputView]}>
          <TextInput
            onFocus={focus}
            style={[styles.textInput]}
            value={name}
            onChangeText={setName}
            placeholder="이름"
            placeholderTextColor="gray"
          />
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
            placeholder="영문 / 숫자 조합 8자 이상"
            placeholderTextColor="gray"
          />
          <TextInput
            onFocus={focus}
            style={[styles.textInput]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="비밀번호 재입력"
            placeholderTextColor="gray"
          />
        </View>
      </View>
      <View style={{ flex: 1, paddingRight: 10, paddingLeft: 10 }}>
        <View style={[{ flex: 1 }]}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                styles.circleTouchableOpacity,
                { backgroundColor: "lightgrey" },
              ]}
              onPress={goTabNavigator}
            >
              <Text style={{ textAlign: "center", fontSize: 15 }}>
                시작하기
              </Text>
            </TouchableOpacity>
            <Text style={{ textAlign: "center" }}>또는</Text>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                styles.circleTouchableOpacity,
                { backgroundColor: "lightgrey" },
              ]}
              onPress={goTabNavigator}
            >
              <Text style={{ textAlign: "center", fontSize: 15 }}>
                카카오톡으로 시작하기
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={{}}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={goLogin}>
                <Text style={{ textDecorationLine: "underline" }}> 로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1, justifyContent: "center", alignItems: "center" },
  startText: {
    justifyContent: "flex-start",
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 25,
  },
  textInputView: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 10,
    paddingLeft: 10,
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
    marginBottom: 30,
  },
});
