import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

const ModalProjectPicker = (props) => {
  const deleteList = async () => {
    try {
      console.log("mostUsedProjects deleted from asyncstorage");
      await AsyncStorage.removeItem("@mostUsedProjects");
    } catch (err) {
      console.log("error in deletion: ", err);
    }
  };
  const { isVisible, projects, itemKeyForAddingLater, projectFlag } = props;
  const [mostUsedProjects, setMostUsedProjects] = React.useState([]);

  const onPressItem = (option) => {
    props.setIsModalVisible(false);
    if (option) {
      props.setProjectData(option, itemKeyForAddingLater, projectFlag);
    }
  };

  // ----------------------------------
  const saveToMostUsedProjects = async (project) => {
    try {
      // Get the existing most used projects from AsyncStorage
      const storedProjects = await AsyncStorage.getItem("@mostUsedProjects");
      let updatedProjects = [];

      if (storedProjects) {
        // Parse the storedProjects JSON string
        const parsedProjects = JSON.parse(storedProjects);

        // Add the selected project at the beginning
        updatedProjects = [project, ...parsedProjects];

        // Remove any duplicate projects
        updatedProjects = updatedProjects.filter(
          (project, index, self) =>
            self.findIndex((p) => p.number === project.number) === index
        );

        // Keep only the top 5 most used projects
        updatedProjects = updatedProjects.slice(0, 5);
      } else {
        updatedProjects = [project];
      }

      // Save the updated most used projects to AsyncStorage
      await AsyncStorage.setItem(
        "@mostUsedProjects",
        JSON.stringify(updatedProjects)
      );

      // Update the state variable
      setMostUsedProjects(updatedProjects);
    } catch (error) {
      console.log("Error saving most used projects:", error);
    }
  };

  // ------------------- use effects-----------------------------

  React.useEffect(() => {
    const fetchMostUsedProjects = async () => {
      try {
        const storedProjects = await AsyncStorage.getItem("@mostUsedProjects");

        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          setMostUsedProjects(parsedProjects);
        }
      } catch (error) {
        console.log("Error fetching most used projects:", error);
      }
    };

    fetchMostUsedProjects();
  }, []);

  //  -----------------------------------

  const projectOptions = projects.map((project) => {
    return (
      <TouchableOpacity
        key={project.number}
        onPress={() => {
          saveToMostUsedProjects(project);
          onPressItem(project);
        }}
      >
        <Text style={styles.ActivityAndProjectPickerTextInside}>
          {project.number}
          {". "}
          {project.name}
        </Text>
      </TouchableOpacity>
    );
  });

  // ----------------------------------/////-------------------------

  const mostUsedProjectsOptions = mostUsedProjects.map((project) => {
    if (projects.some((p) => p.number === project.number)) {
      // if the project exists in allprojects, then show it in latest projects

      return (
        <TouchableOpacity
          key={project.number}
          onPress={() => {
            saveToMostUsedProjects(project);
            onPressItem(project);
          }}
        >
          <Text style={styles.ActivityAndProjectPickerTextInside}>
            {project.number}
            {". "}
            {project.name}
          </Text>
        </TouchableOpacity>
      );
    }
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
        onPress={() => {
          props.setIsModalVisible(false);
          // deleteList();
        }}
      >
        <Text
          style={{
            fontSize: 19,
          }}
        >
          Go back
        </Text>
      </TouchableOpacity>

      {/* <Text style={styles.headlineText}>Select project</Text> */}

      <ScrollView>
        {mostUsedProjects.length > 0 && (
          <Text style={{ fontSize: 22, marginTop: 18, alignSelf: "center" }}>
            Latest projects:
          </Text>
        )}
        {mostUsedProjectsOptions}
        <Text style={{ fontSize: 22, marginTop: 18, alignSelf: "center" }}>
          All active projects:
        </Text>
        {projectOptions}
      </ScrollView>
    </SafeAreaView>
  );
};

export { ModalProjectPicker as ModalProjectPicker };
