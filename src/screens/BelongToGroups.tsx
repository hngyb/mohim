import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, FlatList, View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import DropDownPicker from "react-native-dropdown-picker";
import { isEqual } from "lodash";
import { getCookie } from "../utils";

export default function BelongToGroups() {
  interface belongToType {
    church?: Array<any>;
    district?: Array<any>;
    department?: Array<any>;
    service?: Array<any>;
    fellowship?: Array<any>;
  }
  const [loading, setLoading] = useState(true);
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
  const [church, setChurch] = useState<string>("");
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [districtList, setDistrictList] = useState<Array<any>>([]);
  const [department, setDepartment] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentList, setDepartmentList] = useState<Array<any>>([]);
  const [service, setService] = useState<Array<any>>([]);
  const [selectedSerivice, setSelectedService] = useState<Array<any>>([]);
  const [open, setOpen] = useState(false);
  const [serviceList, setServiceList] = useState<Array<any>>([]);
  const [currentGroup, setCurrentGroup] = useState<any>();
  const [parentWidth, setParentWidth] = useState(0);
  const [belongToGroupsArray, setBelongToGroupsArray] = useState<Array<any>>(
    []
  );
  const prevBelongToGroupsArray = useRef(belongToGroupsArray);
  const [belongToGroupsObject, setBelongToGroupsObject] =
    useState<belongToType>({});

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
    // 그룹 리스트 가져오기
    getGroupList().catch(async (e) => {
      const errorStatus = e.response.status;
      if (errorStatus === 401) {
        // accessToken 만료 -> accessToken 업데이트
        await updateToken();
      } else {
        Alert.alert("비정상적인 접근입니다");
      }
    });
  }, [accessToken]);

  useEffect(() => {
    // belongToGroupsArray 가져오기
    setLoading(true);
    axios
      .get("/api/follows/belong-to", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((belongToGroups) => {
        setBelongToGroupsArray(belongToGroups.data);
      })
      .catch(async (e) => {
        const errorStatus = e.response.status;
        if (errorStatus === 401) {
          // accessToken 만료 -> accessToken 업데이트
          await updateToken();
        } else {
          Alert.alert("비정상적인 접근입니다");
        }
      });
  }, [accessToken, belongToChanged]);

  useEffect(() => {
    // belongToGroupsArray를 belongToGroupsObject로 변환
    if (
      belongToGroupsArray &&
      !isEqual(belongToGroupsArray, prevBelongToGroupsArray.current)
    ) {
      prevBelongToGroupsArray.current = belongToGroupsArray;
      belongToGroupsArrayToObject().then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  });

  useEffect(() => {
    // 색상 수정
    if (colorChanged) {
      changeColor()
        .then(() => {
          setColorChanged(false);
          prevBelongToGroupsArray.current = [];
          setBelongToChanged(!belongToChanged);
        })
        .catch(async (e) => {
          const errorStatus = e.response.status;
          if (errorStatus === 401) {
            // accessToken 만료 -> accessToken 업데이트
            await updateToken();
          } else {
            Alert.alert("비정상적인 접근입니다");
          }
        });
    }
  }, [accessToken, colorChanged]);

  const getGroupList = async () => {
    const belongToChurch = await axios.get("/api/follows/belong-to-church", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const churchName = belongToChurch.data.FollowGroup.name;

    await axios
      .get("/api/groups/district-list", {
        params: {
          church: churchName,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((districtList) => {
        setDistrictList(districtList.data);
      });
    await axios
      .get("/api/groups/department-list", {
        params: {
          church: churchName,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((departmentList) => {
        setDepartmentList(departmentList.data);
      });
    await axios
      .get("/api/groups/service-list", {
        params: {
          church: churchName,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((serviceList) => {
        const itemArray: any = [];
        serviceList.data.map((service: any) => {
          const item: object = {
            label: service.name,
            value: service.name,
          };
          itemArray.push(item);
        });
        setServiceList(itemArray);
      });
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

  const belongToGroupsArrayToObject = async () => {
    const belongToChurch: any = [];
    const belongToDistrict: any = [];
    const belongToDepartment: any = [];
    const belongToService: any = [];
    const belongToFellowship: any = [];

    await Promise.all(
      belongToGroupsArray.map((group) => {
        if (group.FollowGroup.category === "church") {
          belongToChurch.push(group);
        } else if (group.FollowGroup.category === "district") {
          belongToDistrict.push(group);
        } else if (group.FollowGroup.category === "department") {
          belongToDepartment.push(group);
        } else if (group.FollowGroup.category === "service") {
          belongToService.push(group);
        } else {
          belongToFellowship.push(group);
        }
      })
    );
    const belongToGroups = {
      church: belongToChurch,
      district: belongToDistrict,
      department: belongToDepartment,
      service: belongToService,
      fellowship: belongToFellowship,
    };
    setBelongToGroupsObject(belongToGroups);

    setChurch(belongToChurch[0].FollowGroup.name);
    setSelectedChurch(belongToChurch[0].FollowGroup.name);
    setDistrict(belongToDistrict[0].FollowGroup.name);
    setSelectedDistrict(belongToDistrict[0].FollowGroup.name);
    setDepartment(belongToDepartment[0].FollowGroup.name);
    setSelectedDepartment(belongToDepartment[0].FollowGroup.name);
    const serviceArray: any = [];
    await Promise.all(
      belongToService.map((service: any) => {
        const item = service.FollowGroup.name;
        serviceArray.push(item);
      })
    );
    setService(serviceArray);
    setSelectedService(serviceArray);
  };

  const toggleColorPalettesModal = (item: any) => {
    setSelectedColor(item.item.color);
    setSelectedGroupId(item.item.GroupId);
    setColorPalettesModalVisible(!isColorPalettesModalVisible);
  };

  const toggleReviseModal = (category: string) => {
    setCurrentGroup(category);
    setReviseModalVisible(!isReviseModalVisible);
  };

  const closeReviseModal = () => {
    setSelectedChurch(church);
    setSelectedDistrict(district);
    setSelectedDepartment(department);
    setSelectedService(service);
    setReviseModalVisible(!isReviseModalVisible);
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

  const reviseBelongTo = async () => {
    if (currentGroup == "봉사") {
      //이전  그룹  삭제
      await Promise.all(
        service.map(async (service) => {
          const response = await axios.get("/api/groups", {
            params: {
              name: service,
              church: church,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const groupId = response.data.id;
          axios.post(
            "/api/follows/delete",
            {
              groupId: groupId,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        })
      );
      // 새로운 그룹 추가
      await Promise.all(
        selectedSerivice.map(async (service) => {
          const response = await axios.get("/api/groups", {
            params: {
              name: service,
              church: church,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const groupId = response.data.id;
          axios.post(
            "/api/follows/belong-to",
            {
              groupId: groupId,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        })
      );
      setBelongToChanged(!belongToChanged);
    } else {
      const groupToBeDeleted =
        currentGroup == "교회"
          ? church
          : currentGroup == "구역"
          ? district
          : department;
      const newGroup =
        currentGroup == "교회"
          ? selectedChurch
          : currentGroup == "구역"
          ? selectedDistrict
          : selectedDepartment;

      // 이전 그룹 삭제
      const groupInfoToBeDeleted = await axios.get("/api/groups", {
        params: {
          name: groupToBeDeleted,
          church: church,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const groupIdToBeDeleted = groupInfoToBeDeleted.data.id;
      await axios.post(
        "/api/follows/delete",
        {
          groupId: groupIdToBeDeleted,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // 새로운 그룹 추가
      const groupInfoToBeAdded = await axios.get("/api/groups", {
        params: {
          name: newGroup,
          church: church,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const groupIdToBeAdded = groupInfoToBeAdded.data.id;
      await axios.post(
        "/api/follows/belong-to",
        {
          groupId: groupIdToBeAdded,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setBelongToChanged(!belongToChanged);
    }
    setReviseModalVisible(!isReviseModalVisible);
  };

  const reviseModal = () => {
    return (
      <Modal
        style={{
          margin: 0,
          justifyContent: "flex-end",
        }}
        isVisible={isReviseModalVisible}
        onSwipeComplete={closeReviseModal}
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
              onPress={closeReviseModal}
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
            {currentGroup == "구역" && (
              <Picker
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
                itemStyle={{
                  fontFamily: S.fonts.medium,
                }}
                selectedValue={selectedDistrict}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDistrict(itemValue);
                }}
              >
                {districtList.map((district) => {
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
            {currentGroup == "부서" && (
              <Picker
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
                itemStyle={{
                  fontFamily: S.fonts.medium,
                }}
                selectedValue={selectedDepartment}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDepartment(itemValue);
                }}
              >
                {departmentList.map((department) => {
                  return (
                    <Picker.Item
                      key={department}
                      label={department.name}
                      value={department.name}
                    />
                  );
                })}
              </Picker>
            )}
            {currentGroup == "봉사" && (
              <DropDownPicker
                textStyle={{ fontFamily: S.fonts.medium }}
                labelStyle={{
                  fontFamily: S.fonts.medium,
                }}
                badgeTextStyle={{
                  fontFamily: S.fonts.medium,
                  color: "white",
                }}
                badgeColors={S.colors.primary}
                maxHeight={140}
                listMode="FLATLIST"
                mode="BADGE"
                showBadgeDot={false}
                multiple={true}
                min={0}
                max={5}
                open={open}
                value={selectedSerivice}
                items={serviceList}
                setOpen={setOpen}
                setValue={setSelectedService}
                setItems={setServiceList}
                placeholder="모두 선택해주세요"
              />
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

  const renderItem = (item: any) => {
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
                    : item.item.FollowGroup.category === "department"
                    ? "부서"
                    : item.item.FollowGroup.category === "service"
                    ? "봉사"
                    : item.item.FollowGroup.category === "fellowship"
                    ? "교제"
                    : ""}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
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
                교회
              </Text>
            </View>
          }
          data={belongToGroupsObject.church}
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
                data={belongToGroupsObject.district}
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
                      부서
                    </Text>
                    <TouchableView
                      onPress={() => {
                        toggleReviseModal("부서");
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
                data={belongToGroupsObject.department}
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
                data={belongToGroupsObject.service}
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
            </>
          }
        />
      )}
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
                setColorChanged(true);
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
