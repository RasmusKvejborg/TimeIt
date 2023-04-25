import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const ModalActivityPicker = (props) => {
  const { isVisible, activities, itemKeyForAddingLater } = props;

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    if (option) {
      props.setActivityData(option, itemKeyForAddingLater);
    }
  };

  const flexActivities = [];

  // ----------------------------------

  const activityOptions = activities.map((activity) => {
    return (
      <TouchableOpacity
        key={activity.number}
        onPress={() => {
          console.log(activity);
          onPressItem(activity); // this gets sent to props
        }}
      >
        <Text style={styles.ActivityAndProjectPickerTextInside}>
          {activity.name}
        </Text>
      </TouchableOpacity>
    );
  });

  // const flexOptions = activities.map((activity) => {
  //   return (
  //     <TouchableOpacity
  //       key={activity.number}
  //       onPress={() => {
  //         onPressItem(activity); // this gets sent to props
  //       }}
  //     >
  //       <Text style={styles.ActivityAndProjectPickerTextInside}>
  //         {activity.name}
  //       </Text>
  //     </TouchableOpacity>
  //   );
  // });

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
          top: 5,
          right: WIDTH / 2 - 55,
          padding: 20,
          // zIndex: 1,
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

      <Text style={styles.headlineText}>Select activity</Text>

      <ScrollView>
        {activityOptions}
        {/* ----------- flex --------------*/}
        <TouchableOpacity
          onPress={() => {
            // onPressItem(activity); // this gets sent to prop
            console.log("hej");
          }}
        >
          <Text
            style={[
              styles.ActivityAndProjectPickerTextInside,
              { backgroundColor: "#BCC8DB" },
            ]}
          >
            Hejmeddig
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export { ModalActivityPicker as ModalActivityPicker };
