import React, { useState, useCallback, useEffect } from "react";
import { AutoFocusProvider, useAutoFocus } from "../contexts";
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
import * as L from "../store/login";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import * as S from "./Styles";
import { NavigationHeader, TouchableView } from "../components";
import { ActivityIndicator, Colors } from "react-native-paper";
import { getCookie } from "../utils";

/*
Todo
2. 비밀번호 표시 이후 비밀번호 한 번에 지워지는 버그 해결
3. 키보드 가리지 않게 하기
5. 오토포커싱
 */
export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const focus = useAutoFocus();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(() => navigation.navigate("Auth"), []);
  const goOnboarding = useCallback(() => {
    if (email !== "" && name !== "" && password !== "") {
      setLoading(true);
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
              let tokens = response.headers["set-cookie"][0];
              const accessToken = getCookie(tokens, "accessToken");
              const refreshToken = getCookie(tokens, "refreshToken");
              U.writeToStorage("accessJWT", accessToken);
              U.writeToStorage("refreshJWT", refreshToken);
              dispatch(L.signUpAction({ name, email, password }));
              tokens = { accessToken, refreshToken };
              return tokens;
            })
            .then((tokens) => {
              dispatch(A.setJWT(tokens.accessToken, tokens.refreshToken));
              dispatch(L.loginAction({ email, name, password }));
              setLoading(false);
              navigation.navigate("OnBoarding");
            })
            .catch((e) => {
              setLoading(false);
              Alert.alert("비정상적인 접근입니다", "", [{ text: "확인" }]);
            });
        })
        .catch((e) => {
          setLoading(false);
          if (e.response.status === 409) {
            Alert.alert("이미 존재하는 계정입니다", "", [{ text: "확인" }]);
          }
        });
    } else Alert.alert("모든 정보를 입력해주세요", "", [{ text: "확인" }]);
  }, [name, email, password]);
  const goLogin = useCallback(() => {
    setTimeout(() => {
      navigation.navigate("Login");
    }, 500);
    navigation.goBack();
  }, []);

  useEffect(() => {
    if (
      email !== "" &&
      name !== "" &&
      password !== "" &&
      isEmailValid &&
      isPasswordValid
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [email, name, password, isEmailValid, isPasswordValid]);

  // input validation
  const emailRegex = /\S+@\S+\.\S+/;
  useEffect(() => {
    if (emailRegex.test(email)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  }, [email]);
  const passwordRegex = /(?=.*\d)(?=.*[a-z]).{8,}/;
  useEffect(() => {
    if (passwordRegex.test(password)) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  }, [password]);

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
              <Text style={[styles.startText]}>시작하기</Text>
            </View>
            <View style={{ flex: 1, marginBottom: 10 }}>
              <TextInput
                onFocus={focus}
                style={[styles.textInput]}
                value={name}
                onChangeText={setName}
                placeholder="이름"
                placeholderTextColor="gray"
                autoCapitalize="none"
              />
              <Text> </Text>
            </View>
            <View style={{ flex: 1, marginBottom: 10 }}>
              <TextInput
                onFocus={focus}
                style={[styles.textInput]}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text
                style={[
                  styles.validText,
                  { color: isEmailValid ? Colors.green500 : Colors.red500 },
                ]}
              >
                {email === ""
                  ? " "
                  : isEmailValid
                  ? "올바른 이메일 형식입니다 :)"
                  : "이메일을 확인해주세요 :("}
              </Text>
            </View>
            <View style={{ flex: 1, marginBottom: 15 }}>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <TextInput
                  // onFocus={focus}
                  style={[styles.passwordInput, { flex: 9 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호 (영문 / 숫자 조합 8자 이상)"
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
              <Text
                style={[
                  styles.validText,
                  { color: isPasswordValid ? Colors.green500 : Colors.red500 },
                ]}
              >
                {password === ""
                  ? " "
                  : isPasswordValid
                  ? "올바른 비밀번호 형식입니다 :)"
                  : "비밀번호를 확인해주세요 :("}
              </Text>
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
                  onPress={goOnboarding}
                  disabled={buttonDisabled}
                >
                  <Text
                    style={[
                      styles.bigText,
                      {
                        color: "white",
                      },
                    ]}
                  >
                    시작하기
                  </Text>
                </TouchableView>
              </View>
              <View style={{ flex: 3 }}></View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Text style={[styles.mediumText]}>
                  이미 계정을 갖고 계신가요?
                </Text>
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
                onPress={goLogin}
              >
                <Text style={[styles.bigText, { color: S.colors.primary }]}>
                  로그인하기
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
  textInputContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  startText: {
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
  validText: {
    fontFamily: S.fonts.light,
    fontWeight: "600",
    marginHorizontal: 10,
  },
});
