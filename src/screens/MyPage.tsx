import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";

export default function MyPage() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return <SafeAreaView></SafeAreaView>;
}

const styles = StyleSheet.create({});
