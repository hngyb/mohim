import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider as ReduxProvider } from "react-redux";
import { makeStore } from "./src/store";
import MainNavigator from "./src/screens/MainNavigator";
import axios from "axios";

const store = makeStore();
axios.defaults.baseURL = "http://localhost:9179";
// axios.defaults.baseURL = "https://mohim.loca.lt";
axios.defaults.withCredentials = true;

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
  },
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <NavigationContainer theme={MyTheme}>
        <MainNavigator />
      </NavigationContainer>
    </ReduxProvider>
  );
}
