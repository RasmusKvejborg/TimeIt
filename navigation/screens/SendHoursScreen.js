import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

export default function SendHoursScreen({ navigation }) {
  const [data, setData] = React.useState([]);

  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleHoursSentSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);
  // ------------------------inputtokenmodal---------------------------
  const [showTokenInputModal, setShowTokenInputModal] = React.useState(false);
  const [tokenTekst, setTokenText] = React.useState();
  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();

  const saveXAppSecretToken = async (tokenData) => {
    setXAgreementGrantToken(tokenData);
    await AsyncStorage.setItem("@xAppSecretToken", tokenData);
    console.log(await AsyncStorage.getItem("@xAppSecretToken"));
  };

  const deleteToken = async () => {
    try {
      console.log(
        "xAppSecretToken deleted from asyncstorage (it is still in the xAppSecretToken usestate)"
      );
      await AsyncStorage.removeItem("@xAppSecretToken");
      setXAgreementGrantToken();
    } catch (err) {
      console.log("error in deletion: ", err);
    }
  };
  // ------------------API stuff----------------------------------
  let [response, setResponse] = React.useState();

  const config = {
    headers: {
      "X-AppSecretToken": "tpMyOBYl3Cq6KJ5Z2etH9PDfSE4G9ks0EsWYlYbbpI01",
      "X-AgreementGrantToken": xAgreementGrantToken,
      "Content-Type": "application/json",
    },
  };

  //--------------------------------------------------------

  const deleteValue = async (item) => {
    try {
      let newList = data;
      newList = newList.filter((i) => i !== item);
      setData(newList);
      await AsyncStorage.setItem("@registration", JSON.stringify(newList)); // saves a new list where the deleted item has been filtered out
    } catch (err) {
      console.log("eRrOr MsG: deleteValue function: ", err);
    }
  };

  const fetchValues = () => {
    AsyncStorage.getItem("@registration").then((_data) => {
      const data = _data && JSON.parse(_data);
      if (data) {
        setData(data);
      }
    });
  };

  React.useEffect(() => {
    const setXAppSecretTokenImmediately = async () => {
      setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };
    setXAppSecretTokenImmediately();
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

  // -------------------------------- post timeentry ---------------------------------------------
  const postTimeEntry = (note) => {
    axios
      .post(
        "https://apis.e-conomic.com/api/v16.2.2/timeentries",
        {
          activityNumber: 1,
          date: "2023-12-02T15:23:01Z",
          employeeNumber: 1,
          projectNumber: 1,
          numberOfHours: 7,
          text: "Det er sgu da fedt", // KAN SGU NOK OS LÆRE AT LAVE DET HER TIL AT VÆRE NOTEN...
        },
        config
      )
      .then((result) => {
        setResponse(result);
      })
      .catch((e) => console.log(e));
  };
  //-------------------------------- end post timeentry end ---------------------------------------------

  // --------------------------test
  const getContent = () => {
    fetch("https://apis.e-conomic.com/api/v16.2.2/projectgroups", {
      config,
    })
      .then((res) => res.json())
      .then((result) => {
        setResponse(result);
      });
    console.log(response);

    response !== undefined &&
      // response.collection.map((value) => console.log(value.name));
      console.log(response);
  };

  ////////////////////////////////////////////// return ///////////////////////////////////////////////////////////////
  return (
    <View style={styles.sendHoursContainer}>
      <ScrollView>
        <Text
          onPress={() => {
            // deleteList();
            deleteToken();
            // this is just for testing that I have a deleteList function
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
                      "Tip: You can take a screenshot before deleting it, just in case.",
                      [
                        {
                          text: "Cancel",
                          onPress: () => console.log("cancel pressed"),
                        },
                        {
                          text: "Delete",
                          onPress: () => deleteValue(item),
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
          if (xAgreementGrantToken) {
            // postTimeEntry("hej");
            // postTimeEntry();
            getContent();
            onToggleHoursSentSnackBar(); // should be put inside, only shown if no errors.
            // TODO all sent registrations should also be greyed out or something and into the bottom...
          } else {
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
                  text: "Open e-conomic",
                  onPress: () => {
                    Linking.openURL(
                      "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=SN1I9SSkjskcoRLZhGjjuMJxQ9thLkOCTbf3rDYrHfY1"
                    );
                    setShowTokenInputModal(true);
                  },
                },
              ]
            );
          }
        }}
      >
        {xAgreementGrantToken ? (
          <Text style={styles.buttonSendHours}>Send hours to e-conomic</Text>
        ) : (
          <Text style={styles.buttonSendHours}>Connect to e-conomic</Text>
        )}
      </TouchableOpacity>

      {/* -------------------below is invisible thinks like modals and popups -------------------*/}
      <Modal
        style={styles.modal}
        transparent={true}
        visible={showTokenInputModal}
      >
        <View
          style={[
            styles.modal,
            {
              top: 40,
              alignItems: "center",
              height: 400,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="paste ID from e-conomic"
            onChangeText={(text) => setTokenText(text)}
          />
          <TouchableOpacity
            onPress={() => {
              saveXAppSecretToken(tokenTekst);
              setShowTokenInputModal(false);
            }}
          >
            <Text style={styles.button}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
