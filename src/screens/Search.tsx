import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useStore } from "react-redux";
import { NavigationHeader, TouchableView } from "../components";
import realm from "../models";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, Avatar, Card } from "react-native-paper";

export default function Search() {
  const [parentWidth, setParentWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [churchList, setChurchList] = useState<Array<any>>([]);
  const [selectedTempChurch, setSelectedTempChurch] = useState<string>("");
  const [searchDisable, setSearchDisabled] = useState<boolean>(true);
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<String>("전체");
  const [searchedData, setSearchedData] = useState<Array<any>>([]);
  const [requestAgain, setRequestAgain] = useState<boolean>(false);
  const [followingChanged, setFollowingChanged] = useState<boolean>(false);
  const [isChurchModalVisible, setChurchModalVisible] = useState(false);
  const store = useStore();
  const dispatch = useDispatch();
  const { accessJWT } = store.getState().asyncStorage;
  const { email } = store.getState().login.loggedUser;

  const onLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  }, []);

  useEffect(() => {
    axios
      .get("/api/groups/church-list", {
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then((churchResponse) => {
        setChurchList(churchResponse.data);
        setSelectedTempChurch(churchResponse.data[0].name);
        setRequestAgain(false);
      })
      .catch((e) => {
        const errorStatus = e.response.status;
        if (errorStatus === 401) {
          // accessToken 만료
          U.readFromStorage("refreshJWT").then((refreshToken: any) => {
            // accessToken 재발급
            axios
              .get("/api/users/refresh-access", {
                headers: { Authorization: `Bearer ${refreshToken}` },
              })
              .then((response) => {
                const renewedAccessToken = response.data.accessToken;
                U.writeToStorage("accessJWT", renewedAccessToken);
                dispatch(A.setJWT(renewedAccessToken, refreshToken));
              })
              .then(() => {
                // 재요청
                setRequestAgain(true);
              });
          });
        } else {
          Alert.alert("비정상적인 접근입니다");
        }
      });
  }, [requestAgain]);

  const toggleChurchModal = () => {
    setChurchModalVisible(!isChurchModalVisible);
  };

  const selectChurch = async (selectedTempChurch: string) => {
    setSearchDisabled(false);
    setSelectedChurch(selectedTempChurch);
    search("전체");
    toggleChurchModal();
    setLoading(true);
  };

  const search = (selectedCategory: string) => {
    setSelectedCategory(selectedCategory);
    let search_address = "";
    selectedCategory === "전체"
      ? (search_address = "all-list")
      : selectedCategory === "구역"
      ? (search_address = "district-list")
      : selectedCategory === "소속"
      ? (search_address = "group-list")
      : (search_address = "service-list");

    axios
      .get(`/api/groups/${search_address}`, {
        params: {
          church: selectedTempChurch,
        },
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then(async (response) => {
        async function getIsBelongTo(groupId: number) {
          const belongToGroup: any = realm
            .objects("Follows")
            .filtered(
              `deletedAt == null and userId == "${email}" and groupId = "${groupId}"`
            );
          return belongToGroup.length === 0
            ? { follow: false, isBelongTo: false }
            : { follow: true, isBelongTo: belongToGroup[0].isBelongTo };
        }

        const groups = response.data;
        const addedGroups = Promise.all(
          groups.map(async (group: any) => {
            const groupId = group.id;
            const followBelongTo = await getIsBelongTo(groupId);
            return {
              ...group,
              follow: followBelongTo.follow,
              isBelongTo: followBelongTo.isBelongTo,
            };
          })
        );
        return addedGroups;
      })
      .then((groups) => {
        setSearchedData(groups);
        setLoading(false);
      });
  };

  const churchModal = () => {
    return (
      <Modal
        style={{
          margin: 0,
          justifyContent: "flex-end",
        }}
        isVisible={isChurchModalVisible}
        onSwipeComplete={toggleChurchModal}
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
              onPress={toggleChurchModal}
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
              교회
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ flex: 2 }} onLayout={onLayout}>
            <Picker
              style={{
                flex: 1,
                justifyContent: "center",
              }}
              itemStyle={{
                fontFamily: S.fonts.medium,
              }}
              selectedValue={selectedTempChurch}
              onValueChange={(itemValue, itemIndex) => {
                setSelectedTempChurch(itemValue);
              }}
            >
              {churchList.map((church) => {
                return (
                  <Picker.Item
                    key={church}
                    label={church.name}
                    value={church.name}
                  />
                );
              })}
            </Picker>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableView
              onPress={() => selectChurch(selectedTempChurch)}
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: S.colors.primary,
                  flex: 0.3,
                },
              ]}
            >
              <Text style={[styles.confirmText]}>검색</Text>
            </TouchableView>
          </View>
        </View>
      </Modal>
    );
  };

  const changeFollowing = (
    groupId: number,
    follow: boolean,
    groupName: string,
    category: string,
    church: string
  ) => {
    setFollowingChanged(!followingChanged);
    const foundIdx = searchedData.findIndex((object) => object.id === groupId);
    searchedData[foundIdx].follow = !follow;
    setSearchedData(searchedData);

    if (follow === true) {
      // 원래 팔로잉 중이었으나 언팔한 경우
      realm.write(() => {
        const object = realm
          .objects("Follows")
          .filtered(
            `deletedAt == null and userId == "${email}" and groupId == "${groupId}"`
          );
        realm.delete(object);
        const events = realm
          .objects("Events")
          .filtered(
            `deletedAt == null and userId == "${email}" and groupId == "${groupId}"`
          );
        const idArray: any = [];
        events.forEach((item: any) => {
          idArray.push(item.id);
        });
        idArray.map((id: number) => {
          realm.create(
            "Events",
            {
              id: id,
              deletedAt: Date(),
            },
            Realm.UpdateMode.Modified
          );
        });
      });
      axios.post(
        "/api/follows/delete",
        {
          groupId: groupId,
        },
        { headers: { Authorization: `Bearer ${accessJWT}` } }
      );
    } else {
      // 팔로잉
      realm.write(() => {
        realm.create(
          "Groups",
          {
            id: groupId,
            userId: email,
            name: groupName,
            church: church,
            isPublic: true,
            category: category,
          },
          Realm.UpdateMode.Modified
        );
        const newGroup = realm.create(
          "Follows",
          {
            groupId: groupId,
            userId: email,
            isBelongTo: false,
          },
          Realm.UpdateMode.Modified
        );
        const events = realm
          .objects("Events")
          .filtered(`userId == "${email}" and groupId == "${groupId}"`)
          .map((event: any) => {
            realm.create(
              "Events",
              {
                id: event.id,
                deletedAt: null,
              },
              Realm.UpdateMode.Modified
            );
          });
      });
      // api post
      axios
        .post(
          "/api/follows",
          {
            groupId: groupId,
          },
          { headers: { Authorization: `Bearer ${accessJWT}` } }
        )
        .then((response) => {
          // 색상 업데이트
          const color = response.data.color;
          realm.write(() => {
            realm.create(
              "Follows",
              {
                groupId: groupId,
                userId: email,
                color: color,
              },
              Realm.UpdateMode.Modified
            );
          });
        });
    }
  };

  const renderItem = (item: any) => {
    const groupId = item.item.id;
    const follow = item.item.follow;
    const isBelongTo = item.item.isBelongTo;
    const groupName = item.item.name;
    const category = item.item.category;
    const church = item.item.church;
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
              <Avatar.Text
                label={item.item.name[0]}
                size={50}
                style={{ backgroundColor: S.colors.secondary }}
                color="white"
                labelStyle={{ fontFamily: S.fonts.bold, fontSize: 25 }}
              />
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
                  {item.item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: S.fonts.medium,
                    fontSize: 12,
                    color: "grey",
                    marginBottom: 1,
                  }}
                >
                  {item.item.church}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: S.fonts.medium,
                    fontSize: 12,
                    color: "grey",
                  }}
                >
                  {item.item.category === "church"
                    ? "교회"
                    : item.item.category === "district"
                    ? "구역"
                    : item.item.category === "group"
                    ? "소속"
                    : item.item.category === "service"
                    ? "봉사"
                    : item.item.category === "fellowship"
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
              {isBelongTo === true ? "소속 그룹" : ""}
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
                changeFollowing(groupId, follow, groupName, category, church);
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
        Right={() => <TouchableView></TouchableView>}
      ></NavigationHeader>
      <View style={[styles.searchContainer]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <TouchableView
            style={[styles.searchBar]}
            activeOpacity={0.7}
            onPress={toggleChurchModal}
          >
            <Text>
              <Icon name="search-outline" size={20}></Icon>
              <Text
                style={{
                  fontFamily: S.fonts.medium,
                  fontSize: 20,
                  color: "grey",
                }}
              >
                {"   "}
                {selectedChurch == "" ? "교회를 선택해 주세요" : selectedChurch}
              </Text>
            </Text>
          </TouchableView>
        </View>
        {churchModal()}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableView
            style={[
              styles.categoryContainer,
              {
                backgroundColor:
                  selectedCategory == "전체" ? S.colors.primary : "white",
                borderColor:
                  selectedCategory == "전체"
                    ? S.colors.primary
                    : S.colors.secondary,
              },
            ]}
            onPress={() => search("전체")}
            disabled={searchDisable}
          >
            <View style={[styles.category]}>
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory == "전체" ? "white" : "black" },
                ]}
              >
                전체
              </Text>
            </View>
          </TouchableView>
          <TouchableView
            style={[
              styles.categoryContainer,
              {
                backgroundColor:
                  selectedCategory == "구역" ? S.colors.primary : "white",
                borderColor:
                  selectedCategory == "구역"
                    ? S.colors.primary
                    : S.colors.secondary,
              },
            ]}
            onPress={() => search("구역")}
            disabled={searchDisable}
          >
            <View style={[styles.category]}>
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory == "구역" ? "white" : "black" },
                ]}
              >
                구역
              </Text>
            </View>
          </TouchableView>
          <TouchableView
            style={[
              styles.categoryContainer,
              {
                backgroundColor:
                  selectedCategory == "소속" ? S.colors.primary : "white",
                borderColor:
                  selectedCategory == "소속"
                    ? S.colors.primary
                    : S.colors.secondary,
              },
            ]}
            onPress={() => search("소속")}
            disabled={searchDisable}
          >
            <View style={[styles.category]}>
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory == "소속" ? "white" : "black" },
                ]}
              >
                소속
              </Text>
            </View>
          </TouchableView>
          <TouchableView
            style={[
              styles.categoryContainer,
              {
                backgroundColor:
                  selectedCategory == "봉사" ? S.colors.primary : "white",
                borderColor:
                  selectedCategory == "봉사"
                    ? S.colors.primary
                    : S.colors.secondary,
              },
            ]}
            onPress={() => search("봉사")}
            disabled={searchDisable}
          >
            <View style={[styles.category]}>
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory == "봉사" ? "white" : "black" },
                ]}
              >
                봉사
              </Text>
            </View>
          </TouchableView>
        </View>
      </View>
      <View style={{ flex: 4 }}>
        {loading ? (
          <ActivityIndicator size="large" color={S.colors.primary} />
        ) : (
          <FlatList
            data={searchedData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `_key${index.toString()}`}
            onEndReachedThreshold={0.8}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator size="large" color={S.colors.primary} />
              ) : (
                <></>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },
  searchBar: {
    flex: 0.6,
    backgroundColor: S.colors.secondary,
    fontFamily: S.fonts.medium,
    borderRadius: 5,
    fontSize: 18,
    padding: 15,
  },
  text: {
    fontFamily: S.fonts.bold,
    fontSize: 20,
  },
  confirmText: {
    fontFamily: S.fonts.bold,
    textAlign: "center",
    fontSize: 18,
    color: "white",
  },
  categoryContainer: {
    flex: 1,
    alignItems: "center",
    margin: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  category: {
    flex: 1,
    justifyContent: "center",
  },
  categoryText: {
    fontFamily: S.fonts.medium,
    fontSize: 15,
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
});
