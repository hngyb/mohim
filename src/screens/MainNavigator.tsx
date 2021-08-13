import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Loading from "./Loading";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import OnBoarding from "./OnBoarding";

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyleInterpolator: forFade }}
    >
      <Stack.Screen name="Loading" component={Loading}></Stack.Screen>
      <Stack.Screen
        name="AuthNavigator"
        component={AuthNavigator}
      ></Stack.Screen>
      <Stack.Screen name="OnBoarding" component={OnBoarding}></Stack.Screen>
      <Stack.Screen name="TabNavigator" component={TabNavigator}></Stack.Screen>
    </Stack.Navigator>
  );
}

export const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});
