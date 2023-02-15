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
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import { Registration } from "../../RegistrationClass.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ModalTimePicker } from "../../ModalTimePicker.js";
import { Snackbar } from "react-native-paper";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function HomeScreen({ navigation }) {
  const [noteText, setNoteText] = React.useState();

  const changeNoteHandler = (val) => {
    setNoteText(val);
  };

  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);

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
      console.log(newItems);
      const value = await AsyncStorage.setItem(
        "@registration",
        JSON.stringify(newItems)
      );
    } catch (error) {
      console.log("eRrOr MsG: ", error);
    }
  };

  React.useEffect(() => {
    const setXAppSecretTokenImmediately = async () => {
      setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };

    return navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
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

  // -////////////////////////////////////////////////////////////////////-------------- return() ----------------------//////////////////////////////////////////////////////--
  return (
    <View style={styles.container}>
      {/* <KeyboardAwareScrollView
        contentContainerStyle={{
          height: Dimensions.get("window").height * 2.25, 
          width: "100%",
        }}
      > */}
      <Snackbar
        style={styles.snackBar}
        visible={snackBarVisible}
        duration={4000}
        onDismiss={onDismissSnackBar}
        action={{ label: "Close" }}
      >
        Registration saved. See your registrations in 'Check & Send'
      </Snackbar>

      <Text style={styles.registerHoursText}>Register your hours!</Text>
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
            // console.log(date);
            let tempDate = new Date(chosenDate);
            let fDate =
              String("0" + tempDate.getDate()).slice(-2) +
              "/" +
              String("0" + (tempDate.getMonth() + 1)).slice(-2); // old way: tempDate.getDate() + "/" + (tempDate.getMonth() + 1);

            setDateText(fDate);
          }}
        />
      )}
      {/* ----------------------- end of datepicker ----------------------------------- */}
      {/*  ---------- show activity and project selector only of connected to economic------------ */}
      {xAgreementGrantToken && (
        <TextInput
          placeholder="Select activity"
          style={styles.input}
        ></TextInput>
      )}
      {xAgreementGrantToken && (
        <TextInput
          placeholder="Select project"
          style={styles.input}
        ></TextInput>
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

          // var dateTime = JSON.stringify(date);
          var note = noteText;

          // deleteList();
          // console.log(JSON.parse(dateTime));

          if (startTime === undefined || endTime === undefined) {
            Alert.alert("Please fill out all required fields ");
          } else {
            // console.log(startTime);
            // console.log(endTime);

            // console.log(""hello"");

            this.textInput.clear();
            setNoteText("");
            var registration = new Registration(
              startTime,
              endTime,
              dateTime,
              note
            );

            console.log(registration);

            saveFunction(registration);
            onToggleSnackBar();
          }
        }}
      >
        <View>
          <Text style={styles.button}>Save</Text>
        </View>
      </TouchableOpacity>
      {/* </KeyboardAwareScrollView> */}
    </View>
  );
}
