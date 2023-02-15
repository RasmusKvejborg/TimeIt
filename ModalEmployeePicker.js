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

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    props.setEmployeeData(option);
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
                  onPressItem(empl.number);
                },
              },
            ]
          );

          // onPressItem(empl.number)
        }}
      >
        <Text style={styles.timePickerTextInside}>{empl.name}</Text>
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
      <Text style={styles.registerHoursText}>Find yourself in the list</Text>
      <Text>
        Dont see yourself, even if you scroll? Make sure you are created as an
        employee in e-conomic, then close the app completely and try again.
      </Text>

      <ScrollView>
        {/* <TouchableOpacity onPress={() => props.changeModalVisibility(false)}> */}
        {employeeOptions}
        {/* </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export { ModalEmployeePicker };
