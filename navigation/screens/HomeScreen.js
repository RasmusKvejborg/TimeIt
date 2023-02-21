import { StatusBar } from "expo-status-bar";

import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Modal,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import { Registration } from "../../RegistrationClass.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ModalTimePicker } from "../../ModalTimePicker.js";
import { Snackbar } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ModalActivityPicker } from "../../ModalActivityPicker.js";
import { ModalProjectPicker } from "../../ModalProjectPicker.js";

import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [noteText, setNoteText] = React.useState();

  const changeNoteHandler = (val) => {
    setNoteText(val);
  };

  // const { height } = Dimensions.get("window");

  // ----------- onboarding--------------
  const saveHasBeenOnboardedNow = () => {
    if (!hasBeenOnboarded) {
      AsyncStorage.setItem("@hasBeenOnboarded", "true");
      console.log("HAS BEEEN unboarded now, happens only once");
      setHasBeenOnboarded(true);
    }
  };

  const [hasBeenOnboarded, setHasBeenOnboarded] = React.useState(false);

  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);

  // ------------------------ activity picker modal -----------------
  const [activityArray, setActivityArray] = React.useState([]);
  const [activityNumber, SetActivityNumber] = React.useState();
  const [isActModalVisible, setIsActivityModalVisible] = React.useState(false);
  const [activityText, setActivityText] = React.useState();

  const saveLastActivity = async (activity) => {
    if (activity) {
      SetActivityNumber(activity);
      console.log("Last activity saved: ", activity);
      await AsyncStorage.setItem("@lastActivity", JSON.stringify(activity));
    }
  };

  // ------------------------ project picker modal -----------------
  const [projectArray, setProjectArray] = React.useState([]);
  const [projectNumber, SetProjectNumber] = React.useState();
  const [isProjectModalVisible, setIsProjectModalVisible] =
    React.useState(false);
  const [projectText, setProjectText] = React.useState();

  const saveLastProject = async (project) => {
    if (project) {
      SetProjectNumber(project.number);
      console.log("saved project: ", project);
      await AsyncStorage.setItem("@lastProject", JSON.stringify(project));
    }
  };

  // --- constants for timePicking (custom modal) ---
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [chooseStartTime, setChooseStartTime] = React.useState();
  const [chooseEndTime, setChooseEndTime] = React.useState();
  const [startOrEndTimeSelected, setSstartOrEndTimeSelected] = React.useState();

  const changeModalVisibility = (bool, value) => {
    setIsModalVisible(bool);
    setSstartOrEndTimeSelected(value);
  };
  const setTimeData = (option) => {
    startOrEndTimeSelected === "endTime" && setChooseEndTime(option);
    startOrEndTimeSelected === "startTime" && setChooseStartTime(option);
  };

  // ---------------------- calc total hours -----------------------
  const calculateHours = (startTime, endTime) => {
    const [startHour, startMinutes] = startTime.split(":").map(Number);
    let [endHour, endMinutes] = endTime.split(":").map(Number);

    if (endHour <= startHour) {
      endHour += 24; // if someone worked past midnight
    }

    const totalMinutes =
      endHour * 60 + endMinutes - (startHour * 60 + startMinutes);
    return totalMinutes / 60;
  };
  //  ----------------- end of timePicking ---------------------

  //------------------------- all below is for date picking ----------------
  const [date, setDate] = React.useState(new Date());
  const [mode, setMode] = React.useState("date"); // could be just default
  const [show, setShow] = React.useState(false);
  const [dateText, setDateText] = React.useState(
    String("0" + new Date().getDate()).slice(-2) +
      "/" +
      String("0" + (new Date().getMonth() + 1)).slice(-2)
  );

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };
  // ------------------------------ end of datepicker end ---------------------

  const saveFunction = async (registration) => {
    try {
      let prevItems = await AsyncStorage.getItem("@registration");

      if (prevItems !== null) {
        newItems = JSON.parse(prevItems);
        newItems.push(registration);

        newItems.sort((a, b) =>
          a.date == b.date
            ? a.startTime < b.startTime
              ? 1
              : -1
            : a.date < b.date
            ? 1
            : -1
        ); // sorts the list datewise
      } else {
        newItems = [registration];
      }
      const value = await AsyncStorage.setItem(
        "@registration",
        JSON.stringify(newItems)
      ).then((onToggleSnackBar(), saveHasBeenOnboardedNow()));
    } catch (error) {
      console.log("eRrOr MsG: ", error);
    }
  };

  // ------------------API stuff----------------------------------

  const config = {
    headers: {
      "X-AppSecretToken": "vf0W9meQJEx3uK7mzjYEZhEbfTYWnSswmMzTIDeLWNI1",
      "X-AgreementGrantToken": xAgreementGrantToken,
      "Content-Type": "application/json",
    },
  };

  //--------------------------------------------------------
  // ------------------- get activities and show modal -----------------------------------------

  const showActivitiesModal = () => {
    getActivities()
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
            "This could be because the ID (xAgreementGrantToken) from e-conomic was pasted in wrong.\n \nTo fix this: \n(NB: This fix will delete all registrations that you have not yet sent to e-conomic)\n\n- Go to your device's Settings. \n- Tap on 'Apps' or 'Application Manager,' depending on your device. \n- Find this app and tap on it. \n- Tap on 'Storage'. \n- Tap on 'Clear Data' or 'Clear Storage' (depending on your device). Then try again"
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

  // ------------------- get projects and show modal -----------------------------------------

  const showProjectsModal = async () => {
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

  // -------------------------- USE EFFECT ------------------------------------

  React.useEffect(() => {
    const setXAppSecretTokenImmediately = async () => {
      setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };

    // Useeffect getting Last used Activity from storage:
    const setSavedActivityImmediately = async () => {
      const lastActivity = JSON.parse(
        await AsyncStorage.getItem("@lastActivity")
      );
      if (lastActivity) {
        SetActivityNumber(lastActivity.number);
        setActivityText(lastActivity.name);
      }
    };
    setSavedActivityImmediately();

    // Useeffect getting Last used Project from storage:
    const setSavedProjectImmediately = async () => {
      const lastProject = JSON.parse(
        await AsyncStorage.getItem("@lastProject")
      );
      if (lastProject) {
        SetProjectNumber(lastProject.number);
        setProjectText(lastProject.name);
      }
    };
    setSavedProjectImmediately();

    // Useeffect hasBeenOnboarded
    const setHasBeenOnboardedImmediately = async () => {
      setHasBeenOnboarded(await AsyncStorage.getItem("@hasBeenOnboarded"));
    };
    setHasBeenOnboardedImmediately();

    return navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
    });
  }, []);

  // const deleteList = async () => {
  //   try {
  //     console.log(
  //       "list deleted from asyncstorage (it is still in the setData list)"
  //     );
  //     await AsyncStorage.removeItem("@registration");
  //   } catch (err) {
  //     console.log("error in deletion: ", err);
  //   }
  // };

  // -////////////////////////////////////////////////////////////////////-------------- return() ----------------------//////////////////////////////////////////////////////--
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={{ minHeight: Dimensions.get("screen").height * 0.85 }}>
          {/* <KeyboardAwareScrollView> */}

          <TouchableOpacity
          // onPress={() => (
          //   AsyncStorage.removeItem("@hasBeenOnboarded"),
          //   setHasBeenOnboarded(false)
          // )}
          >
            <Text style={styles.headlineText}>Register your hours!</Text>
          </TouchableOpacity>

          <StatusBar style="auto" />
          {/* --------------------------- time picker: Start time ------------------------------ */}
          {/* <Text>Enter start time</Text> */}
          <TouchableOpacity
            onPress={() => {
              onDismissSnackBar();

              changeModalVisibility(true, "startTime");
            }}
          >
            <View pointerEvents="none">
              <TextInput placeholder="Select start time" style={styles.input}>
                {chooseStartTime}
              </TextInput>
            </View>
          </TouchableOpacity>

          <Modal
            transparent={true}
            animationType="fade"
            visible={isModalVisible}
            nRequestClose={() => changeModalVisibility(false)}
          ></Modal>
          {/* --------------------------- time picker: End time ------------------------------ */}

          {/* <Text>Enter end time</Text> */}
          <TouchableOpacity
            onPress={() => {
              onDismissSnackBar();

              changeModalVisibility(true, "endTime");
            }}
          >
            <View pointerEvents="none">
              <TextInput placeholder="Select end time" style={styles.input}>
                {chooseEndTime}
              </TextInput>
            </View>
          </TouchableOpacity>

          <Modal
            transparent={true}
            animationType="fade"
            visible={isModalVisible}
            nRequestClose={() => changeModalVisibility(false)}
          >
            <ModalTimePicker
              changeModalVisibility={changeModalVisibility}
              setData={setTimeData}
            ></ModalTimePicker>
          </Modal>

          {/* ------------------------- datepicker --------------------------------------- */}
          {/* <Text>Select date</Text> */}
          <TouchableOpacity
            onPress={() => {
              onDismissSnackBar();
              showMode("date"); // this opens the datepicker                                 |
            }}
          >
            <View pointerEvents="none">
              <TextInput style={styles.input} defaultValue={dateText} />
            </View>
          </TouchableOpacity>

          {show && ( //                                                                    |
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShow(false);
                const chosenDate = selectedDate || date;
                setDate(chosenDate);
                let tempDate = new Date(chosenDate);
                let fDate =
                  String("0" + tempDate.getDate()).slice(-2) +
                  "/" +
                  String("0" + (tempDate.getMonth() + 1)).slice(-2); // old way: tempDate.getDate() + "/" + (tempDate.getMonth() + 1);

                setDateText(fDate);
              }}
            />
          )}
          {/* ----------------------- end of datepicker ---------------------------- */}

          {/*  ---------- show activity and project selector only of connected to economic------------ */}
          {xAgreementGrantToken && (
            <TouchableOpacity
              onPress={() => {
                onDismissSnackBar();
                // console.log(xAgreementGrantToken);
                // getActivities();
                showActivitiesModal(); // this opens the Activitypicker.                     |
              }}
            >
              <View pointerEvents="none">
                <TextInput
                  placeholder="Select activity"
                  style={styles.input}
                  defaultValue={activityText}
                ></TextInput>
              </View>
            </TouchableOpacity>
          )}
          {xAgreementGrantToken && (
            <TouchableOpacity
              onPress={() => {
                onDismissSnackBar();
                showProjectsModal();
              }}
            >
              <View pointerEvents="none">
                <TextInput
                  placeholder="Select project"
                  style={styles.input}
                  defaultValue={projectText}
                ></TextInput>
              </View>
            </TouchableOpacity>
          )}

          {/* ----------------------- note ------------------------------------- */}
          <TextInput
            placeholder="Note (optional)"
            ref={(input) => {
              this.textInput = input;
            }}
            style={styles.input}
            onChangeText={(text) => changeNoteHandler(text)}
          />

          <TouchableOpacity // submit button
            onPress={() => {
              Keyboard.dismiss();
              var startTime = chooseStartTime;
              var endTime = chooseEndTime;
              var dateTime = JSON.stringify(date);
              var note = noteText;

              // deleteList();

              if (startTime === undefined || endTime === undefined) {
                Alert.alert("Please fill out all required fields ");
              } else {
                var totalHours = calculateHours(chooseStartTime, chooseEndTime);

                this.textInput.clear();
                setNoteText("");
                var registration = new Registration(
                  startTime,
                  endTime,
                  dateTime,
                  totalHours,
                  note
                );

                hasBeenOnboarded
                  ? saveFunction(registration) // if its not the first time, it just calls the saveFunction
                  : Alert.alert(
                      "First registration? Welcome!",
                      "NB: Your hours are NOT sent until you connect to e-conomic. \n\nYou can do this in the 'Check & Send' tab.\n\nActivities and projects will be unlocked when you connect.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            saveFunction(registration);
                          },
                        },
                      ]
                    );
              }
            }}
          >
            <View>
              <Text style={styles.button}>Save</Text>
            </View>
          </TouchableOpacity>
          {/* </KeyboardAwareScrollView> */}

          {/* -------------------below is invisible things like modals and popups -------------------*/}
          {/* Activity picker modal */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={isActModalVisible}
            nRequestClose={() => setIsActivityModalVisible(false)}
          >
            <ModalActivityPicker
              activities={activityArray}
              isVisible={isActModalVisible}
              setIsModalVisible={setIsActivityModalVisible}
              setActivityData={(activity) => {
                saveLastActivity(activity);
                setActivityText(activity.name);
                SetActivityNumber(activity.number);
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
              projects={projectArray}
              isVisible={isActModalVisible}
              setIsModalVisible={setIsProjectModalVisible}
              setProjectData={(project) => {
                saveLastProject(project);
                setProjectText(project.name);
                SetProjectNumber(project.number);
              }}
            ></ModalProjectPicker>
          </Modal>

          <Snackbar
            style={styles.snackBar}
            visible={snackBarVisible}
            duration={4000}
            onDismiss={onDismissSnackBar}
            action={{ label: "Close" }}
          >
            Registration saved. See your registrations in 'Check & Send'
          </Snackbar>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
