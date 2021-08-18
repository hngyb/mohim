import { Dimensions, StyleSheet } from "react-native";

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;
export const headerHeight = windowHeight * 0.05;

export const colors = {
  primary: "#58DDC4",
  secondary: "#DFE3E5",
};

export const fonts = {
  bold: "GmarketSansBold",
  medium: "GmarketSansMedium",
  light: "GmarketSansLight",
};

export const buttonStyles = StyleSheet.create({
  longButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
  },
});

export const colorPalettes = new Array(
  "#B71C1C",
  "#FF8A80",
  "#A1887F",
  "#795548",
  "#C5E1A5",
  "#004D40",
  "#80D8FF",
  "#2979FF",
  "#E0E0E0",
  "#FFEB3B",
  "#E53935",
  "#0097A7",
  "#64B5F6",
  "#81D4FA",
  "#7986CB",
  "#FFF8E1",
  "#FFECB3",
  "#FFE082",
  "#DCE775",
  "#FF7043",
  "#FFEB3B",
  "#FFD180",
  "#BDBDBD",
  "#78909C",
  "#37474F"
);
