import React, { FC } from "react";
import { Text, View } from "react-native";
import { Avatar, Card, Paragraph, Title } from "react-native-paper";

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
  console.log(data);
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
            />
            <View
              style={{
                paddingHorizontal: 15,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  marginBottom: 1,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "grey",
                  marginBottom: 1,
                }}
              >
                {data.group}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: "500",
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
