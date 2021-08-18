import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAnimatedValue } from "../hooks";
import { NavigationHeader, TouchableView } from "../components";
import * as S from "./Styles";

/*
Todo
1. 이용약관 및 개인 정보 정책 페이지 제작 및 연결
 */

export default function Auth() {
  const navigation = useNavigation();
  const goLogin = useCallback(() => {
    navigation.navigate("Login");
  }, []);
  const goSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, []);

  const imageAnimValue = useAnimatedValue(0);
  const authAnimValue = useAnimatedValue(0);
  Animated.sequence([
    Animated.timing(imageAnimValue, {
      useNativeDriver: true,
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
    }),
    Animated.timing(authAnimValue, {
      useNativeDriver: true,
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
    }),
  ]).start();

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader></NavigationHeader>
      <View style={[styles.imageContainer]}>
        <Animated.Image
          source={require("../assets/images/authImage.png")}
          style={[styles.image, { opacity: imageAnimValue }]}
        />
      </View>
      <View style={[styles.authContainer]}>
        <Animated.View style={{ flex: 1, opacity: authAnimValue }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }} />
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                { backgroundColor: S.colors.primary },
              ]}
              onPress={goSignUp}
            >
              <Text style={[styles.bigText, { color: "white" }]}>
                이메일로 시작하기
              </Text>
            </TouchableView>
            <View style={{ flex: 2, justifyContent: "flex-end" }}>
              <Text style={[styles.mediumText]}>
                이미 계정을 갖고 계신가요?
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
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
            </View>
            <View
              style={{
                flex: 3,
                justifyContent: "center",
                paddingHorizontal: "10%",
              }}
            >
              <View style={{ flex: 1 }}></View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text>
                  <Text style={[styles.smallText]}>
                    {"계정을 등록함으로써, 귀하는 '모임'의 "}
                  </Text>
                  <Text
                    style={[
                      styles.smallText,
                      {
                        textDecorationLine: "underline",
                      },
                    ]}
                    onPress={goLogin}
                  >
                    {"이용약관"}
                  </Text>
                  <Text style={[styles.smallText]}>{" 및 \n"}</Text>
                  <Text
                    style={[
                      styles.smallText,
                      { textDecorationLine: "underline" },
                    ]}
                    onPress={goLogin}
                  >
                    개인 정보 보호 정책
                  </Text>
                  <Text style={[styles.smallText]}>에 동의하시게 됩니다.</Text>
                </Text>
              </View>
              <View style={{ flex: 1 }}></View>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
  },
  authContainer: {
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
  smallText: {
    fontFamily: S.fonts.light,
    textAlign: "center",
    fontSize: 11,
  },
});
