import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "react-native-paper";
import color from "color";

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;
export const headerHeight = windowHeight * 0.05;
export const fontBold = "GmarketSansBold";
export const fontMedium = "GmarketSansMedium";
export const fontLight = "GmarketSansLight";
export const primaryColor = "#58DDC4";
export const secondayColor = "#DFE3E5";
export const buttonStyles = StyleSheet.create({
  longButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: secondayColor,
    justifyContent: "center",
  },
});
