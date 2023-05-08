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
  AppState,
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
import { getISOWeek } from "date-fns";

import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [noteText, setNoteText] = React.useState();

  const changeNoteHandler = (val) => {
    setNoteText(val);
  };

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
  const [employeeNumber, setEmployeeNumber] = React.useState();

  const textInputFlexRef = React.useRef();
  const [flexHoursString, setFlexHoursString] = React.useState(0);

  // ----------------------- break stuff ---------------------------
  const breakOptionsText = ["No break", "15", "30", "45", "60"];
  const [selectedBreakOption, setSelectedBreakOption] = React.useState(
    breakOptionsText[0]
  );
  const [breakInHours, setBreakInhours] = React.useState(0);

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
      await AsyncStorage.setItem("@lastProject", JSON.stringify(project));
    }
  };

  // --- constants for timePicking (custom modal) ---
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [chooseStartTime, setChooseStartTime] = React.useState();
  const [chooseEndTime, setChooseEndTime] = React.useState();
  const [startOrEndTimeSelected, setSstartOrEndTimeSelected] = React.useState();
  const [calcHoursShown, setCalcHoursShown] = React.useState();

  const [hoursShown, setHoursShown] = React.useState();

  const changeModalVisibility = (bool, value) => {
    setIsModalVisible(bool);
    setSstartOrEndTimeSelected(value);
  };
  const setTimeData = (option) => {
    startOrEndTimeSelected === "endTime" && setChooseEndTime(option);
    startOrEndTimeSelected === "startTime" && setChooseStartTime(option);
  };

  // ---------------------- calc total hours -----------------------------
  const calculateHours = (startTime, endTime) => {
    const [startHour, startMinutes] = startTime.split(":").map(Number);
    let [endHour, endMinutes] = endTime.split(":").map(Number);

    let minutesInAday = 1440;
    let totalMinutes =
      endHour * 60 + endMinutes - (startHour * 60 + startMinutes);

    if (totalMinutes <= 0) {
      totalMinutes += minutesInAday; // add 24 hours worth of minutes
      // e.g. if worked from 8 am to 7 am next day = -1 hour. But adding 24 hours = 23 hours
    }
    return totalMinutes / 60;
  };
  //  ----------------- end of timePicking ----------------------------------------------

  //------------------------- all below is for date picking -----------------------------

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [dateText, setDateText] = React.useState();

  // ------------------------------ end of datepicker end -------------------------------------------

  // ---------------- functions ---------------------

  function getDateText(date) {
    let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weekdayName = weekdays[date.getDay()];

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
    let showTodayWeekOrYear = "";

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      showTodayWeekOrYear = "(today)";
    } else if (date.getFullYear() === today.getFullYear()) {
      showTodayWeekOrYear = `(week ${getISOWeek(date)})`;
    } else {
      showTodayWeekOrYear = date.getFullYear();
    }

    return `${weekdayName}, ${date.getDate()} ${monthName} ${showTodayWeekOrYear}`;
  }

  // ------------------

  const saveFunction = async (registration) => {
    console.log("regi", registration);
    try {
      let prevItems = await AsyncStorage.getItem("@registration");
      let newItems = [];

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

  const showActivitiesModal = async () => {
    // Hvis jeg vælger at lade den lave API kaldet on startup i stedet: Hvis der ikke er nogen activiteter, skal den stadig hente (f.eks ved første gangs brug)
    await getActivities()
      .then((act) => {
        setActivityArray(act);
        setIsActivityModalVisible(true);
      })
      .catch((e) => {
        console.log(e);
        const { status, data, config } = e.response;

        console.log("status23: ", status);

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

  // const getProjects = () => {
  //   return axios
  //     .get("https://apis.e-conomic.com/api/v16.3.0/projects/all", config)
  //     .then((result) => {
  //       const projectNamesAndNumbers = result.data.items.map((project) => ({
  //         name: project.name,
  //         number: project.number,
  //       }));

  //       return projectNamesAndNumbers;
  //     });
  // };

  const getProjects = () => {
    return axios
      .get(
        `https://apis.e-conomic.com/api/v17.0.2/projects/allowed?employeeNumber=${employeeNumber}`,
        config
      )
      .then((result) => {
        const projectNamesAndNumbers = result.data.map((project) => ({
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
        }
        if (status === 400) {
          Alert.alert(
            "400 error",
            "This might be because you haven't selected your employee name yet. Go to 'Check & Send' and press 'Send to e-conomic' to select your employee name"
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
      if (!xAgreementGrantToken)
        setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };

    const setSavedEmployeeImmediately = async () => {
      const employeeData = JSON.parse(await AsyncStorage.getItem("@Employee"));
      if (employeeData) {
        setEmployeeNumber(employeeData.number);
      }
    };
    // Useeffect getting Last used Activity from storage:
    const setSavedActivityImmediately = async () => {
      const lastActivity = JSON.parse(
        await AsyncStorage.getItem("@lastActivity")
      );
      if (lastActivity) {
        SetActivityNumber(lastActivity.number);
        if (lastActivity.name.length > 26) {
          // 26 is just the characters that fit in my textinput
          setActivityText(lastActivity.name.substring(0, 26));
        } else {
          setActivityText(lastActivity.name);
        }
      }
    };
    setSavedActivityImmediately();
    setSavedEmployeeImmediately();

    // Useeffect getting Last used Project from storage:
    const setSavedProjectImmediately = async () => {
      const lastProject = JSON.parse(
        await AsyncStorage.getItem("@lastProject")
      );
      if (lastProject) {
        SetProjectNumber(lastProject.number);

        if (lastProject.name.length > 26) {
          setProjectText(lastProject.name.substring(0, 26));
        } else setProjectText(lastProject.name);
      }
    };
    setSavedProjectImmediately();

    // for setting the date:
    setDateText(getDateText(new Date()));

    // Useeffect hasBeenOnboarded
    const setHasBeenOnboardedImmediately = async () => {
      setHasBeenOnboarded(await AsyncStorage.getItem("@hasBeenOnboarded"));
    };
    setHasBeenOnboardedImmediately();

    let listener = navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
      setSavedEmployeeImmediately();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  // ----------------
  React.useEffect(() => {
    let listener2 = navigation.addListener("focus", () => {
      setDateText(getDateText(selectedDate)); //this one is also to make sure datetext(today) doesnt say (today) if app has been running in SendhoursScreen past midnight, then it should update when going back to homescreen
    });

    return listener2;
  }, [selectedDate]);

  // ------------------this useeffect is to update the dateText (today) if has been running in background past midnigt, then it shouldnt still say today---------------------------
  React.useEffect(() => {
    const handleAppStateChange = (state) => {
      if (state === "active") {
        setDateText(getDateText(selectedDate));
      }
    };
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, [selectedDate]);
  // ----------- end of regular on-startup useeffect end -------------

  // --------- Useeffect for showing calchours on the spot ---------
  React.useEffect(() => {
    chooseEndTime &&
      chooseStartTime &&
      // (setSelectedBreakOption(breakOptionsText[0]), // setting the break to zero if times has changed.
      setCalcHoursShown(calculateHours(chooseStartTime, chooseEndTime));
    // );
  }, [chooseEndTime, chooseStartTime]);

  React.useEffect(() => {
    calcHoursShown && setHoursShown(calcHoursShown - breakInHours);
  }, [calcHoursShown, breakInHours]);

  // --------------- breakOptions -----------------------------

  const handleOptionSelect = (item) => {
    setSelectedBreakOption(item);
    if (item === "No break") {
      setBreakInhours(0);
    } else {
      setBreakInhours(item / 60);
    }
  };

  const breakOptions = breakOptionsText.map((item, index) => {
    const isSelected = selectedBreakOption === item;

    return (
      <TouchableOpacity key={index} onPress={() => handleOptionSelect(item)}>
        <Text
          style={[
            styles.breakInput,
            isSelected && { backgroundColor: "#BCC8DB", borderWidth: 2 },
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  });

  // -////////////////////////////////////////////////////////////////////-------------- return() ----------------------//////////////////////////////////////////////////////--
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        label="homeScreenScroll"
        onKeyboardDidShow={() => {
          setTimeout(() => {
            this.scrollView.scrollToEnd();
          }, 10);
        }}
        keyboardShouldPersistTaps="handled"
        ref={(ref) => {
          this.scrollView = ref;
        }}
        maxHeight={Dimensions.get("screen").height * 2}
      >
        <View
          style={{
            minHeight: Dimensions.get("screen").height * 0.6,
            marginBottom: 50,
          }}
        >
          <TouchableOpacity
            onPress={() => console.log(parseFloat(flexHoursString))}
          >
            <Text style={styles.headlineText}>Register your hours</Text>
          </TouchableOpacity>

          <StatusBar style="auto" />

          {/* ------------------------- datepicker --------------------------------------- */}
          {/* <Text>Select date</Text> */}
          <TouchableOpacity
            onPress={() => {
              onDismissSnackBar();
              setShow(true);
            }}
          >
            <View pointerEvents="none">
              <TextInput style={styles.input} defaultValue={dateText} />
            </View>
          </TouchableOpacity>

          {show && ( //                                                                    |
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode={"date"}
              is24Hour={true}
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selectedDate) => {
                setShow(false);
                const chosenDate = selectedDate;
                setSelectedDate(chosenDate);
                let tempDate = new Date(chosenDate);

                setDateText(getDateText(tempDate));
              }}
            />
          )}
          {/* ----------------------- end of datepicker ---------------------------- */}
          {/* --------------------------- time picker: Start time ------------------------------ */}

          {typeof activityNumber !== "string" && ( // this means if activity is Flex then down show start/end time, but show just one time
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    onDismissSnackBar();
                    changeModalVisibility(true, "startTime");
                  }}
                >
                  <View pointerEvents="none">
                    <TextInput
                      placeholder="Start time"
                      style={[styles.input, { width: 145 }]}
                    >
                      {chooseStartTime}
                    </TextInput>
                  </View>
                </TouchableOpacity>
                {/* --------------------------- time picker: End time ------------------------------  */}
                <TouchableOpacity
                  onPress={() => {
                    onDismissSnackBar();
                    changeModalVisibility(true, "endTime");
                  }}
                >
                  <View pointerEvents="none">
                    <TextInput
                      placeholder="End time"
                      style={[styles.input, { width: 145 }]}
                    >
                      {chooseEndTime}
                    </TextInput>
                  </View>
                </TouchableOpacity>
              </View>

              {chooseEndTime && chooseStartTime && (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {breakOptions}
                  </View>

                  <View>
                    <Text style={styles.inBetweenHoursText}>
                      {hoursShown == 1
                        ? hoursShown + " hour"
                        : hoursShown + " hours"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <Modal
            transparent={true}
            animationType="fade"
            visible={isModalVisible}
            onRequestClose={() => changeModalVisibility(false)}
          >
            <ModalTimePicker
              changeModalVisibility={changeModalVisibility}
              setData={setTimeData}
              startTimeOrEndTime={startOrEndTimeSelected}
            ></ModalTimePicker>
          </Modal>

          {/*  ---------- show activity and project selector only of connected to economic------------ */}
          {xAgreementGrantToken && (
            <TouchableOpacity
              onPress={() => {
                onDismissSnackBar();
                // console.log(xAgreementGrantToken);
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

          {/* show type in hours with a number only if activty if Optjent Flextid or Anvendt Flextid (which has ID "3" and "4" as strings) -------------------------------------------------------------------------------------------------- */}
          {typeof activityNumber === "string" && (
            <TouchableOpacity
              onPress={() => {
                if (textInputFlexRef.current) {
                  textInputFlexRef.current.focus();
                }
              }}
            >
              <View
                style={[
                  styles.input,
                  { flexDirection: "row", justifyContent: "center" },
                ]}
              >
                <Text style={{ fontSize: 24 }}>Hours: </Text>
                {/* <View style={{ width: 80 }}> */}
                <TextInput
                  style={{ fontSize: 24 }}
                  placeholder="0"
                  onChangeText={(text) => setFlexHoursString(text)}
                  keyboardType={"numeric"}
                  ref={textInputFlexRef}
                ></TextInput>
                {/* </View> */}
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
            style={styles.noteInput}
            onChangeText={(text) => changeNoteHandler(text)}
            multiline={true}
          />

          <TouchableOpacity // submit / save button
            onPress={() => {
              Keyboard.dismiss();
              var startTime = chooseStartTime;
              var endTime = chooseEndTime;
              var dateTime = JSON.stringify(selectedDate);
              var activityNum = activityNumber;
              var activityName = activityText;
              var projectNum = projectNumber;
              var projectName = projectText;
              var note = noteText;

              // const activityNumIsANumber = typeof activityNum === "number"; // if its not a number, then it is flexhours (the only way I could to that easily at the time)
              var totalHours;

              // is activitynumber is a string, then it doesnt have starttime and endtime, just totalhours

              if (typeof activityNumber === "string") {
                totalHours = flexHoursString
                  ? parseFloat(flexHoursString.replace(",", "."))
                  : 0;
                startTime = "";
                endTime = "";
              } else {
                if (startTime === undefined || endTime === undefined) {
                  Alert.alert("Please fill out all required fields ");
                  return;
                }
                var totalHours = hoursShown;
              }

              this.textInput.clear();
              setNoteText("");
              var registration = new Registration(
                startTime,
                endTime,
                dateTime,
                totalHours,
                activityNum,
                activityName,
                projectNum,
                projectName,
                note
              );

              hasBeenOnboarded
                ? saveFunction(registration) // if its not the first time, it just calls the saveFunction
                : Alert.alert(
                    "Welcome",
                    "NB: Your hours are NOT sent until you connect to e-conomic. \n\nYou can do this in the 'Check & Send' tab.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          saveFunction(registration);
                        },
                      },
                    ]
                  );
            }}
          >
            <View>
              <Text style={styles.button}>Save</Text>
            </View>
          </TouchableOpacity>

          {/* -------------------below is invisible things like modals and popups -------------------*/}
          {/* Activity picker modal */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={isActModalVisible}
            onRequestClose={() => setIsActivityModalVisible(false)}
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
            onRequestClose={() => setIsProjectModalVisible(false)}
          >
            <ModalProjectPicker
              projects={projectArray}
              // isVisible={isActModalVisible}
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
            duration={700}
            onDismiss={onDismissSnackBar}
            action={{ label: "Close" }}
          >
            Registration saved.
          </Snackbar>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
