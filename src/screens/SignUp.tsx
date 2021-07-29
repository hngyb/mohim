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
import { Colors } from "react-native-paper";
import CheckBox from "react-native-check-box";
import Color from "color";

/*
Todo
3. 키보드 가리지 않게 하기
5. 오토포커싱
 */
export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const focus = useAutoFocus();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = useCallback(() => navigation.navigate("Auth"), []);
  const goTabNavigator = useCallback(() => {
    if (email !== "" && name !== "" && password !== "") {
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
    } else Alert.alert("모든 정보를 입력해주세요.");
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
  }, [email, name, password]);

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
        <View style={{ flex: 1 }}>
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
        <View style={{ flex: 1 }}>
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
        <View style={{ flex: 1 }}>
          <TextInput
            onFocus={focus}
            style={[styles.textInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 (영문 / 숫자 조합 8자 이상)"
            placeholderTextColor="gray"
            secureTextEntry={showPassword}
            autoCapitalize="none"
          />
          <Text
            style={[
              styles.validText,
              { color: isPasswordValid ? Colors.green500 : Colors.red500 },
            ]}
          >
            {password === ""
              ? " "
              : isPasswordValid
              ? "올바른 비밀번호입니다 :)"
              : "비밀번호를 확인해주세요 :("}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <CheckBox
              isChecked={!showPassword}
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              style={{ marginHorizontal: 10 }}
            />
          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: 15 }}>비밀번호 보기</Text>
          </View>
        </View>
      </View>
      <View style={[styles.buttonContainer]}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 1 }}>
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: buttonDisabled
                    ? Color(Colors.grey300).alpha(0.5).string()
                    : "lightgrey",
                },
              ]}
              onPress={goTabNavigator}
              disabled={buttonDisabled}
            >
              <Text
                style={[
                  styles.bigText,
                  { color: buttonDisabled ? Colors.grey400 : "black" },
                ]}
              >
                시작하기
              </Text>
            </TouchableView>
          </View>
          <View style={{ flex: 2 }}></View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text style={[styles.mediumText]}>이미 계정을 갖고 계신가요?</Text>
          </View>
          <TouchableView style={[S.buttonStyles.longButton]} onPress={goLogin}>
            <Text style={[styles.bigText]}>로그인하기</Text>
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
  startText: {
    fontSize: 35,
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    backgroundColor: "lightgrey",
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 5,
    fontSize: 18,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  bigText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  mediumText: {
    textAlign: "center",
    fontSize: 15,
    paddingBottom: 10,
  },
  validText: {
    marginHorizontal: 10,
  },
});
