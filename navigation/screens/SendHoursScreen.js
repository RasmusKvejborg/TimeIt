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
  AppState,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios, { all } from "axios";
import { ModalEmployeePicker } from "../../ModalEmployeePicker.js";
import { ModalActivityPicker } from "../../ModalActivityPicker.js";
import { ModalProjectPicker } from "../../ModalProjectPicker.js";

export default function SendHoursScreen({ navigation }) {
  const [registrationsData, setRegistrationsData] = React.useState([]);
  const [oldData, setOldData] = React.useState([]);
  const [appState, setAppState] = React.useState(null);

  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleHoursSentSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);
  // ------------------------inputtokenmodal---------------------------
  const [showTokenInputModal, setShowTokenInputModal] = React.useState(false);
  const [tokenTekst, setTokenText] = React.useState();

  // ------------------------ employeee picker modal -----------------
  const [emplArray, setEmplArray] = React.useState([]);
  const [employeeNo, SetemployeeNo] = React.useState();
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] =
    React.useState(false);

  const saveEmployee = async (number) => {
    if (number) {
      SetemployeeNo(number);
      await AsyncStorage.setItem("@Employee", JSON.stringify(number));
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

  // ------------------------ activity picker modal -----------------
  const [activityArray, setActivityArray] = React.useState([]);
  const [isActModalVisible, setIsActivityModalVisible] = React.useState(false);
  const [itemKeyForAddingLater, setItemKeyForAddingLater] = React.useState();

  // ------------------------ project picker modal -----------------
  const [projectArray, setProjectArray] = React.useState([]);
  const [isProjectModalVisible, setIsProjectModalVisible] =
    React.useState(false);

  // ------------------API stuff----------------------------------
  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  const [
    saveXAgreementGrantTokenHasBeenCalled,
    setSaveXAgreementGrantTokenHasBeenCalled,
  ] = React.useState(false);

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
      let newList = registrationsData;
      newList = newList.filter((i) => i !== item);
      setRegistrationsData(newList);
      await AsyncStorage.setItem("@registration", JSON.stringify(newList)); // saves a new list where the deleted item has been filtered out
    } catch (err) {
      console.log("eRrOr MsG: deleteValue function: ", err);
    }
  };

  const fetchValues = () => {
    AsyncStorage.getItem("@registration").then((_data) => {
      const data = _data && JSON.parse(_data);
      if (data) {
        setRegistrationsData(data);
      }
    });
  };

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
        setIsEmployeeModalVisible(true);
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

    if (registrationsData && registrationsData.length > 0) {
      const promises = [];

      const activityNumberMissing = registrationsData.some(
        (val) => !val.activity || !val.project
      );

      if (activityNumberMissing) {
        Alert.alert(
          "Activity or Project missing",
          "Add Activity and Project to all your registrations. \n\nYou may have to scroll down to see it."
        );
      } else {
        registrationsData.forEach((val) => {
          promises.push(
            postTimeEntry(
              val.date,
              val.startTime,
              val.endTime,
              val.totalHours,
              val.activityNumber,
              val.projectNumber,
              val.note
            )
          ); // calls the postTimeEntry() for each entry
        });
        Promise.all(promises)
          .then((result) => {
            //  if success, then save oldData, but delete all registrations:
            setOldData(registrationsData);
            setRegistrationsData();
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
      }
    } else {
      Alert.alert("No registrations");
    }
  };
  // -------------------------------- post timeentry ---------------------------------------------

  const postTimeEntry = async (
    date,
    startTime,
    endTime,
    totalHours,
    activity,
    project,
    note
  ) => {
    const res = await axios.post(
      "https://apis.e-conomic.com/api/v16.2.2/timeentries",
      {
        activityNumber: 1, // NB: There has to be a check when I change this!! Because I can create registrations without that
        date: JSON.parse(date), // this has to be parsed because it is stringified twice by mistake in HomeScreen. format: "2023-02-18T15:23:01Z"
        employeeNumber: employeeNo,
        projectNumber: 1, // NB: There has to be a check when I change this!! Because I can create registrations without that
        numberOfHours: totalHours,
        text: note
          ? startTime + "-" + endTime + " note: " + note
          : startTime + "-" + endTime,
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

  //  --------------end of API stuff------------------------------
  // ---------------XagreementGrantToken---------------------
  const saveXAgreementGrantToken = async (tokenData) => {
    console.log("saveXAgreementGrantToken called");
    setSaveXAgreementGrantTokenHasBeenCalled(true);
    setXAgreementGrantToken(tokenData);
    await AsyncStorage.setItem("@xAppSecretToken", tokenData);
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

  // ########################## activity and project addlater functions ########################
  // ------------------- get activities and show modal -----------------------------------------
  const openModalActivityPicker = async (key) => {
    setItemKeyForAddingLater(key);

    await getActivities()
      .then((act) => {
        setActivityArray(act);
        setIsActivityModalVisible(true);
      })
      .catch((e) => {
        console.log(e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert(
            "401 error",
            "See if there is an update in the app store and try restarting the app"
            // "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
          );
        } else {
          Alert.alert(
            "Something went wrong. Try again later or contact support"
          );
        }
      });
  };

  // ------------------- get projects and show modal -----------------------------------------

  const openModalProjectPicker = async (key) => {
    setItemKeyForAddingLater(key);

    await getProjects()
      .then((projects) => {
        setProjectArray(projects);
        setIsProjectModalVisible(true);
      })
      .catch((e) => {
        console.log(e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert(
            "401 error"
            // ,
            // "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
          );
        } else {
          Alert.alert(
            "Something went wrong. Try again later or contact support"
          );
        }
      });
  };

  // --------------------------Get activities ----------------------

  const getActivities = () => {
    return axios
      .get("https://apis.e-conomic.com/api/v16.3.0/activities/all", config)
      .then((result) => {
        const namesAndNumbers = result.data.items.map((activity) => ({
          name: activity.name,
          number: activity.number,
        }));

        return namesAndNumbers;
      });
  };

  //  --------------------get projects ------------------------------

  const getProjects = () => {
    return axios
      .get("https://apis.e-conomic.com/api/v16.3.0/projects/all", config)
      .then((result) => {
        const projectNamesAndNumbers = result.data.items.map((project) => ({
          name: project.name,
          number: project.number,
        }));

        return projectNamesAndNumbers;
      });
  };

  const saveActivityToRegistration = async (
    key,
    activityName,
    activityNumber
  ) => {
    let newDataToBeSet = registrationsData[key];
    newDataToBeSet["activity"] = activityNumber;
    newDataToBeSet["activityName"] = activityName;

    let alldata = registrationsData;
    alldata[key] = newDataToBeSet;

    setRegistrationsData(alldata);

    if (alldata) {
      await AsyncStorage.setItem("@registration", JSON.stringify(alldata));
    }
  };

  const saveProjectToRegistration = async (key, projectName, projectNumber) => {
    let newDataToBeSet = registrationsData[key];
    newDataToBeSet["project"] = projectNumber;
    newDataToBeSet["projectName"] = projectName;

    let alldata = registrationsData;
    alldata[key] = newDataToBeSet;

    setRegistrationsData(alldata);

    if (alldata) {
      await AsyncStorage.setItem("@registration", JSON.stringify(alldata));
    }
  };

  // ########################################### end of activity and project addlater functions #########################################
  // --------------------------- USE EFFECT -------------------------------

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

  //  FOR FETCHING THE TOKEN FROM ECONOMIC

  // This is to make sure we catch the token when redirected from economic.
  // No matter if the app is open in background or closed, we should get the token when redirected back to app.
  const onAppStateChange = async (nextAppState) => {
    if (!xAgreementGrantToken) {
      console.log(
        `onAppStateChange: appState from ${appState} to ${nextAppState}`
      );
      // cold start
      if (appState === null) {
        // console.log("do whatever you need on cold start");
        Linking.getInitialURL().then((url) => {
          if (url) {
            const token = url.split("=")[1];
            console.log("TOKEN ON COLD START ", token);

            saveXAgreementGrantToken(token);
          }
        });
      }
      // come to foreground from background
      else if (
        appState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // console.log("do whatever you need on resume");
        Linking.getInitialURL().then((url) => {
          console.log("u r l : ", url);
          if (url) {
            const token = url.split("=")[1];
            console.log("GO TO DRIVE!!==!==!");
            saveXAgreementGrantToken(token);
            // navigate to last tab
          }
        });
      }
      setAppState(nextAppState);
    }
  };

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    if (appState === null) {
      // The event is not triggered on cold start since the change has already taken place
      // therefore we need to call it manually:
      onAppStateChange(AppState.currentState);
    }
    return () => {
      subscription.remove(); //removeEventListener is depricated, this is the same as that.
    };
  }, [appState]);

  React.useEffect(() => {
    if (xAgreementGrantToken && saveXAgreementGrantTokenHasBeenCalled) {
      console.log("TESTER");
      showEmployeeSelection();
    }
  }, [xAgreementGrantToken]);
  // end of: -- This is to make sure we catch the token when redirected from economic.--

  //  ---------------------- end of useeffect ----------------------------------------

  ////////////////////////////////////////////// return ///////////////////////////////////////////////////////////////
  return (
    <View style={styles.sendHoursContainer}>
      <ScrollView>
        <Text
          style={styles.headlineText}
          onPress={() => {
            // deleteList();
            deleteToken();
            deleteEmployee();

            // console.log(xAgreementGrantToken);
            // console.log(registrationsData);

            // this is just for testing that I have a deleteList function
          }}
        >
          Send your hours to e-conomic
        </Text>

        {/* sendhourscontainer, itemstyle, itemstylelargetext */}
        {registrationsData &&
          registrationsData.map((item, pos) => {
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
                  {"\t"}-{"\t"}
                  {item.endTime}
                  {"\t"} hours: {"\t"}
                  {item.totalHours && item.totalHours}
                  {/* ------------------------ note ------------------------ */}
                  {item.note && ( // && means if truthy then return text
                    <Text style={styles.itemStyleSmallText}>
                      {"\n"}Note: {item.note}
                    </Text>
                  )}
                  {/* ------------------------------ if activity and project exists ----------------------------- */}
                  {item.activityName && (
                    <Text style={styles.itemStyleSmallText}>
                      {"\n"}
                      {item.activityName}
                    </Text>
                  )}
                  {item.projectName && (
                    <Text style={styles.itemStyleSmallText}>
                      {"\t"} - {"\t"}
                      {item.projectName}
                    </Text>
                  )}
                </Text>
                {/*  if activity doesnt exists and XAGREEMENTTOKEN??? send hours has been pressed, then show button to add activity  */}

                {/* {xAgreementGrantToken&&( */}
                {(!item.activityName || !item.projectName) && // this is just for removing the first text tag if any of them exists
                  xAgreementGrantToken && (
                    <Text>
                      {!item.activityName && (
                        <TouchableOpacity
                          onPress={() => {
                            console.log(registrationsData);

                            openModalActivityPicker(pos);
                          }}
                        >
                          <Text style={styles.buttonAddActivityOrProject}>
                            Add Activity
                          </Text>
                        </TouchableOpacity>
                      )}
                      {/* if not project and XAGREEMENTTOKEN exists */}

                      {!item.projectName && (
                        <TouchableOpacity
                          onPress={() => {
                            openModalProjectPicker(pos);
                          }}
                        >
                          <Text style={styles.buttonAddActivityOrProject}>
                            Add Project
                          </Text>
                        </TouchableOpacity>
                      )}
                    </Text>
                  )}

                {/* -----trashcan----- */}
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
            employeeNo ? postAllTimeEntries() : showEmployeeSelection();
          } else {
            Alert.alert(
              "Connect to e-conomic",
              "You need to log into your company's e-conomc account.",

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
                      "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=I7HMU9jmv6rxT42OViCFYrvD91SrOLkWVNoi3E3BTA01&redirectUrl=https%3A%2F%2Fendpointfortimeitapp.herokuapp.com%2F"
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
        visible={isEmployeeModalVisible}
        nRequestClose={() => setIsEmployeeModalVisible(false)}
      >
        <ModalEmployeePicker
          employees={emplArray}
          isVisible={isEmployeeModalVisible}
          setIsModalVisible={setIsEmployeeModalVisible}
          setEmployeeData={(number) => {
            saveEmployee(number);
          }}
        ></ModalEmployeePicker>
      </Modal>

      {/* --------------project and activity picker for adding later --------------- */}
      {/* Activity picker modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isActModalVisible}
        nRequestClose={() => setIsActivityModalVisible(false)}
      >
        <ModalActivityPicker
          itemKeyForAddingLater={itemKeyForAddingLater}
          activities={activityArray}
          isVisible={isActModalVisible}
          setIsModalVisible={setIsActivityModalVisible}
          setActivityData={(activity, key) => {
            saveActivityToRegistration(key, activity.name, activity.number);
            // saveRegistrations();
            // console.log(
            //   activity.name,
            //   "activity added on registration number ",
            //   key
            // );
          }}
        ></ModalActivityPicker>
      </Modal>

      {/* Project picker modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isProjectModalVisible}
        nRequestClose={() => setIsProjectModalVisible(false)}
      >
        <ModalProjectPicker
          itemKeyForAddingLater={itemKeyForAddingLater}
          projects={projectArray}
          isVisible={isActModalVisible}
          setIsModalVisible={setIsProjectModalVisible}
          setProjectData={(project, key) => {
            saveProjectToRegistration(key, project.name, project.number);
            // saveRegistrations();
            // console.log(
            //   project.name,
            //   "project added on registration number ",
            //   key
            // );
          }}
        ></ModalProjectPicker>
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
              saveXAgreementGrantToken(tokenTekst);
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
