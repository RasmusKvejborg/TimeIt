import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  AppState,
  Platform,
  Clipboard,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios, { all } from "axios";
import { ModalEmployeePicker } from "../../ModalEmployeePicker.js";
import { ModalActivityPicker } from "../../ModalActivityPicker.js";
import { ModalProjectPicker } from "../../ModalProjectPicker.js";
import { getISOWeek } from "date-fns";
import * as WebBrowser from "expo-web-browser";

export default function SendHoursScreen({ navigation }) {
  const [registrationsData, setRegistrationsData] = React.useState([]);
  const [driveRegistrationsData, setDriveRegistrationsData] = React.useState(
    []
  );
  const [oldData, setOldData] = React.useState([]);
  const [appState, setAppState] = React.useState(null);

  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleHoursSentSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);
  // ------------------------inputtokenmodal---------------------------
  // const [showTokenInputModal, setShowTokenInputModal] = React.useState(false);
  // const [tokenTekst, setTokenText] = React.useState();

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
  const [projectFlag, setProjectFlag] = React.useState();

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

  const deleteDriveValue = async (item) => {
    try {
      let newList = driveRegistrationsData;
      newList = newList.filter((i) => i !== item);
      setDriveRegistrationsData(newList);
      await AsyncStorage.setItem("@driveRegistration", JSON.stringify(newList)); // saves a new list where the deleted item has been filtered out
    } catch (err) {
      console.log("eRrOr MsG: deleteDriveValue function: ", err);
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

  const fetchDriveValues = () => {
    AsyncStorage.getItem("@driveRegistration").then((_data) => {
      const data = _data && JSON.parse(_data);
      if (data) {
        setDriveRegistrationsData(data);
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

  const deleteDriveList = async () => {
    try {
      console.log("drive list deleted from asyncstorage");
      await AsyncStorage.removeItem("@driveRegistration");
    } catch (err) {
      console.log("error in drive deletion: ", err);
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
            "Something went wrong. Error 103",
            "If the issue persists, contact support"
          );
        }
      });
  };

  // ------------------post registrations-------------------------------------------
  postToFirebase = () => {
    console.log(
      "xAgreementGrantToken: ",
      xAgreementGrantToken,
      "employeeNo: ",
      employeeNo
    );
  };

  const postAllDriveEntries = async () => {
    if (driveRegistrationsData.length <= 0) {
      console.log("NO DRIVE REGISTRATIONS (and thats ok)");
      return;
    }
    const DriveProjectNumberMissing = driveRegistrationsData.some(
      (val) => !val.projectNumber
    );

    if (DriveProjectNumberMissing) {
      Alert.alert(
        "Project missing",
        "Add a Project to all your Drive registrations. \n\nYou may have to scroll down to see it."
      );
      return;
    }

    const drivePromises = [];

    driveRegistrationsData.forEach((val) => {
      drivePromises.push(
        postMilageEntry(
          val.dateTime,
          val.distance,
          val.projectNumber,
          val.origin,
          val.destination
        )
      );
    });
    try {
      await Promise.all(drivePromises);
      setDriveRegistrationsData([]);
      deleteDriveList();
      onToggleHoursSentSnackBar();
    } catch (e) {
      console.log("error...", e);
      Alert.alert(
        "Something went wrong. Error 105",
        "Try again later or contact support"
      );
    }
  };

  // -------------------------------- post milage entry ---------------------------------------------

  const postMilageEntry = async (
    date,
    distance,
    project,
    origin,
    destination
  ) => {
    let milageEnt = {
      // date: JSON.parse(date), // this has to be parsed because it is stringified twice by mistake in HomeScreen. format: "2023-02-18T15:23:01Z"
      date: JSON.parse(date),
      distance: distance,
      employeeNumber: employeeNo,
      projectNumber: project,
      from: origin,
      to: destination,
    };
    try {
      const res = await axios.post(
        "https://apis.e-conomic.com/api/v17.0.2/mileages",
        milageEnt,
        config
      );

      return res;
    } catch (e) {
      // Alert.alert("Something went wrong. Error 107");
      console.log("error....", e);
      throw e; // re-throw the error so that it can be caught by the Promise.all() call
    }
  };

  //------------------post all time entries-------------------------------------------
  const postAllTimeEntries = async () => {
    // data.forEach((val) => {
    //   postTimeEntry(val.note, val.date);
    // });
    // below is a complex version of the above

    if (registrationsData.length > 0) {
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
              val.activity,
              val.project,
              val.note
            )
          ); // calls the postTimeEntry() for each entry
        });
        try {
          await Promise.all(promises);
          //  if success, then save oldData, but delete all registrations:
          setOldData(registrationsData); // not saving any old drive registrations at the moment
          setRegistrationsData([]);
          deleteList();
          onToggleHoursSentSnackBar();
        } catch (e) {
          console.log("error..", e);
          const { status, data, config } = e.response;

          if (status === 401) {
            Alert.alert(
              "401 error",
              "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong."
            );
          } else {
            Alert.alert(
              "Something went wrong. Error 104",
              "Try again later or contact support"
            );
          }
        }
      }
    } else if (driveRegistrationsData.length <= 0) {
      // this triggers if there are no Drive data AND not Time registrations.
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
    let timeEnt = {
      activityNumber: activity,
      date: JSON.parse(date), // this has to be parsed because it is stringified twice by mistake in HomeScreen. format: "2023-02-18T15:23:01Z"
      employeeNumber: employeeNo,
      projectNumber: project,
      numberOfHours: totalHours,
      text: note && note,
    };

    try {
      const res = await axios.post(
        "https://apis.e-conomic.com/api/v16.2.2/timeentries",
        timeEnt,
        config
      );

      return res;
    } catch (e) {
      console.log("error....", e);
      throw e; // re-throw the error so that it can be caught by the Promise.all() call
    }
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
    if (tokenData) {
      console.log("saveXAgreementGrantToken called");
      setSaveXAgreementGrantTokenHasBeenCalled(true);
      setXAgreementGrantToken(tokenData);
      await AsyncStorage.setItem("@xAppSecretToken", tokenData);
    }
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

  const deleteLastActivityAndProject = async () => {
    try {
      console.log("lastactivity og project er deleted");
      await AsyncStorage.removeItem("@lastActivity");
      await AsyncStorage.removeItem("@lastProject");
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
        console.log("err:", e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert(
            "401 error",
            "See if there is an update in the app store and try restarting the app"
            // "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
          );
        } else {
          Alert.alert(
            "Something went wrong. Error 100",
            "Try again later or contact support"
          );
        }
      });
  };

  // ------------------- get projects and show modal -----------------------------------------

  const openModalProjectPicker = async (key, flag) => {
    setItemKeyForAddingLater(key);
    setProjectFlag(flag);

    await getProjects()
      .then((projects) => {
        setProjectArray(projects);
        setIsProjectModalVisible(true);
      })
      .catch((e) => {
        console.log("error:", e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert(
            "401 error"
            // ,
            // "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
          );
        } else {
          Alert.alert(
            "Something went wrong. Error 101",
            "If the error persists, contact support"
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

  const saveProjectToRegistration = async (
    key,
    projectName,
    projectNumber,
    flag
  ) => {
    if (flag === "drive") {
      let newDataToBeSet = driveRegistrationsData[key];
      newDataToBeSet["projectNumber"] = projectNumber;
      newDataToBeSet["projectName"] = projectName;

      let alldata = driveRegistrationsData;
      alldata[key] = newDataToBeSet;

      setDriveRegistrationsData(alldata);

      if (alldata) {
        await AsyncStorage.setItem(
          "@driveRegistration",
          JSON.stringify(alldata)
        );
      }
    } else {
      let newDataToBeSet = registrationsData[key];
      newDataToBeSet["project"] = projectNumber;
      newDataToBeSet["projectName"] = projectName;

      let alldata = registrationsData;
      alldata[key] = newDataToBeSet;

      setRegistrationsData(alldata);

      if (alldata) {
        await AsyncStorage.setItem("@registration", JSON.stringify(alldata));
      }
    }
  };

  // ########################################### end of activity and project addlater functions #########################################

  function getDateText(date) {
    const months = [
      "Jan.",
      "Feb.",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    let monthName = months[date.getMonth()];

    let today = new Date();
    let yearOrWeek = "";

    if (date.getFullYear() === today.getFullYear()) {
      yearOrWeek = `(week ${getISOWeek(date)})`;
    } else {
      yearOrWeek = date.getFullYear();
    }

    return `${date.getDate()} ${monthName} ${yearOrWeek}`;
  }

  let totalOfAllHours = 0;

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
    let listener = navigation.addListener("focus", () => {
      fetchValues();
      fetchDriveValues();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  //  FOR FETCHING THE TOKEN FROM ECONOMIC

  // This is to make sure we catch the token when redirected from economic.
  // No matter if the app is open in background or closed, we should get the token when redirected back to app.

  const onAppStateChange = async (nextAppState, url) => {
    if (!xAgreementGrantToken) {
      // cold start
      if (appState === null) {
        Linking.getInitialURL().then((urlLink) => {
          if (urlLink) {
            const token = urlLink.split("=")[1];
            console.log("TOKEN ON COLD START ", token);
            saveXAgreementGrantToken(token);
          }
        });
      }
      setAppState(nextAppState);
    }
  };

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    const subscription1 = Linking.addEventListener("url", (event) => {
      if (event.url) {
        const token = event.url.split("=")[1];
        saveXAgreementGrantToken(token);
      }

      if (appState === null) {
        // The event is not triggered on cold start since the change has already taken place
        // therefore we need to call it manually:
        onAppStateChange(AppState.currentState, event.url);
      }
    });

    return () => {
      subscription.remove(); //removeEventListener is depricated, this is the same as that.
      subscription1.remove;
    };
  }, [appState]);

  React.useEffect(() => {
    if (xAgreementGrantToken && saveXAgreementGrantTokenHasBeenCalled) {
      showEmployeeSelection();
    }
  }, [xAgreementGrantToken]);
  // end of: -- This is to make sure we catch the token when redirected from economic.--

  //  ---------------------- end of useeffect ----------------------------------------

  const _handlePressButtonAsync = async () => {
    await WebBrowser.openBrowserAsync(
      "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=I7HMU9jmv6rxT42OViCFYrvD91SrOLkWVNoi3E3BTA01&redirectUrl=https%3A%2F%2Fendpointfortimeitapp.herokuapp.com%2F"
    );
  };

  ////////////////////////////////////////////// return ///////////////////////////////////////////////////////////////
  return (
    <View style={styles.sendHoursContainer}>
      <ScrollView>
        <Text
          style={styles.headlineText}
          onPress={() => {
            // deleteList();
            // deleteToken();
            // deleteEmployee();
            // deleteLastActivityAndProject();

            // saveXAgreementGrantToken(
            //   "YMVOcbfrry6WtWcIgenGBsus7zAhduf6bc87WaqI81w1"
            // );
            // postMilageEntry();

            // console.log(driveRegistrationsData);
            // console.log(xAgreementGrantToken);

            postToFirebase();
          }}
        >
          Send your hours to e-conomic
        </Text>
        {xAgreementGrantToken && (
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(
                `https://endpointfortimeitapp.herokuapp.com/?token=${xAgreementGrantToken}`
              );
              Alert.alert(
                "Share e-conomic connection",
                `1. Ask employee to download this app. \n \n2. Send this link to employee's phone (link copied to clipboard). \n \nhttps://endpointfortimeitapp.herokuapp.com/?token=${xAgreementGrantToken}`
              );
            }}
          >
            <Text style={{ marginLeft: 10 }}>Share</Text>
          </TouchableOpacity>
        )}
        {/* sendhourscontainer, itemstyle, itemstylelargetext */}
        {registrationsData &&
          registrationsData.map((item, pos) => {
            var formattedDate = JSON.parse(item.date);
            //   .slice(0, 10)
            //   .split("-")
            //   .reverse()
            //   .join("/");
            totalOfAllHours += item.totalHours;
            formattedDate = getDateText(new Date(formattedDate));
            return (
              <View style={styles.itemStyle} key={pos}>
                <Text style={styles.itemStyleLargeText}>
                  {formattedDate}
                  {"\n"}
                  {item.startTime} - {item.endTime}
                  {/* hours:{" "}
                  {item.totalHours && item.totalHours} */}
                  {item.totalHours == 1
                    ? " (" + item.totalHours + " hour)"
                    : " (" + item.totalHours + " hours)"}
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
                      {" "}
                      - {item.projectName}
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
                            openModalProjectPicker(pos, "hourregistration");
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
                        "Are you sure you want to delete this registration?",
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

        {/*--------------------------------------------- DRIVING --------------------------------------------- */}

        {driveRegistrationsData &&
          driveRegistrationsData.map((item, pos) => {
            var formattedDate = JSON.parse(item.dateTime);
            formattedDate = getDateText(new Date(formattedDate));
            return (
              <View style={styles.itemStyle} key={pos}>
                <Text style={styles.itemStyleLargeText}>
                  {formattedDate}
                  {"\n"}
                  <Ionicons name="car-outline" size={30}></Ionicons>{" "}
                  {item.distance} km
                  {/* ------------------------------ if PROJECT exists ----------------------------- */}
                  <Text style={styles.itemStyleSmallText}>
                    {"\n"}
                    {
                      item.origin.substring(0, 60)
                      // +
                      //   (item.origin.length > 32 ? "..." : "")
                    }
                    {"\n"}
                    {" ->"}
                    {"\n"}
                    {
                      item.destination.substring(0, 60)
                      //  +
                      //   (item.destination.length > 33 ? "..." : "")
                    }
                  </Text>
                  {item.projectNumber && (
                    <Text style={styles.itemStyleSmallText}>
                      {"\n"}
                      {item.projectName}
                    </Text>
                  )}
                </Text>

                {xAgreementGrantToken && !item.projectNumber && (
                  <TouchableOpacity
                    onPress={() => {
                      openModalProjectPicker(pos, "drive");
                    }}
                  >
                    <Text style={styles.buttonAddActivityOrProject}>
                      Add Project
                    </Text>
                  </TouchableOpacity>
                )}

                {/* -----trashcan----- */}
                <View style={styles.trashCan}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Really delete?",
                        "Are you sure you want to delete this registration?",
                        [
                          {
                            text: "Cancel",
                            onPress: () => console.log("cancel pressed"),
                          },
                          {
                            text: "Delete",
                            onPress: () => {
                              deleteDriveValue(item);
                            },
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
      <Text style={styles.totalHoursText}>Total hours: {totalOfAllHours}</Text>
      <TouchableOpacity
        onPress={() => {
          if (xAgreementGrantToken) {
            employeeNo
              ? (postAllTimeEntries(), postAllDriveEntries())
              : showEmployeeSelection();
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
                    if (Platform.OS === "android") {
                      Linking.openURL(
                        "https://secure.e-conomic.com/secure/api1/requestaccess.aspx?appPublicToken=I7HMU9jmv6rxT42OViCFYrvD91SrOLkWVNoi3E3BTA01&redirectUrl=https%3A%2F%2Fendpointfortimeitapp.herokuapp.com%2F"
                      );
                    } else if (Platform.OS === "ios") {
                      _handlePressButtonAsync();
                    }
                  },
                },
              ]
            );
          }
        }}
      >
        {xAgreementGrantToken ? (
          <Text style={styles.buttonSendHours}>Send to e-conomic</Text>
        ) : (
          <Text style={styles.buttonConnectToEconomic}>
            Connect to e-conomic
          </Text>
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
          projectFlag={projectFlag}
          projects={projectArray}
          isVisible={isActModalVisible}
          setIsModalVisible={setIsProjectModalVisible}
          setProjectData={(project, key, flag) => {
            saveProjectToRegistration(key, project.name, project.number, flag);
          }}
        ></ModalProjectPicker>
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
