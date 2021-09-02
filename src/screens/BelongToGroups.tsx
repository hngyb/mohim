import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import realm from "../models";
import { NavigationHeader, TouchableView } from "../components";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useStore } from "react-redux";
import { ActivityIndicator, Avatar, Card } from "react-native-paper";
import * as S from "./Styles";
import * as U from "../utils";
import * as A from "../store/asyncStorage";
import Modal from "react-native-modal";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import SetDistrict from "./SetDistrict";

export default function BelongToGroups() {
  interface belongToType {
    church?: Array<any>;
    district?: Array<any>;
    group?: Array<any>;
    service?: Array<any>;
    fellowship?: Array<any>;
  }
  const [loading, setLoading] = useState(false);
  const [isColorPalettesModalVisible, setColorPalettesModalVisible] =
    useState(false);
  const [isReviseModalVisible, setReviseModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number>();
  const [colorChanged, setColorChanged] = useState<boolean>(false);
  const [belongToChanged, setBelongToChanged] = useState<boolean>(false);
  const [colorPalettesIndex, setColorPalettesIndex] = useState([
    ...Array(Math.ceil(S.colorPalettes.length / 5)).keys(),
  ]);
  const [data, setData] = useState<belongToType>({});

  const [church, setChurch] = useState<string>("");
  const [churches, setChurches] = useState<Array<any>>([]);
  const [district, setDistrict] = useState<string>("");
  const [districts, setDistricts] = useState<Array<any>>([]);
  const [group, setGroup] = useState<string>("");
  const [groups, setGroups] = useState<Array<any>>([]);
  const [service, setService] = useState<Array<any>>();
  const [services, setServices] = useState<Array<any>>([]);
  const [fellowship, setFellowship] = useState<Array<any>>();
  const [fellowships, setFellowships] = useState<Array<any>>([]);
  const [currentGroup, setCurrentGroup] = useState<any>();
  const [parentWidth, setParentWidth] = useState(0);
  const [requestAgain, setRequestAgain] = useState<boolean>(false);
  const onLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  }, []);
  const store = useStore();
  const dispatch = useDispatch();
  const { email } = store.getState().login.loggedUser;
  const { accessJWT } = store.getState().asyncStorage;
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.navigate("MyPage"), []);
  const toggleColorPalettesModal = useCallback(
    (item) => {
      setSelectedColor(item.item.color);
      setSelectedGroupId(item.item.id);
      setColorPalettesModalVisible(!isColorPalettesModalVisible);
    },
    [isColorPalettesModalVisible]
  );
  const toggleReviseModal = useCallback(
    (category: string) => {
      setCurrentGroup(category);
      setReviseModalVisible(!isReviseModalVisible);
    },
    [isReviseModalVisible]
  );
  useEffect(() => {
    async function getBelongToChurch() {
      let churchName;
      realm
        .objects("Follows")
        .filtered(
          `deletedAt == null and userId == "${email}" and isBelongTo == true`
        )
        .forEach(async (group: any) => {
          const groupInfo: any = await realm
            .objects("Groups")
            .filtered(`category == "church" and id == ${group.groupId}`)
            .forEach((church: any) => {
              churchName = church.name;
            });
        });
      return churchName;
    }
    axios
      .get("/api/groups/church-list", {
        headers: { Authorization: `Bearer ${accessJWT}` },
      })
      .then((churchResponse) => {
        setChurches(churchResponse.data);
        getBelongToChurch().then((church) => {
          axios
            .get("/api/groups/district-list", {
              params: {
                church: church,
              },
              headers: { Authorization: `Bearer ${accessJWT}` },
            })
            .then((districtResponse) => {
              setDistricts(districtResponse.data);
              axios
                .get("/api/groups/group-list", {
                  params: {
                    church: church,
                  },
                  headers: { Authorization: `Bearer ${accessJWT}` },
                })
                .then((groupResponse) => {
                  setGroups(groupResponse.data);
                  axios
                    .get("/api/groups/service-list", {
                      params: {
                        church: church,
                      },
                      headers: { Authorization: `Bearer ${accessJWT}` },
                    })
                    .then((serviceResponse) => {
                      const itemArray: any = [];
                      serviceResponse.data.map((service: any) => {
                        const item: object = {
                          label: service.name,
                          value: service.name,
                        };
                        itemArray.push(item);
                      });
                      setServices(itemArray);
                    });
                });
            });
          setRequestAgain(false);
        });
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

  const reviseBelongTo = useCallback(() => {
    // groupId, Email => api post(follows) (바뀌기전 groupId, 바꿀 groupId)
    // realm 수정 (Follows)
    setReviseModalVisible(!isReviseModalVisible);
  }, []);

  const reviseModal = () => {
    return (
      <Modal
        style={{
          margin: 0,
          justifyContent: "flex-end",
        }}
        isVisible={isReviseModalVisible}
        onSwipeComplete={() => setReviseModalVisible(!isReviseModalVisible)}
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
              onPress={() => setReviseModalVisible(!isReviseModalVisible)}
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
              {currentGroup}
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ flex: 2 }} onLayout={onLayout}>
            {currentGroup == "교회" && (
              <Picker
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
                itemStyle={{
                  fontFamily: S.fonts.medium,
                }}
                selectedValue={church}
                onValueChange={(itemValue, itemIndex) => {
                  setChurch(itemValue);
                }}
              >
                {churches.map((church) => {
                  return (
                    <Picker.Item
                      key={church}
                      label={church.name}
                      value={church.name}
                    />
                  );
                })}
              </Picker>
            )}
            {currentGroup == "구역" && (
              <Picker
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
                itemStyle={{
                  fontFamily: S.fonts.medium,
                }}
                selectedValue={district}
                onValueChange={(itemValue, itemIndex) => {
                  setDistrict(itemValue);
                }}
              >
                {districts.map((district) => {
                  return (
                    <Picker.Item
                      key={district}
                      label={district.name}
                      value={district.name}
                    />
                  );
                })}
              </Picker>
            )}
            {currentGroup == "소속" && (
              <Picker
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
                itemStyle={{
                  fontFamily: S.fonts.medium,
                }}
                selectedValue={group}
                onValueChange={(itemValue, itemIndex) => {
                  setGroup(itemValue);
                }}
              >
                {groups.map((group) => {
                  return (
                    <Picker.Item
                      key={group}
                      label={group.name}
                      value={group.name}
                    />
                  );
                })}
              </Picker>
            )}
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableView
              onPress={reviseBelongTo}
              style={[
                S.buttonStyles.longButton,
                {
                  backgroundColor: S.colors.primary,
                  flex: 0.3,
                },
              ]}
            >
              <Text style={[styles.reviseText]}>수정</Text>
            </TouchableView>
          </View>
        </View>
      </Modal>
    );
  };

  const changeColor = (color: string, groupId: any) => {
    // api post
    U.readFromStorage("accessJWT")
      .then((accessToken) => {
        axios.post(
          "/api/follows/color",
          {
            groupId: groupId,
            color: color,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      })
      .catch((e) => {
        Alert.alert("색상을 수정할 수 없습니다.");
      });
    // realm 수정
    realm.write(() => {
      const followGroup = realm.create(
        "Follows",
        {
          groupId: groupId,
          userId: email,
          color: color,
        },
        Realm.UpdateMode.Modified
      );
    });
    setColorPalettesModalVisible(!isColorPalettesModalVisible);
    setColorChanged(true);
    setBelongToChanged(true);
  };

  const renderItem = useCallback((item) => {
    return (
      <View style={{ flex: 1 }}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableView
                onPress={() => {
                  toggleColorPalettesModal(item);
                }}
              >
                <Avatar.Text
                  label={item.item.name[0]}
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
          </Card.Content>
        </Card>
      </View>
    );
  }, []);

  const getBelongToGroups = useCallback(async () => {
    const belongToChurch: any = [];
    const belongToDistrict: any = [];
    const belongToGroup: any = [];
    const belongToService: any = [];
    const belongToFellowship: any = [];

    realm
      .objects("Follows")
      .filtered(
        `deletedAt == null and userId == "${email}" and isBelongTo == true`
      )
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "church" and id == ${group.groupId}`)
          .forEach((church: any) => {
            church.color = group.color;
            belongToChurch.push(church);
          });
      });
    realm
      .objects("Follows")
      .filtered(
        `deletedAt == null and userId == "${email}" and isBelongTo == true`
      )
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "district" and id == ${group.groupId}`)
          .forEach((district: any) => {
            district.color = group.color;
            belongToDistrict.push(district);
          });
      });
    realm
      .objects("Follows")
      .filtered(
        `deletedAt == null and userId == "${email}" and isBelongTo == true`
      )
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "group" and id == ${group.groupId}`)
          .forEach((_group: any) => {
            _group.color = group.color;
            belongToGroup.push(_group);
          });
      });
    realm
      .objects("Follows")
      .filtered(
        `deletedAt == null and userId == "${email}" and isBelongTo == true`
      )
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "service" and id == ${group.groupId}`)
          .forEach((service: any) => {
            service.color = group.color;
            belongToService.push(service);
          });
      });
    realm
      .objects("Follows")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "fellowship" and id == ${group.groupId}`)
          .forEach((fellowship: any) => {
            fellowship.color = group.color;
            belongToFellowship.push(fellowship);
          });
      });
    const belongTos = {
      church: belongToChurch,
      district: belongToDistrict,
      group: belongToGroup,
      service: belongToService,
      fellowship: belongToFellowship,
    };
    setChurch(belongToChurch[0].name);
    setDistrict(belongToDistrict[0].name);
    setGroup(belongToGroup[0].name);
    setService(belongToService);
    setFellowship(belongToFellowship);
    return belongTos;
  }, []);

  // const onEndReached = () => {
  //   if (loading) {
  //     return;
  //   } else {
  //     setLoading(true);
  //     getBelongToGroups()
  //       .then((belongTos) => {
  //         setData(belongTos);
  //       })
  //       .then(() => setLoading(false))
  //       .catch((e) => Alert.alert("데이터를 불러올 수 없습니다."));
  //   }
  // };

  useEffect(() => {
    setLoading(true);
    getBelongToGroups()
      .then((belongTos) => {
        setData(belongTos);
      })
      .then(() => {
        setLoading(false);
        setColorChanged(false);
        setBelongToChanged(false);
      })
      .catch((e) => Alert.alert("데이터를 불러올 수 없습니다."));
  }, [colorChanged, belongToChanged]);

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

  return (
    <SafeAreaView style={[styles.container]}>
      <NavigationHeader
        Left={() => (
          <TouchableView onPress={goBack}>
            <Icon name="chevron-back" size={30}></Icon>
          </TouchableView>
        )}
      ></NavigationHeader>
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
              교회
            </Text>
            <TouchableView
              onPress={() => {
                toggleReviseModal("교회");
              }}
            >
              <MaterialIcons
                name="edit"
                size={20}
                color={S.colors.secondary}
              ></MaterialIcons>
            </TouchableView>
          </View>
        }
        data={data.church}
        renderItem={renderItem}
        listKey={"church"}
        keyExtractor={(item, index) => `_key${index.toString()}`}
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          <>
            <FlatList
              style={{ paddingTop: 30 }}
              ListHeaderComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        paddingBottom: 10,
                      },
                    ]}
                  >
                    구역
                  </Text>
                  <TouchableView
                    onPress={() => {
                      toggleReviseModal("구역");
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={S.colors.secondary}
                    ></MaterialIcons>
                  </TouchableView>
                </View>
              }
              data={data.district}
              renderItem={renderItem}
              listKey={"district"}
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
            <FlatList
              style={{ paddingTop: 30 }}
              ListHeaderComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        paddingBottom: 10,
                      },
                    ]}
                  >
                    소속
                  </Text>
                  <TouchableView
                    onPress={() => {
                      toggleReviseModal("소속");
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={S.colors.secondary}
                    ></MaterialIcons>
                  </TouchableView>
                </View>
              }
              data={data.group}
              renderItem={renderItem}
              listKey={"group"}
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
            <FlatList
              style={{ paddingTop: 30 }}
              ListHeaderComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        paddingBottom: 10,
                      },
                    ]}
                  >
                    봉사
                  </Text>
                  <TouchableView
                    onPress={() => {
                      toggleReviseModal("봉사");
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={S.colors.secondary}
                    ></MaterialIcons>
                  </TouchableView>
                </View>
              }
              data={data.service}
              renderItem={renderItem}
              listKey={"service"}
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
            {/* <FlatList
              style={{ paddingTop: 30 }}
              ListHeaderComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        paddingBottom: 10,
                      },
                    ]}
                  >
                    교제
                  </Text>
                  <TouchableView onPress={() => {toggleReviseModal("교회")}}>
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={S.colors.secondary}
                    ></MaterialIcons>
                  </TouchableView>
                </View>
              }
              data={data.fellowship}
              renderItem={renderItem}
              onEndReached={onEndReached}
              listKey={"fellowship"}
              keyExtractor={(item, index) => `_key${index.toString()}`}
              onEndReachedThreshold={0.8}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator size="large" color={S.colors.primary} />
                ) : (
                  <></>
                )
              }
            /> */}
          </>
        }
      />
      {reviseModal()}
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
                changeColor(selectedColor, selectedGroupId);
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
