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
// this needs to be changed:
import { ModalEmployeePicker } from "../../ModalEmployeePicker.js";

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
  // ------------------------ employeee picker modal -----------------
  const [emplArray, setEmplArray] = React.useState([]);
  const [employeeNo, SetemployeeNo] = React.useState();
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const saveEmployee = async (number) => {
    if (number) {
      SetemployeeNo(number);
      await AsyncStorage.setItem("@Employee", JSON.stringify(number));
      // console.log(await AsyncStorage.getItem("@Employee"), "hej");
    }
  };

  const deleteEmployee = async () => {
    try {
      await AsyncStorage.removeItem("@Employee");
      SetemployeeNo();
      console.log("Employee deleted from asyncstorage AND employeeNo");
    } catch (err) {
      console.log("error in deletion of employee: ", err);
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
    // -- getting token from storage:
    const setXAppSecretTokenImmediately = async () => {
      setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };
    setXAppSecretTokenImmediately();
    // -- getting employee from storage:
    const setSavedEmployeeImmediately = async () => {
      SetemployeeNo(await AsyncStorage.getItem("@Employee"));
    };
    setSavedEmployeeImmediately();
    // --
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
    getEmployees()
      .then((empl) => {
        setEmplArray(empl);
        setIsModalVisible(true);
      })
      .catch((e) => {
        console.log(e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert(
            "401 error",
            "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
          );
        } else {
          Alert.alert(
            "Something went wrong. Try again later or contact support"
          );
        }
      });
  };

  // ------------------post all time entries-------------------------------------------
  const postAllTimeEntries = () => {
    // data.forEach((val) => {
    //   postTimeEntry(val.note, val.date);
    // });
    // below is a complex version of the above

    if (data && data.length > 0) {
      const promises = [];
      data.forEach((val) => {
        promises.push(
          postTimeEntry(
            val.date,
            val.startTime,
            val.endTime,
            val.totalHours,
            val.note
          )
        ); // calls the postTimeEntry() for each entry
      });
      Promise.all(promises)
        .then((result) => {
          //  if success, then save oldData, but delete all registrations:
          setOldData(data);
          setData();
          deleteList();
          onToggleHoursSentSnackBar();
          console.log("hours have been sent to employee number ", employeeNo);
        })
        .catch((e) => {
          console.log(e);
          const { status, data, config } = e.response;

          if (status === 401) {
            Alert.alert(
              "401 error",
              "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
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

  const postTimeEntry = async (date, startTime, endTime, totalHours, note) => {
    const res = await axios.post(
      "https://apis.e-conomic.com/api/v16.2.2/timeentries",
      {
        activityNumber: 1,
        date: JSON.parse(date), // this has to be parsed because it is stringified twice by mistake in HomeScreen. format: "2023-02-18T15:23:01Z"
        employeeNumber: employeeNo,
        projectNumber: 1,
        numberOfHours: totalHours,
        text: startTime + "-" + endTime + (note && " note: " + note),
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
    return axios
      .get("https://apis.e-conomic.com/api/v16.3.0/employees/all", config)
      .then((result) => {
        const namesAndNumbers = result.data.items.map((employee) => ({
          name: employee.name,
          number: employee.number,
        }));

        return namesAndNumbers;
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
            // deleteToken();
            deleteEmployee();
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
                  {"\t"}hours:{"\t"}
                  {item.totalHours && item.totalHours}
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
            console.log("employee number: ", employeeNo);

            employeeNo ? postAllTimeEntries() : showEmployeeSelection();

            // console.log(data);
            // getSingleTimeEntry();
            // postTimeEntry("hello");
            // onToggleHoursSentSnackBar(); // should be put inside, only shown if no errors.
            // TODO all sent registrations should also be greyed out or something and into the bottom...
          } else {
            Alert.alert(
              "Connect to e-conomic",
              "You need to log into your company's e-conomc account.",
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

      {/* -------------------below is invisible things like modals and popups -------------------*/}
      {/* employee picker modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        nRequestClose={() => setIsModalVisible(false)}
      >
        <ModalEmployeePicker
          employees={emplArray}
          isVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setEmployeeData={(number) => {
            saveEmployee(number);
          }}
        ></ModalEmployeePicker>
      </Modal>

      {/* token input modal */}
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

      {/* positive feedback when sent hours */}
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
