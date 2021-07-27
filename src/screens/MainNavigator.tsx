import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Loading from "./Loading";
import AuthNavigator from "./AuthNavigator";
import Home from "./Home";

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loading" component={Loading}></Stack.Screen>
      <Stack.Screen
        name="AuthNavigator"
        component={AuthNavigator}
        options={{
          animationEnabled: false,
        }}
      ></Stack.Screen>
      <Stack.Screen name="Home" component={Home}></Stack.Screen>
    </Stack.Navigator>
  );
}
