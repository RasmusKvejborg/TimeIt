import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

const HEIGHT = Dimensions.get("window").height;

const ModalProjectPicker = (props) => {
  const { isVisible, projects, itemKeyForAddingLater } = props;

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    props.setProjectData(option, itemKeyForAddingLater);
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
        <Text style={styles.timePickerTextInside}>{project.name}</Text>
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
      <Text style={styles.headlineText}>Select project</Text>

      <ScrollView>{projectOptions}</ScrollView>
    </SafeAreaView>
  );
};

export { ModalProjectPicker as ModalProjectPicker };
