import * as React from "react";
import {
  View,
  Dimensions,
  TextInput,
  Text,
  Switch,
  TouchableOpacity,
  Keyboard,
  Alert,
  Modal,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { googleAPIKey } from "../../Z_Environments.ts";
import MapViewDirections from "react-native-maps-directions";
import { ModalProjectPicker } from "../../ModalProjectPicker.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const aspectRatio = width / height;
const latitudeDelta = 4.2; // zoomed out
const longitudeDelta = latitudeDelta * aspectRatio;
const initialPosition = {
  latitude: 56.7, // middle of Denmark
  longitude: 10.5039,
  latitudeDelta: latitudeDelta,
  longitudeDelta: longitudeDelta,
};

export default function DriveScreen({ navigation }) {
  const [origin, setOrigin] = React.useState();
  const [originAddress, setOriginAddress] = React.useState();
  const [destination, setDestination] = React.useState();
  const [destinationAddress, setDestinationAddress] = React.useState();

  const [chooseDistance, setChooseDistance] = React.useState(0);
  const [swittchIsEnabled, setSwittchIsEnabled] = React.useState(false);
  // const [noteText, setNoteText] = React.useState();
  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  // ------------------------ project picker modal -----------------
  const [projectArray, setProjectArray] = React.useState([]);
  const [projectNumber, SetProjectNumber] = React.useState();
  const [isProjectModalVisible, setIsProjectModalVisible] =
    React.useState(false);
  const [projectText, setProjectText] = React.useState();
  // --------------------------date picker modal--------------------
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [dateText, setDateText] = React.useState();

  const mapRef = React.useRef();

  const placesRef = React.useRef();

  const moveTo = async (position) => {
    const camera = await mapRef.current.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePaddingValue = 15;
  const edgePadding = {
    top: 285,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const zoomTwoPositions = () => {
    mapRef.current.fitToCoordinates([origin, destination], { edgePadding });
  };

  const onPlaceSelected = (details, flag) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const setAdd = flag === "origin" ? setOriginAddress : setDestinationAddress;

    let address = placesRef.current?.getAddressText();

    console.log("SATME JA", "flag: ", flag, address);

    setAdd(address);

    const position = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
    if (!origin && !destination) {
      // only move if its not using zoomTwoPositions. Same if I want to make a zoom here.
      moveTo(position);
    }
    set(position);
  };

  const calcDistanceOnReady = (args) => {
    if (args) {
      setChooseDistance(Math.ceil(args.distance));
    }
  };

  const toggleSwitch = () => {
    setSwittchIsEnabled((previousState) => !previousState);
    if (swittchIsEnabled) {
      console.log("button turned off");
    } else {
      console.log("button turned on");
    }
  };

  //  --------------------get projects ------------------------------

  const getProjects = () => {
    return axios
      .get("https://apis.e-conomic.com/api/v16.3.0/projects/all", config)
      .then((result) => {
        const projectNamesAndNumbers = result.data.items.map((project) => ({
          name: project.name,
          number: project.number,
        }));

        return projectNamesAndNumbers;
      });
  };

  // ------------------- get projects and show modal -----------------------------------------

  const showProjectsModal = async () => {
    await getProjects()
      .then((projects) => {
        setProjectArray(projects);
        setIsProjectModalVisible(true);
      })
      .catch((e) => {
        console.log("err:", e);
        const { status, data, config } = e.response;

        if (status === 401) {
          Alert.alert("401 error");
        } else {
          Alert.alert(
            "Something went wrong. Try again later or contact support"
          );
        }
      });
  };

  // ------------------API for getting project----------------------------------

  const config = {
    headers: {
      "X-AppSecretToken": "vf0W9meQJEx3uK7mzjYEZhEbfTYWnSswmMzTIDeLWNI1",
      "X-AgreementGrantToken": xAgreementGrantToken,
      "Content-Type": "application/json",
    },
  };

  // ---------- function -------------
  function getDateText(date) {
    const months = [
      "Jan.",
      "Feb.",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    let monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName}`;
  }

  const saveLastProject = async (project) => {
    if (project) {
      SetProjectNumber(project.number);
      await AsyncStorage.setItem("@lastProject", JSON.stringify(project));
    }
  };

  const saveFunction = async (registration) => {
    let registrationRoundTrip;

    if (swittchIsEnabled) {
      registrationRoundTrip = {
        dateTime: registration.dateTime,
        distance: registration.distance,
        projectNumber: registration.projectNumber,
        projectName: registration.projectName,
        origin: registration.destination,
        destination: registration.origin,
      };
    }

    try {
      let prevItems = await AsyncStorage.getItem("@driveRegistration");
      let newItems = [];

      if (prevItems !== null) {
        newItems = JSON.parse(prevItems);
        newItems.push(registration);
      } else {
        newItems = [registration];
      }

      if (registrationRoundTrip) {
        console.log("it is enabled");
        newItems.push(registrationRoundTrip);
      }

      newItems.sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1)); // sorts the list datewise

      const value = await AsyncStorage.setItem(
        "@driveRegistration",
        JSON.stringify(newItems)
      );
      // onToggleSnackBar()
    } catch (error) {
      Alert.alert("Something went wrong", "error code 428");
      console.log("eRrOr MsG: ", error);
    }
  };

  const changeDistanceHandler = (val) => {
    setChooseDistance(val);
  };

  //  --------------- USE EFFECTS ----------------------
  React.useEffect(() => {
    if (origin && destination) {
      zoomTwoPositions();
    }
  }, [origin, destination]);

  React.useEffect(() => {
    const setXAppSecretTokenImmediately = async () => {
      if (!xAgreementGrantToken)
        setXAgreementGrantToken(await AsyncStorage.getItem("@xAppSecretToken"));
    };

    const setSavedProjectImmediately = async () => {
      const lastProject = JSON.parse(
        await AsyncStorage.getItem("@lastProject")
      );
      if (lastProject) {
        SetProjectNumber(lastProject.number);

        if (lastProject.name.length > 26) {
          setProjectText(lastProject.name.substring(0, 26));
        } else setProjectText(lastProject.name);
      }
    };

    let listener = navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
      setDateText(getDateText(selectedDate));
      setSavedProjectImmediately();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  return (
    <View style={styles.driveContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialPosition}
      >
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={googleAPIKey}
            strokeColor="#112D4E"
            strokeWidth={4}
            onReady={calcDistanceOnReady}
          />
        )}
      </MapView>

      <View style={styles.driveScreenSearchContainer}>
        {/*------- origin inputfield -------*/}
        <GooglePlacesAutocomplete
          styles={{ textInput: styles.driveScreenSearchInput }}
          placeholder="From"
          fetchDetails
          ref={placesRef}
          onPress={(data, details = null) => {
            onPlaceSelected(details, "origin");
          }}
          query={{
            key: googleAPIKey,
            language: "en",
          }}
        />
        {/*------- destination inputfield -------*/}
        <GooglePlacesAutocomplete
          styles={{ textInput: styles.driveScreenSearchInput }}
          placeholder="Destination"
          fetchDetails
          ref={placesRef}
          onPress={async (data, details = null) => {
            onPlaceSelected(details, "destination");
          }}
          query={{
            key: googleAPIKey,
            language: "en",
          }}
        />
        {/*------- distance inputfield -------*/}
        <View
          style={[
            styles.driveScreenDistanceInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Text>Distance (km): </Text>
          <TextInput
            style={{ width: 80, fontSize: 16 }}
            defaultValue={String(chooseDistance)}
            onChangeText={(text) => changeDistanceHandler(text)}
            keyboardType={"numeric"}
          />
          <Text>Both ways:</Text>
          <Switch
            style={{ marginVertical: -8 }}
            onValueChange={toggleSwitch}
            value={swittchIsEnabled}
          ></Switch>
        </View>
        {/*------- Project and Date inputfields -------*/}
        <View
          style={[
            styles.driveScreenDistanceInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Text>Project: </Text>

          <TouchableOpacity
            onPress={() => {
              xAgreementGrantToken
                ? showProjectsModal()
                : Alert.alert(
                    "Connect to economic before selecting a project",
                    "You can do that in 'check & send'"
                  );
            }}
          >
            <View pointerEvents="none">
              <TextInput
                style={{ width: 150 }}
                placeholder="Select project"
                defaultValue={projectText}
              ></TextInput>
            </View>
          </TouchableOpacity>
          <Text>Date: </Text>
          <TouchableOpacity
            onPress={() => {
              setShow(true);
            }}
          >
            <View pointerEvents="none">
              <TextInput style={{ width: 100 }} defaultValue={dateText} />
            </View>
          </TouchableOpacity>
        </View>

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode={"date"}
            is24Hour={true}
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selectedDate) => {
              setShow(false);
              const chosenDate = selectedDate;
              setSelectedDate(chosenDate);
              let tempDate = new Date(chosenDate);

              setDateText(getDateText(tempDate));
            }}
          />
        )}

        {/* ----------- save button ---------- */}

        <TouchableOpacity // submit button
          onPress={() => {
            Keyboard.dismiss();

            var registration = {
              dateTime: JSON.stringify(selectedDate),
              distance: chooseDistance,
              projectNumber: projectNumber,
              projectName: projectText,
              origin: originAddress,
              destination: destinationAddress,
            };

            // deleteList();
            if (origin === undefined) {
              Alert.alert("Please fill out the 'From' field");
            } else if (destination === undefined) {
              Alert.alert("Please thy a destination");
            } else if (chooseDistance <= 0) {
              Alert.alert("Km cannot be less than one");
            } else {
              saveFunction(registration);
            }
          }}
        >
          <View>
            <Text style={styles.driveButton}>Save</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="fade"
        visible={isProjectModalVisible}
        onRequestClose={() => setIsProjectModalVisible(false)}
      >
        <ModalProjectPicker
          projects={projectArray}
          // isVisible={isActModalVisible}
          setIsModalVisible={setIsProjectModalVisible}
          setProjectData={(project) => {
            saveLastProject(project);
            setProjectText(project.name);
            SetProjectNumber(project.number);
          }}
        ></ModalProjectPicker>
      </Modal>
    </View>
  );
}
