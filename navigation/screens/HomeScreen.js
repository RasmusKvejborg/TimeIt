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
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import { Registration } from "../../RegistrationClass.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ModalTimePicker } from "../../ModalTimePicker.js";

export default function HomeScreen({ navigation }) {
  // --- constants for timePicking (custom modal) ---
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [chooseStartTime, setChooseStartTime] = React.useState();
  const [chooseEndTime, setChooseEndTime] = React.useState();
  const [startOrEndTimeSelected, setSstartOrEndTimeSelected] = React.useState();

  // const changeStartOrEndTimeSelected = (value) => {
  //   setIsModalVisible(value);
  // };

  const changeModalVisibility = (bool, value) => {
    setIsModalVisible(bool);
    setSstartOrEndTimeSelected(value);
  };
  const setTimeData = (option) => {
    startOrEndTimeSelected === "endTime" && setChooseEndTime(option);
    startOrEndTimeSelected === "startTime" && setChooseStartTime(option);
  };
  //  ----------------- end of timePicking ---------------------
  const [noteText, setNoteText] = React.useState();

  const changeNoteHandler = (val) => {
    setNoteText(val);
  };

  //------------------------- all below is for date picking ----------------
  const [date, setDate] = React.useState(new Date());
  const [mode, setMode] = React.useState("date"); // could be just default
  const [show, setShow] = React.useState(false);
  const [dateText, setDateText] = React.useState(
    new Date().getDate() + "/" + new Date().getMonth() + 1
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
      } else {
        newItems = [registration];
      }

      const value = await AsyncStorage.setItem(
        "@registration",
        JSON.stringify(newItems)
      );
    } catch (error) {
      console.log("eRrOr MsG: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>This is the HomeScreen!</Text>
      <StatusBar style="auto" />
      {/* --------------------------- time picker: Start time ------------------------------ */}
      <Text>Enter start time</Text>
      <TouchableOpacity
        onPress={() => changeModalVisibility(true, "startTime")}
      >
        <Text style={styles.input}>{chooseStartTime}</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        nRequestClose={() => changeModalVisibility(false)}
      ></Modal>
      {/* --------------------------- time picker: End time ------------------------------ */}

      <Text>Enter end time</Text>
      <TouchableOpacity onPress={() => changeModalVisibility(true, "endTime")}>
        <Text style={styles.input}>{chooseEndTime}</Text>
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
      <Text>Select date</Text>
      <TouchableOpacity
        onPress={() => {
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
            const currentDate = selectedDate || date;
            setDate(currentDate);
            let tempDate = new Date(currentDate);
            let fDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1);

            setDateText(fDate);
          }}
        />
      )}
      {/* ----------------------- end of datepicker ----------------------------------- */}

      <Text>Note (optional)</Text>
      <TextInput
        ref={(input) => {
          this.textInput = input;
        }}
        style={styles.noteInput}
        onChangeText={(text) => changeNoteHandler(text)}
      />

      <TouchableOpacity // submit button
        onPress={() => {
          Keyboard.dismiss();
          var startTime = chooseStartTime;
          var endTime = chooseEndTime;
          var dateTime = JSON.stringify(date);
          var note = noteText;

          if (startTime === "undefined") {
            // if noting has been typed into starttime. === null didnt work so I went for ==="undefined"
            Alert.alert("Please fill out all required fields ");
          } else {
            this.textInput.clear();
            setNoteText("");
            var registration = new Registration(
              startTime,
              endTime,
              dateTime,
              note
            );
            saveFunction(registration); //the objects should be stringyfied. Might be JSON
            Alert.alert(
              "Registration saved",
              "See your registrations in the 'Check & Send' menu"
            );
          }
        }}
      >
        <View>
          <Text style={styles.button}>Submit</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
