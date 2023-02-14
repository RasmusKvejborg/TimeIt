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
  const [oldData, setOldData] = React.useState([]);

  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleHoursSentSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);
  // ------------------------inputtokenmodal---------------------------
  const [showTokenInputModal, setShowTokenInputModal] = React.useState(false);
  const [tokenTekst, setTokenText] = React.useState();
  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  const [employeeNo, SetemployeeNo] = React.useState();

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
      "X-AppSecretToken": "vf0W9meQJEx3uK7mzjYEZhEbfTYWnSswmMzTIDeLWNI1",
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
      console.log("list deleted from asyncstorage");
      await AsyncStorage.removeItem("@registration");
    } catch (err) {
      console.log("error in deletion: ", err);
    }
  };

  // ------------------- get employee-----------------------------------------

  const showEmployeeSelection = () => {
    Alert.alert("Select employee");
    // SetemployeeNo(1);
    // let employees = getEmployees();
    getEmployees();
    // setResponse(
    //   '{"items": [{"access": true, "email": "rk@mail.com", "groupNumber": 1, "name": "Rasmus K", "number": 1, "objectVersion": "398764a0088058fb"}, {"access": true, "email": "hhhhhh@gmail.com", "groupNumber": 1, "name": "Hussain h", "number": 2, "objectVersion": "fe9b82b269eae3e9"}, {"access": true, "email": "Test@mail.com", "groupNumber": 1, "name": "Test Testing", "number": 3, "objectVersion": "c0ff347eaa7285ff"}, {"access": true, "email": "tttt@gmail.com", "groupNumber": 1, "name": "Test4 t", "number": 4, "objectVersion": "e57cf8252ce92cb8"}, {"access": true, "email": "tts@gmail.com", "groupNumber": 1, "name": "Testss testss", "number": 5, "objectVersion": "e4b5a0e04bc65079"}, {"access": true, "email": "tes@gmail.com", "groupNumber": 1, "name": "testc c", "number": 6, "objectVersion": "ed34d32c28f95112"}, {"access": true, "email": "G@gmail.com", "groupNumber": 1, "name": "testG testG", "number": 7, "objectVersion": "20bdd7f8fe4d519b"}, {"access": true, "email": "ths@gmail.com", "groupNumber": 1, "name": "TestH TestH", "number": 8, "objectVersion": "3c67a85b4068598e"}, {"access": true, "email": "TI@gmail.com", "groupNumber": 1, "name": "TestI ti", "number": 9, "objectVersion": "cc5f50679b811193"}, {"access": true, "email": "stJ@mail.com", "groupNumber": 1, "name": "TestJ TestJ", "number": 10, "objectVersion": "fc546673b5e5092e"}]}'
    // );

    // console.log(response);
    // let resp = JSON.parse(response);

    // resp.forEach((item) => {
    //   console.log(item.name);
    // });

    // postAllTimeEntries();
  };

  // ------------------post all time entries-------------------------------------------
  const postAllTimeEntries = () => {
    // if (data.length === 0) {
    //   Alert.alert(
    //     "There are no time registrations",
    //     "Create new registrations in 'Work' menu."
    //   );
    //   return;
    // }

    // data.forEach((val) => {
    //   postTimeEntry(val.note, val.date);
    // });

    if (data && data.length > 0) {
      const promises = [];
      data.forEach((val) => {
        promises.push(postTimeEntry(val.note));
      });
      Promise.all(promises)
        .then((result) => {
          //  if success:
          setOldData(data);
          setData();
          deleteList();
          onToggleHoursSentSnackBar();
        })
        .catch((e) => {
          console.log(e);
          const { status, data, config } = e.response;

          if (status === 401) {
            Alert.alert(
              "401 error",
              "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong."
            );
          } else {
            Alert.alert(
              "Something went wrong. Try again later or contact support"
            );
          }
        });
    } else {
      Alert.alert("No registrations");
    }
  };
  // -------------------------------- post timeentry ---------------------------------------------

  const postTimeEntry = async (note) => {
    const res = await axios.post(
      "https://apis.e-conomic.com/api/v16.2.2/timeentries",
      {
        activityNumber: 1,
        date: "2023-02-17T15:23:01Z", // date, //
        employeeNumber: 1,
        projectNumber: 1,
        numberOfHours: 7,
        text: note,
      },
      config
    );

    return res;
    // .then((result) => {
    //   setResponse(result);
    //   console.log(result.data);
    // })
    // .catch((e) => console.log(e));
  };

  //-------------------------------- end post timeentry end ---------------------------------------------

  const getSingleTimeEntry = () => {
    axios
      .get("https://apis.e-conomic.com/api/v16.3.0/timeentries/7", config)
      .then((result) => {
        console.log(result.data);
      });
  };

  // --------------------------Get requests ----------------------

  const getEmployees = () => {
    const res = axios
      .get("https://apis.e-conomic.com/api/v16.3.0/employees/all", config)
      .then((result) => {
        // console.log(result.data);

        console.log(result.data);
        const names = result.data.items.map((employee) => ({
          name: employee.name,
          number: employee.number,
        }));

        console.log(names);

        // setResponse(result.data);

        // console.log(result.data);

        // const employeeArray = result.data.map((element) => {
        //   console.log(element.name);
        // });
        // console.log(employeeArray);
        // return employeeArray;
      });
  };

  //  --------------------get project ------------------------------

  const getProjectGroups = () => {
    axios
      .get("https://apis.e-conomic.com/api/v16.3.0/projectgroups/all", config)
      .then((result) => {
        console.log(result.data);
        setResponse(result);
      });

    response !== undefined && console.log(response);
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

        {data &&
          data.map((item, pos) => {
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
            // postTimeEntry("halt");
            // console.log(data);

            // postTimeEntry("hello", "2023-02-14T15:23:01Z");
            // getContent();
            // console.log(data);

            console.log("employeeNo", employeeNo);
            employeeNo ? postAllTimeEntries() : showEmployeeSelection();

            // console.log(data);
            // getSingleTimeEntry();
            // postTimeEntry("hello");
            // onToggleHoursSentSnackBar(); // should be put inside, only shown if no errors.
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
                      "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=I7HMU9jmv6rxT42OViCFYrvD91SrOLkWVNoi3E3BTA01"
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
