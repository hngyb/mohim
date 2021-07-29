import React from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import Auth from "./Auth";
import Login from "./Login";
import SignUp from "./SignUp";
import { Button } from "react-native";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      mode="modal"
    >
      <Stack.Screen name="Auth" component={Auth}></Stack.Screen>
      <Stack.Screen name="Login" component={Login}></Stack.Screen>
      <Stack.Screen name="SignUp" component={SignUp}></Stack.Screen>
    </Stack.Navigator>
  );
}
