import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import realm from "../models";
import { NavigationHeader, TouchableView } from "../components";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "react-redux";
import { ActivityIndicator, Avatar, Card } from "react-native-paper";
import * as S from "./Styles";
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment";

export default function BelongToGroups() {
  interface belongToType {
    church?: Array<any>;
    district?: Array<any>;
    group?: Array<any>;
    service?: Array<any>;
    fellowship?: Array<any>;
  }
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<belongToType>({});
  const store = useStore();
  const { email } = store.getState().login.loggedUser;
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.navigate("MyPage"), []);
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
              <Avatar.Text
                label={item.item.name[0]}
                size={50}
                style={{ backgroundColor: item.item.color }}
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
                    ? "소속 그룹"
                    : item.item.category === "service"
                    ? "봉사 그룹"
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
      .objects("BelongTos")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "church" and id == ${group.groupId}`)
          .forEach((church: any) => {
            belongToChurch.push(church);
          });
      });
    realm
      .objects("BelongTos")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "district" and id == ${group.groupId}`)
          .forEach((district: any) => {
            belongToDistrict.push(district);
          });
      });
    realm
      .objects("BelongTos")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "group" and id == ${group.groupId}`)
          .forEach((group: any) => {
            belongToGroup.push(group);
          });
      });
    realm
      .objects("BelongTos")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "service" and id == ${group.groupId}`)
          .forEach((service: any) => {
            belongToService.push(service);
          });
      });
    realm
      .objects("BelongTos")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        const groupInfo: any = await realm
          .objects("Groups")
          .filtered(`category == "fellowship" and id == ${group.groupId}`)
          .forEach((fellowship: any) => {
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
    return belongTos;
  }, []);

  const onEndReached = () => {
    if (loading) {
      return;
    } else {
      setLoading(true);
      getBelongToGroups()
        .then((belongTos) => {
          setData(belongTos);
        })
        .then(() => setLoading(false))
        .catch((e) => Alert.alert("데이터를 불러올 수 없습니다."));
    }
  };

  useEffect(() => {
    setLoading(true);
    getBelongToGroups()
      .then((belongTos) => {
        setData(belongTos);
      })
      .then(() => {
        setLoading(false);
      })
      .catch((e) => Alert.alert("데이터를 불러올 수 없습니다."));
  }, []);

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
            <TouchableView>
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
        onEndReached={onEndReached}
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
                  <TouchableView>
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
              onEndReached={onEndReached}
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
                  <TouchableView>
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
              onEndReached={onEndReached}
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
                  <TouchableView>
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
              onEndReached={onEndReached}
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
                  <TouchableView>
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
});