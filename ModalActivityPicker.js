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

const ModalActivityPicker = (props) => {
  const { isVisible, activities, itemKeyForAddingLater } = props;

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    props.setActivityData(option, itemKeyForAddingLater);
  };

  // ----------------------------------

  const activityOptions = activities.map((activity) => {
    return (
      <TouchableOpacity
        key={activity.number}
        onPress={() => {
          onPressItem(activity); // this gets sent to props
        }}
      >
        <Text style={styles.timePickerTextInside}>{activity.name}</Text>
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
      <Text style={styles.headlineText}>Select activity</Text>

      <ScrollView>{activityOptions}</ScrollView>
    </SafeAreaView>
  );
};

export { ModalActivityPicker as ModalActivityPicker };
