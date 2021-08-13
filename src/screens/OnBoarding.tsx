import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import SetChurch from "./SetChurch";
import SetSex from "./SetSex";
import SetDistrict from "./SetDistrict";
import SetGroup from "./SetGroup";
import SetService from "./SetService";
import RequestAuthorization from "./RequestAuthorization";

const Stack = createStackNavigator();

export default function OnBoarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SetChurch" component={SetChurch}></Stack.Screen>
      <Stack.Screen name="SetSex" component={SetSex}></Stack.Screen>
      <Stack.Screen name="SetDistrict" component={SetDistrict}></Stack.Screen>
      <Stack.Screen name="SetGroup" component={SetGroup}></Stack.Screen>
      <Stack.Screen name="SetService" component={SetService}></Stack.Screen>
      <Stack.Screen
        name="RequestAuthorization"
        component={RequestAuthorization}
      ></Stack.Screen>
      <Stack.Screen name="TabNavigator" component={TabNavigator}></Stack.Screen>
    </Stack.Navigator>
  );
}
