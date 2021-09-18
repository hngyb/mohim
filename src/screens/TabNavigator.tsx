import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Colors } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import Home from "./Home";
import Search from "./Search";
import MyPageNavigator from "./MyPageNavigator";
import type { RouteProp, ParamListBase } from "@react-navigation/native";
import * as S from "./Styles";

type TabBarIconProps = { focused: boolean; color: string; size: number };

const icons: Record<string, string[]> = {
  Home: ["home", "home-outline"],
  Search: ["search", "search-outline"],
  MyPage: ["person", "person-outline"],
};
const screenOptions = ({
  route,
}: {
  route: RouteProp<ParamListBase, string>;
}) => {
  return {
    tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
      const { name } = route;
      const focusedSize = size;
      const focusedColor = focused ? Colors.black : color;
      const [icon, iconOutline] = icons[name];
      const iconName = focused ? icon : iconOutline;
      return <Icon name={iconName} size={focusedSize} color={focusedColor} />;
    },
  };
};

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        style: { backgroundColor: S.colors.secondary },
        activeTintColor: Colors.black,
        labelStyle: {
          fontFamily: S.fonts.medium,
        },
      }}
      screenOptions={screenOptions}
      sceneContainerStyle={{ backgroundColor: "white" }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: "홈" }}
      ></Tab.Screen>
      <Tab.Screen
        name="Search"
        component={Search}
        options={{ tabBarLabel: "그룹 검색" }}
      ></Tab.Screen>
      <Tab.Screen
        name="MyPage"
        component={MyPageNavigator}
        options={{ tabBarLabel: "마이페이지" }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}
