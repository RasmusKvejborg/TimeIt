import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  View,
} from "react-native";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

const ModalProjectPicker = (props) => {
  const { isVisible, projects, itemKeyForAddingLater } = props;

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    if (option) props.setProjectData(option, itemKeyForAddingLater);
  };

  // ----------------------------------

  const projectOptions = projects.map((project) => {
    return (
      <TouchableOpacity
        key={project.number}
        onPress={() => {
          onPressItem(project);
        }}
      >
        <Text style={styles.ActivityAndProjectPickerTextInside}>
          {project.name}
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
          top: 20,
          right: WIDTH / 2 - 65,
          // padding: 20,
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

      <Text style={styles.headlineText}>Select project</Text>

      <ScrollView>{projectOptions}</ScrollView>
    </SafeAreaView>
  );
};

export { ModalProjectPicker as ModalProjectPicker };
