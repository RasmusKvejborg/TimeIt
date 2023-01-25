import * as React from "react";
import { View, Text, ScrollView } from "react-native";
import { styles } from "../../GlobalStyles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SendHoursScreen({ navigation }) {
  const [data, setData] = React.useState([]);

  // const [registrations, setRegistrations] = React.useState([
  //   { startTime: "7777", endTime: "8888", key: "1" },
  //   { startTime: "8888", endTime: "9999", key: "2" },
  //   { startTime: "7777", endTime: "8888", key: "3" },
  //   { startTime: "8888", endTime: "9999", key: "4" },
  //   { startTime: "7777", endTime: "8888", key: "5" },
  //   { startTime: "8888", endTime: "9999", key: "6" },
  //   { startTime: "7777", endTime: "8888", key: "7" },
  // ]);

  const fetchValues = () => {
    AsyncStorage.getItem("@registration").then((_data) => {
      const data = _data && JSON.parse(_data);
      if (data) {
        setData(data);
      }
    });
  };

  React.useEffect(() => {
    fetchValues();
  }, []);

  const deleteList = async () => {
    try {
      console.log(
        "list deleted from asyncstorage (it is still in the setData list)"
      );
      await AsyncStorage.removeItem("@registration");
    } catch (err) {
      console.log("error in deletion: ", err);
    }
  };

  return (
    <View style={styles.sendHoursContainer}>
      <ScrollView>
        <Text
          onPress={() => {
            deleteList();
            console.log("data: " + JSON.stringify(data));

            // console.log(data);
            // navigation.navigate("Home")

            // JSON.parse(item.date)
          }}
        >
          This is the SendHoursScreen!
        </Text>

        {data.map((item, pos) => {
          var formattedDate = JSON.parse(item.date)
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/");

          // showNoteIfThereIsAny(){
          //   if(item.note!="undefined"){

          //   }
          // }

          return (
            <View key={pos}>
              <Text style={styles.itemStyle}>
                Start: {item.startTime} {"\t"}End: {item.endTime}
                {"\n"}Date: {formattedDate}
                {item.note !== "undefined" && ( // && means if true then return text
                  <Text style={styles.itemStyleSmall}>
                    {"\n"}Note: {item.note}
                  </Text>
                )}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View>
        <Text style={styles.buttonSendHours}>
          Send selected hours to e-conomic
        </Text>
      </View>
    </View>
  );
}
