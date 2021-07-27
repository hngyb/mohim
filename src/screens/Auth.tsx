import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAnimatedValue, useStyle } from "../hooks";
import { interpolate } from "../utils";

export default function Auth() {
  const navigation = useNavigation();
  const goLogIn = useCallback(() => {
    navigation.navigate("Login");
  }, []);
  const goSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, []);

  const imageAnimValue = useAnimatedValue(0);
  const buttonAnimValue = useAnimatedValue(0);
  const imageAnimStyle = useStyle({
    transform: [
      {
        translateY: interpolate(imageAnimValue, [0, -70]),
      },
    ],
  });
  Animated.sequence([
    Animated.timing(imageAnimValue, {
      useNativeDriver: true,
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
    }),
    Animated.timing(buttonAnimValue, {
      useNativeDriver: true,
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
    }),
  ]).start();

  return (
    <View style={[styles.view]}>
      <Animated.Image
        source={require("../assets/images/logo.png")}
        style={[
          {
            position: "absolute",
            width: "20%",
            resizeMode: "contain",
          },
          imageAnimStyle,
        ]}
      ></Animated.Image>
      <View style={[styles.view]}></View>
      <View style={[styles.view]}>
        <Animated.View
          style={[styles.signUpView, { opacity: buttonAnimValue }]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button]}
            onPress={goSignUp}
          >
            <Text style={[styles.text]}>카카오톡으로 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button]}
            onPress={goSignUp}
          >
            <Text style={[styles.text]}>이메일로 시작하기</Text>
          </TouchableOpacity>
          <Text style={[styles.agreementText]}>
            계정을 등록함으로써, 귀하는 이용약관 및 개인 정보 보호 정책에
            동의하시게 됩니다.
          </Text>
        </Animated.View>
        <Animated.View style={[styles.logInView, { opacity: buttonAnimValue }]}>
          <Text>계정이 이미 있으신가요?</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button]}
            onPress={goLogIn}
          >
            <Text style={[styles.text]}>로그인</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  agreementText: {
    fontSize: 11,
    flexWrap: "wrap",
    paddingTop: 10,
    paddingLeft: 50,
    paddingRight: 50,
  },
  logInView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    margin: 10,
  },
  text: {
    fontSize: 20,
  },
});
