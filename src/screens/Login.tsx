import React, { useState, useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import * as U from "../utils";
import * as L from "../store/login";
import * as A from "../store/asyncStorage";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";
import { getCookie } from "../utils";

/*
Todo
1. 비밀번호 찾기 페이지 제작 및 연결
2. 비밀번호 표시 이후 비밀번호 한 번에 지워지는 버그 해결
 */
export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(() => navigation.navigate("Auth"), []);
  const goHome = useCallback(() => navigation.navigate("TabNavigator"), []);
  const goTabNavigator = useCallback(() => {
    axios
      .post("/api/users/login", { email, password })
      .then((response) => {
        const tokens = response.headers["set-cookie"][0];
        const accessToken = getCookie(tokens, "accessToken");
        const refreshToken = getCookie(tokens, "refreshToken");
        const { name } = response.data.user;
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
          Alert.alert("이메일 또는 비밀번호를 확인해주세요", "", [
            { text: "확인" },
          ]);
        } else {
          Alert.alert("비정상적인 접근입니다", "", [{ text: "확인" }]);
        }
      });
  }, [email, password]);
  const goSignUp = useCallback(() => {
    setTimeout(() => {
      navigation.navigate("SignUp");
    }, 500);
    navigation.goBack();
  }, []);

  useEffect(() => {
    if (email !== "" && password !== "") {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [email, password]);

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => (
          <TouchableView onPress={goBack}>
            <Icon name="close" size={30}></Icon>
          </TouchableView>
        )}
      ></NavigationHeader>
      <View style={[styles.textInputContainer]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Text style={[styles.loginText]}>로그인하기</Text>
        </View>
        <View style={{ flex: 3 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              // onFocus={focus}
              style={[styles.textInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <TextInput
              // onFocus={focus}
              style={[styles.passwordInput, { flex: 9 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="gray"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <View style={[styles.showPasswordIcon]}>
              <Icon
                name={showPassword ? "eye" : "eye-off"}
                size={25}
                color="gray"
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <TouchableView>
              <Text
                style={[
                  styles.mediumText,
                  { textDecorationLine: "underline", marginTop: 10 },
                ]}
              >
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableView>
          </View>
        </View>
      </View>
      <View style={[styles.buttonContainer]}>
        <View style={{ flex: 1 }}>
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
              onPress={goTabNavigator}
              disabled={buttonDisabled}
            >
              <Text style={[styles.bigText, { color: "white" }]}>
                로그인하기
              </Text>
            </TouchableView>
          </View>
          <View style={{ flex: 3 }}></View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text style={[styles.mediumText]}>계정이 없으신가요?</Text>
          </View>
          <TouchableView
            style={[
              S.buttonStyles.longButton,
              {
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: S.colors.primary,
              },
            ]}
            onPress={goSignUp}
          >
            <Text style={[styles.bigText, { color: S.colors.primary }]}>
              시작하기
            </Text>
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
  textInputContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  loginText: {
    fontFamily: S.fonts.bold,
    fontSize: 35,
  },
  textInput: {
    fontFamily: S.fonts.medium,
    flex: 1,
    backgroundColor: S.colors.secondary,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 5,
    marginBottom: 15,
    fontSize: 18,
  },
  passwordInput: {
    fontFamily: S.fonts.medium,
    flex: 1,
    backgroundColor: S.colors.secondary,
    borderRadius: 5,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginTop: 15,
    marginLeft: 5,
    fontSize: 18,
  },
  showPasswordIcon: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: S.colors.secondary,
    borderRadius: 5,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingRight: 10,
    marginRight: 5,
    marginVertical: 5,
    marginTop: 15,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  bigText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
  },
  mediumText: {
    fontFamily: S.fonts.medium,
    textAlign: "center",
    fontSize: 15,
    paddingBottom: 10,
  },
});
