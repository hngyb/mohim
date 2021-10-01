import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import OnBoarding from "./OnBoarding";
import Splash from "./Splash";

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyleInterpolator: forFade }}
    >
      <Stack.Screen name="Splash" component={Splash}></Stack.Screen>
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
