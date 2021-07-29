import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return <SafeAreaView></SafeAreaView>;
}

const styles = StyleSheet.create({});
