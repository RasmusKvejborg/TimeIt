import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const ModalEmployeePicker = (props) => {
  const { isVisible, employees } = props;

  const onPressItem = (number, name) => {
    props.setIsModalVisible(false);
    props.setEmployeeData(number, name);
  };

  // ----------------------------------

  const employeeOptions = employees.map((empl) => {
    return (
      <TouchableOpacity
        key={empl.number}
        onPress={() => {
          Alert.alert(
            `Are you really ${empl.name}?`,
            "This action can't be undone",
            [
              {
                text: "Cancel",
                onPress: () => {
                  onPressItem();
                  console.log("cancel has been pressed");
                },
              },
              {
                text: "Yes I am",
                onPress: () => {
                  console.log(
                    "Employee selected: ",
                    empl.name,
                    "number: ",
                    empl.number
                  );
                  onPressItem(empl.number, empl.name);
                },
              },
            ]
          );

          // onPressItem(empl.number)
        }}
      >
        <Text style={styles.ActivityAndProjectPickerTextInside}>
          {empl.name}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <SafeAreaView
      style={[
        styles.modal,
        {
          alignItems: "center",
          height: HEIGHT,
        },
      ]}
    >
      <TouchableOpacity
        style={{
          // position: "absolute",
          top: 5,
          right: WIDTH / 2 - 55,
          padding: 20,
          zIndex: 1,
        }}
        onPress={() => props.setIsModalVisible(false)}
      >
        <Text
          style={{
            fontSize: 19,
          }}
        >
          Go back
        </Text>
      </TouchableOpacity>
      <Text style={styles.headlineText}>Find yourself in the list</Text>
      <Text>
        Dont see yourself, even if you scroll? Make sure you are created as an
        employee in e-conomic, then close the app completely and try again.
      </Text>

      <ScrollView>{employeeOptions}</ScrollView>
    </SafeAreaView>
  );
};

export { ModalEmployeePicker };
