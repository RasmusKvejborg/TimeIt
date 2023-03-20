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
    let dateDetails = date.toLocaleString().split(" "); // split, splits it into an array.
    let weekdayName = dateDetails[0]; // [0] takes only the day.
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
      if (!xAgreementGrantToken)
        setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
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

    // const handleAppStateChange = (state) => {
    //   if (state === "active") {
    //     console.log("handleapp", selectedDate);

    //     setDateText(getDateText(selectedDate));
    //   }
    // };
    // const subscription = AppState.addEventListener(
    //   "change",
    //   handleAppStateChange
    // );

    let listener = navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
      // subscription.remove();
    };
  }, []);

  // ------------------this useeffect is to update the dateText ----------------------------------
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
      setCalcHoursShown(calculateHours(chooseStartTime, chooseEndTime));
  }, [chooseEndTime, chooseStartTime]);

  // -////////////////////////////////////////////////////////////////////-------------- return() ----------------------//////////////////////////////////////////////////////--
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        ref={(ref) => {
          this.scrollView = ref;
        }}
        maxHeight={Dimensions.get("screen").height * 2}
      >
        <View
          style={{
            minHeight: Dimensions.get("screen").height * 0.78,
            marginBottom: 50,
          }}
        >
          {/* <KeyboardAwareScrollView> */}

          {/* <TouchableOpacity
            onPress={() => console.log("handleapb", selectedDate.getDate())}
          > */}
          <Text style={styles.headlineText}>Register your hours.</Text>
          {/* </TouchableOpacity> */}

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

          {/* <Modal
            transparent={true}
            animationType="fade"
            visible={isModalVisible}
            onRequestClose={() => changeModalVisibility(false)}
          ></Modal> */}
          {/* --------------------------- time picker: End time ------------------------------ */}

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
          {chooseEndTime && chooseStartTime && (
            <Text style={styles.inBetweenHoursText}>
              {calcHoursShown == 1
                ? "(" + calcHoursShown + " hour)"
                : "(" + calcHoursShown + " hours)"}
            </Text>
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
            ></ModalTimePicker>
          </Modal>

          {/* ------------------------- datepicker --------------------------------------- */}
          {/* <Text>Select date</Text> */}
          <TouchableOpacity
            onPress={() => {
              onDismissSnackBar();
              // showMode("date"); // this opens the datepicker                                 |
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
              display="default"
              onChange={(event, selectedDate) => {
                setShow(false);
                const chosenDate = selectedDate || selectedDate;
                setSelectedDate(chosenDate);
                let tempDate = new Date(chosenDate);

                setDateText(getDateText(tempDate));

                // let weekdayAndMonthGenerator = tempDate
                //   .toLocaleString("default", {
                //     weekday: "short",
                //     year: "numeric",
                //     month: "short",
                //     day: "numeric",
                //   })
                //   .split(" "); // split, splits it into an array.
                // let weekdayName = weekdayAndMonthGenerator[0]; // [0] takes only the day.
                // let monthName = weekdayAndMonthGenerator[1];
                // // console.log("hellso" + weekdayAndMonthGenerator);

                // let fDate =
                //   weekdayName +
                //   ", " +
                //   // String("0" + tempDate.getDate()).slice(-2) +
                //   String(tempDate.getDate()) +
                //   " " +
                //   monthName;

                // // "/" +
                // // String("0" + (tempDate.getMonth() + 1)).slice(-2); // adding a zero and then slicing 2: if the date isnt two digits, it adds a 0 in front.

                // setDateText(fDate);
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
            onFocus={() => {
              setTimeout(() => {
                this.scrollView.scrollToEnd();
              }, 100);
            }}
            style={styles.noteInput}
            onChangeText={(text) => changeNoteHandler(text)}
            multiline={true}
          />

          <TouchableOpacity // submit button
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
                  activityNum,
                  activityName,
                  projectNum,
                  projectName,
                  note
                );

                hasBeenOnboarded
                  ? saveFunction(registration)
                  : // if its not the first time, it just calls the saveFunction
                    Alert.alert(
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
