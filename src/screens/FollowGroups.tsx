import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import realm from "../models";
import { NavigationHeader, TouchableView } from "../components";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { Avatar, Card } from "react-native-paper";
import Modal from "react-native-modal";
import * as S from "./Styles";

export default function FollowGroups() {
  const [loading, setLoading] = useState(false);
  const [isColorPalettesModalVisible, setColorPalettesModalVisible] =
    useState(false);
  const [data, setData] = useState([]);
  const store = useStore();
  const { email } = store.getState().login.loggedUser;
  const navigation = useNavigation();

  const toggleColorPalettesModal = useCallback(() => {
    setColorPalettesModalVisible(!isColorPalettesModalVisible);
  }, [isColorPalettesModalVisible]);

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
              <TouchableView onPress={toggleColorPalettesModal}>
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

  const getFollowGroups = useCallback(async () => {
    const followGroups: any = [];
    realm
      .objects("Follows")
      .filtered(`deletedAt == null and userId == "${email}"`)
      .forEach(async (group: any) => {
        await realm
          .objects("Groups")
          .filtered(`id == ${group.groupId}`)
          .forEach((follow: any) => {
            followGroups.push(follow);
          });
      });
    return followGroups;
  }, []);

  const onEndReached = () => {
    if (loading) {
      return;
    } else {
      setLoading(true);
      getFollowGroups()
        .then((followGroups) => {
          setData(followGroups);
        })
        .then(() => setLoading(false))
        .catch((e) => Alert.alert("데이터를 불러올 수 없습니다."));
    }
  };

  useEffect(() => {
    setLoading(true);
    getFollowGroups()
      .then((followGroups) => {
        setData(followGroups);
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
      <View>
        <Modal isVisible={isColorPalettesModalVisible}>
          <View style={{ flex: 1 }}>
            <Text>I am the modal content!</Text>
            <TouchableView onPress={toggleColorPalettesModal}>
              <Text>onpress</Text>
            </TouchableView>
          </View>
        </Modal>
      </View>
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
        data={data}
        renderItem={renderItem}
        onEndReached={onEndReached}
        keyExtractor={(item, index) => `_key${index.toString()}`}
        onEndReachedThreshold={0.8}
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
