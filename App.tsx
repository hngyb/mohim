import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as ReduxProvider } from "react-redux";
import { makeStore } from "./src/store";
import MainNavigator from "./src/screens/MainNavigator";
import axios from "axios";

const store = makeStore();
axios.defaults.baseURL = "http://localhost:9179";
axios.defaults.withCredentials = true;

export default function App() {
  return (
    <ReduxProvider store={store}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </ReduxProvider>
  );
}
