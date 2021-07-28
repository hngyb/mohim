import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "react-native-paper";
import color from "color";

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;
export const headerHeight = windowHeight * 0.05;

export const buttonStyles = StyleSheet.create({
  longButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "lightgrey",
    justifyContent: "center",
  },
});
