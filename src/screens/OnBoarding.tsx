import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SetChurch from "./SetChurch";
import SetSex from "./SetSex";
import SetDistrict from "./SetDistrict";
import setDepartment from "./SetDepartment";
import SetService from "./SetService";
import RequestAuthorization from "./RequestAuthorization";

const Stack = createStackNavigator();

export default function OnBoarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SetChurch" component={SetChurch}></Stack.Screen>
      <Stack.Screen name="SetSex" component={SetSex}></Stack.Screen>
      <Stack.Screen name="SetDistrict" component={SetDistrict}></Stack.Screen>
      <Stack.Screen
        name="SetDepartment"
        component={setDepartment}
      ></Stack.Screen>
      <Stack.Screen name="SetService" component={SetService}></Stack.Screen>
      <Stack.Screen
        name="RequestAuthorization"
        component={RequestAuthorization}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
