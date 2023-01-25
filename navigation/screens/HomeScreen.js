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
  // --- constans for timePicking (custom modal) ---
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [chooseTime, setChooseTime] = React.useState();
  const changeModalVisibility = (bool) => {
    setIsModalVisible(bool);
  };
  const setTimeData = (option) => {
    setChooseTime(option);
  };
  //  ----------------- end of timePicking ---------------------

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

      <Text>Enter start time</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => (this.startTime1 = text)}
      />

      {/* --------------------------- time picker ------------------------------ */}
      <TouchableOpacity onPress={() => changeModalVisibility(true)}>
        <Text style={styles.input}>{chooseTime}</Text>
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
            let fDate = tempDate.getDate() + "/" + tempDate.getMonth() + 1;

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
        onChangeText={(text) => (this.note1 = text)}
      />

      <TouchableOpacity // submit button
        onPress={() => {
          Keyboard.dismiss();
          var startTime = String(this.startTime1);
          var endTime = String(this.endTime1);
          var dateTime = JSON.stringify(date);
          var note = String(this.note1);

          if (startTime === "undefined") {
            // if noting has been typed into starttime. === null didnt work so I went for ==="undefined"
            Alert.alert("Please fill out all required fields ");
          } else {
            this.textInput.clear();
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
