import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MyPage from "./MyPage";
import BelongToGroups from "./BelongToGroups";
import FollowGroups from "./FollowGroups";
import AuthNavigator from "./AuthNavigator";

const Stack = createStackNavigator();

export default function MyPageNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyPage" component={MyPage}></Stack.Screen>
      <Stack.Screen
        name="AuthNavigator"
        component={AuthNavigator}
      ></Stack.Screen>
      <Stack.Screen
        name="BelongToGroups"
        component={BelongToGroups}
      ></Stack.Screen>
      <Stack.Screen name="FollowGroups" component={FollowGroups}></Stack.Screen>
    </Stack.Navigator>
  );
}
