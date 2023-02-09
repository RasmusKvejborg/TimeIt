import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function SendHoursScreen({ navigation }) {
  const [data, setData] = React.useState([]);
  const [xAppSecretToken, setXAppSecretToken] = React.useState();

  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);
  // ---------------------------------------------------

  const fetchValues = () => {
    AsyncStorage.getItem("@registration").then((_data) => {
      const data = _data && JSON.parse(_data);
      if (data) {
        setData(data);
      }
    });
  };

  React.useEffect(() => {
    // fetchValues();
    return navigation.addListener("focus", () => {
      fetchValues();
    });
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
          return (
            <View style={styles.itemStyle} key={pos}>
              <Text style={styles.itemStyleLargeText}>
                {formattedDate}
                {"\n"}
                {item.startTime}
                {"\t"}- {"\t"}
                {item.endTime}
                {item.note && ( // && means if truthy then return text
                  <Text style={styles.itemStyleSmallText}>
                    {"\n"}Note: {item.note}
                  </Text>
                )}
              </Text>
              <View style={styles.trashCan}>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Really delete?",
                      "Tip: You can take a screenshot before deleting it. Just in case.",
                      [
                        {
                          text: "Cancel",
                          onPress: () => console.log("oaefoipj"),
                        },
                        {
                          text: "Delete",
                          onPress: () => console.log("deleted"),
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons
                    // style={{ textAlign: "center" }}
                    name="trash-outline"
                    size={32}
                    color="#112D4E"
                  ></Ionicons>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          if (xAppSecretToken === undefined) {
            Alert.alert(
              "Connect to e-conomic",
              "Before you can send data, you need to log into your (or your boss') e-conomc account.",
              // "Forbind appen tilco e-conomic",
              // "Log ind på din (eller din chefs) e-conomic konto",

              [
                {
                  text: "Cancel",
                  onPress: () => {
                    console.log("cancel has been pressed");
                  },
                },
                {
                  text: "Open e-conomic", // "Åbn e-conomic"
                  onPress: () => {
                    console.log("jafeoifjase");
                    Linking.openURL(
                      "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=SN1I9SSkjskcoRLZhGjjuMJxQ9thLkOCTbf3rDYrHfY1"
                    );
                  },
                },
              ]
            );
          } else {
            onToggleSnackBar();

            // all sent registrations should also be greyed out or something and into the bottom...
          }
        }}
      >
        <Text style={styles.buttonSendHours}>Send hours to e-conomic</Text>
      </TouchableOpacity>
      <Snackbar
        visible={snackBarVisible}
        duration={4000}
        onDismiss={onDismissSnackBar}
        action={{ label: "Close" }}
      >
        Registrations sent to e-conomic.
      </Snackbar>
    </View>
  );
}
