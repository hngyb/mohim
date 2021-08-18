import React, { FC } from "react";
import { Text, View } from "react-native";
import { Avatar, Card } from "react-native-paper";
import * as S from "../screens/Styles";

import { TouchableView } from "./TouchableView";

type AgendaProps = {
  title: string;
  data: {
    group: string;
    attendees?: string;
    location?: string;
    start?: string;
    end?: string;
    summary: string;
    color: string;
  };
};

export const Agenda: FC<AgendaProps> = ({ title, data }) => {
  return (
    <TouchableView>
      <Card>
        <Card.Content>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Avatar.Text
              label={data.group[0]}
              size={50}
              style={{ backgroundColor: data.color }}
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
                {title}
              </Text>
              <Text
                style={{
                  fontFamily: S.fonts.medium,
                  fontSize: 12,
                  color: "grey",
                  marginBottom: 1,
                }}
              >
                {data.group}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: S.fonts.medium,
                  fontSize: 12,
                  color: "grey",
                }}
              >
                {data.start ? data.start + " - " : null}
                {data.end}
                {data.start && data.location ? ", " + data.location : null}
                {!data.start && !data.end && data.location
                  ? data.location
                  : null}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableView>
  );
};
