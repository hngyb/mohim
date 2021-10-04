import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationHeader, TouchableView } from "../components";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useStore } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { ActivityIndicator, Avatar, Card } from "react-native-paper";
import Modal from "react-native-modal";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import axios from "axios";
import { getCookie } from "../utils";

export default function FollowGroups() {
  const [loading, setLoading] = useState(false);
  const [followingGroups, setFollowingGroups] = useState<Array<any>>([]);
  const [followingChanged, setFollowingChanged] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [colorChanged, setColorChanged] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number>();
  const [isColorPalettesModalVisible, setColorPalettesModalVisible] =
    useState(false);
  const [colorPalettesIndex, setColorPalettesIndex] = useState([
    ...Array(Math.ceil(S.colorPalettes.length / 5)).keys(),
  ]);
  const [parentWidth, setParentWidth] = useState(0);
  const store = useStore();
  const dispatch = useDispatch();
  const { accessJWT } = store.getState().asyncStorage;
  const [accessToken, setAccessToken] = useState<string>(accessJWT);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.navigate("MyPage"), []);

  const onLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  }, []);

  useEffect(() => {
    // 팔로잉 그룹 가져옥;
    setLoading(true);
    getFollowingGroups().catch(async (e) => {
      const errorStatus = e.response.status;
      if (errorStatus === 401) {
        await updateToken();
      } else {
        Alert.alert("비정상적인 접근입니다");
      }
    });
  }, [accessToken, followingChanged]);

  useEffect(() => {
    // 색상 수정
    if (colorChanged) {
      changeColor()
        .then(() => setFollowingChanged(!followingChanged))
        .catch(async (e) => {
          const errorStatus = e.response.status;
          if (errorStatus === 401) {
            await updateToken();
          } else {
            Alert.alert("비정상적인 접근입니다");
          }
        });
    }
  }, [accessToken, colorChanged]);

  const getFollowingGroups = async () => {
    const response = await axios.get(`/api/follows`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const follows = response.data;
    setFollowingGroups(follows);
    setLoading(false);
  };

  const updateToken = async () => {
    U.readFromStorage("refreshJWT").then((refreshJWT: any) => {
      // accessToken 재발급
      axios
        .get("/api/users/refresh-access", {
          headers: { Authorization: `Bearer ${refreshJWT}` },
        })
        .then((response) => {
          const tokens = response.headers["set-cookie"][0];
          const renewedAccessToken = getCookie(tokens, "accessToken");
          U.writeToStorage("accessJWT", renewedAccessToken);
          dispatch(A.setJWT(renewedAccessToken, refreshJWT));
          setAccessToken(renewedAccessToken);
        });
    });
  };

  const changeFollowing = (groupId: number, follow: boolean) => {
    const foundIdx = followingGroups.findIndex(
      (object) => object.GroupId === groupId
    );
    followingGroups[foundIdx].follow = !follow;
    if (follow === true) {
      // 언팔한 경우
      axios.post(
        "/api/follows/delete",
        {
          groupId: groupId,
        },
        { headers: { Authorization: `Bearer ${accessJWT}` } }
      );
    } else {
      // 팔로우한 경우
      axios.post(
        "/api/follows",
        {
          groupId: groupId,
        },
        { headers: { Authorization: `Bearer ${accessJWT}` } }
      );
    }
    setFollowingGroups(followingGroups);
    setFollowingChanged(!followingChanged);
  };

  const changeColor = async () => {
    axios.post(
      "/api/follows/color",
      {
        groupId: selectedGroupId,
        color: selectedColor,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  };

  const toggleColorPalettesModal = (item: any) => {
    setSelectedColor(item.item.color);
    setSelectedGroupId(item.item.GroupId);
    setColorPalettesModalVisible(!isColorPalettesModalVisible);
  };

  const renderColorPalettes = (index: number) => {
    return (
      <View
        key={index}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {S.colorPalettes.slice(index * 5, index * 5 + 5).map((color) => {
          return (
            <TouchableView
              onPress={() => setSelectedColor(color)}
              key={color}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: color,
                  width: parentWidth * 0.15,
                  height: parentWidth * 0.15,
                  borderWidth: 5,
                  borderColor:
                    color == selectedColor ? S.colors.primary : color,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = (item: any) => {
    const groupId = item.item.GroupId;
    const follow = true;
    const isBelongTo = item.item.isBelongTo;
    return (
      <View style={{ flex: 1 }}>
        <Card>
          <Card.Content
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flex: 5,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableView
                onPress={() => {
                  toggleColorPalettesModal(item);
                }}
                disabled={isBelongTo}
              >
                <Avatar.Text
                  label={item.item.FollowGroup.name[0]}
                  size={50}
                  style={{ backgroundColor: item.item.color }}
                  color="white"
                  labelStyle={{ fontFamily: S.fonts.bold, fontSize: 25 }}
                />
              </TouchableView>
              <View
                style={{
                  paddingHorizontal: 15,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: S.fonts.medium,
                    fontSize: 18,
                    marginBottom: 1,
                  }}
                >
                  {item.item.FollowGroup.name}
                </Text>
                <Text
                  style={{
                    fontFamily: S.fonts.medium,
                    fontSize: 12,
                    color: "grey",
                    marginBottom: 1,
                  }}
                >
                  {item.item.FollowGroup.church}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: S.fonts.medium,
                    fontSize: 12,
                    color: "grey",
                  }}
                >
                  {item.item.FollowGroup.category === "church"
                    ? "교회"
                    : item.item.FollowGroup.category === "district"
                    ? "구역"
                    : item.item.FollowGroup.category === "group"
                    ? "부서"
                    : item.item.FollowGroup.category === "service"
                    ? "봉사"
                    : item.item.FollowGroup.category === "fellowship"
                    ? "교제"
                    : ""}
                </Text>
              </View>
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: S.fonts.medium,
                color: "grey",
                fontSize: 12,
                alignSelf: "center",
              }}
            >
              {isBelongTo === true ? "소속" : ""}
            </Text>
            <TouchableView
              style={[
                styles.followingBox,
                {
                  backgroundColor: follow === true ? "white" : S.colors.primary,
                  borderColor:
                    follow === true ? S.colors.secondary : S.colors.primary,
                },
              ]}
              onPress={() => {
                changeFollowing(groupId, follow);
              }}
              disabled={isBelongTo}
            >
              <Text
                style={[
                  styles.followingText,
                  {
                    color: follow === true ? "black" : "white",
                  },
                ]}
              >
                {follow === true ? "팔로잉" : "팔로우"}
              </Text>
            </TouchableView>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => (
          <TouchableView onPress={goBack}>
            <Icon name="chevron-back" size={30}></Icon>
          </TouchableView>
        )}
      ></NavigationHeader>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={S.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={[styles.flatListContainer]}
          ListHeaderComponent={
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    paddingBottom: 10,
                  },
                ]}
              >
                팔로우 그룹
              </Text>
            </View>
          }
          data={followingGroups}
          renderItem={renderItem}
          keyExtractor={(item, index) => `_key${index.toString()}`}
        />
      )}
      <Modal
        style={{
          margin: 0,
          justifyContent: "flex-end",
        }}
        isVisible={isColorPalettesModalVisible}
        onSwipeComplete={() =>
          setColorPalettesModalVisible(!isColorPalettesModalVisible)
        }
        swipeDirection="down"
      >
        <View
          style={{
            flex: 0.7,
            backgroundColor: "white",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            paddingHorizontal: "5%",
          }}
        >
          <View
            style={{
              height: "8%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableView
              onPress={() =>
                setColorPalettesModalVisible(!isColorPalettesModalVisible)
              }
              style={{
                alignSelf: "center",
                flex: 1,
              }}
            >
              <Icon name="close" size={25}></Icon>
            </TouchableView>
            <Text
              style={[
                styles.text,
                {
                  alignSelf: "center",
                  textAlign: "center",
                  flex: 1,
                },
              ]}
            >
              색상
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ flex: 2 }} onLayout={onLayout}>
            {colorPalettesIndex.map((index) => {
              return renderColorPalettes(index);
            })}
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableView
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: S.colors.primary,
                  flex: 0.3,
                },
              ]}
              onPress={() => {
                setColorChanged(!colorChanged);
                setColorPalettesModalVisible(!isColorPalettesModalVisible);
              }}
            >
              <Text style={[styles.reviseText]}>수정</Text>
            </TouchableView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  text: {
    fontFamily: S.fonts.bold,
    fontSize: 20,
  },
  followingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: S.colors.primary,
    borderRadius: 5,
    borderWidth: 1,
    margin: 10,
  },
  followingText: {
    fontFamily: S.fonts.medium,
    fontSize: 12,
    color: "white",
  },
  colorCircle: {
    borderRadius: 100 / 2,
    margin: 5,
  },
  reviseText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
    color: "white",
  },
});
