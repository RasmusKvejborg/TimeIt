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
  Platform,
} from "react-native";
import { styles } from "../../GlobalStyles.js";
import MapView, { Marker, Polyline } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { googleAPIKey, mapKitAPIKey } from "../../Z_Environments.ts";
import MapViewDirections from "react-native-maps-directions";

import { ModalProjectPicker } from "../../ModalProjectPicker.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Snackbar } from "react-native-paper";

import polyline from "@mapbox/polyline";

const { width, height } = Dimensions.get("window");
const aspectRatio = width / height;
const latitudeDelta = 4.2; // zoomed out
const longitudeDelta = latitudeDelta * aspectRatio;
const middleOfDenmark = {
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

  const [routes, setRoutes] = React.useState([]);
  const [selectedRoute, setSelectedRoute] = React.useState(0);

  const [chooseDistance, setChooseDistance] = React.useState(0);
  const [switchIsEnabled, setSwittchIsEnabled] = React.useState(false);
  // const [noteText, setNoteText] = React.useState();
  const [xAgreementGrantToken, setXAgreementGrantToken] = React.useState();
  // -------------------- consts for snackBar -------------------------------
  const [snackBarVisible, setSnackBarVisible] = React.useState(false);

  const onToggleSnackBar = () => setSnackBarVisible(!snackBarVisible);

  const onDismissSnackBar = () => setSnackBarVisible(false);

  // ------------------------ project picker modal -----------------
  const [projectArray, setProjectArray] = React.useState([]);
  const [projectNumber, SetProjectNumber] = React.useState();
  const [isProjectModalVisible, setIsProjectModalVisible] =
    React.useState(false);
  const [projectText, setProjectText] = React.useState();
  // --------------------------date picker modal--------------------
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [dateText, setDateText] = React.useState(getDateText(new Date()));

  const mapRef = React.useRef();

  const placesRef = React.useRef();

  const moveTo = async (position) => {
    const camera = await mapRef.current.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePaddingValue = 10;
  const edgePadding = {
    top: 260,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const zoomTwoPositions = () => {
    mapRef.current.fitToCoordinates([origin, destination], { edgePadding });
  };

  // ------------------------------------

  const workPlace = {
    description: "Work",
    geometry: { location: { lat: 49.8496818, lng: 3.2940881 } },
  };

  const [searchHistoryList, setSearchHistoryList] = React.useState([]);
  // -------------------------------------

  const onPlaceSelected = (data, details, flag) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const setAdd = flag === "origin" ? setOriginAddress : setDestinationAddress;

    let address; // hvis jeg kan finde en måde hvorpå den ikke bliver kaldt
    if (placesRef.current.getAddressText()) {
      address = placesRef.current?.getAddressText();
    } else {
      address = data.description;
    }
    setAdd(address);

    // console.log("address: ", address);

    let latitude = null;
    let longitude = null;

    if (details.geometry?.location) {
      latitude = details.geometry.location.lat;
      longitude = details.geometry.location.lng;
    }

    const position = { latitude, longitude };

    // ------- this is for the searchhistory
    let newObject = {
      description: address,
      geometry: {
        location: { lat: position.latitude, lng: position.longitude },
      },
    };

    let index = searchHistoryList.findIndex((item) => {
      return item.description === newObject.description; // if not already in the list, it returns -1
    });

    let tempSearchHistoryList = searchHistoryList;

    if (index !== -1) {
      // if object already there
      // smide objectet øverst i listen.
      const objectToMove = tempSearchHistoryList[index]; // save the object to be moved
      tempSearchHistoryList.splice(index, 1); // remove the object from position i
      tempSearchHistoryList.splice(0, 0, objectToMove); // insert the object at position j
    } else {
      if (tempSearchHistoryList.length >= 5) {
        tempSearchHistoryList.pop();
      }
      tempSearchHistoryList = [newObject, ...tempSearchHistoryList];
    }

    setSearchHistoryList(tempSearchHistoryList);

    saveLastSearchHistory(tempSearchHistoryList);

    // -------------

    if (!origin && !destination) {
      // only move if its not using zoomTwoPositions. Same if I want to make a zoom here.
      moveTo(position);
    }
    set(position);
  };

  const calcDistanceOnReady = (args) => {
    if (args) {
      setChooseDistance(Math.ceil(args.distance / 1000));
    }
  };

  const toggleSwitch = () => {
    setSwittchIsEnabled((previousState) => !previousState);
    if (switchIsEnabled) {
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

  const saveLastSearchHistory = async (searchHis) => {
    if (searchHis) {
      // console.log("searchhis", searchHis);
      await AsyncStorage.setItem(
        "@lastSearchHistory",
        JSON.stringify(searchHis)
      );
    }
  };

  const saveFunction = async (registration) => {
    let registrationRoundTrip;

    if (switchIsEnabled) {
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
      requestDirections();
    }
  }, [origin, destination]);

  // React.useEffect(() => {
  //   saveLastSearchHistory(searchHistoryList);
  //   console.log("aysays");
  // }, [searchHistoryList]);

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

    const setSavedSearchHistoryListImmediately = async () => {
      const lastSearchHistory = JSON.parse(
        await AsyncStorage.getItem("@lastSearchHistory")
      );

      if (lastSearchHistory) {
        setSearchHistoryList(lastSearchHistory);
      }
    };

    let listener = navigation.addListener("focus", () => {
      setXAppSecretTokenImmediately();
      // setDateText(getDateText(selectedDate));
      // console.log("selected date is", selectedDate);
      setSavedProjectImmediately();
      setSavedSearchHistoryListImmediately();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  //----------------------------------- test ----------////////////////////////////////////////////////////////////////////////////////////////////////////////

  const requestDirections = async () => {
    console.log("requestDirections has been called");
    const originCoordinates = `${origin.latitude},${origin.longitude}`;
    const destinationCoordinates = `${destination.latitude},${destination.longitude}`;

    const directionsURL =
      "https://maps.googleapis.com/maps/api/directions/json";
    try {
      const response = await fetch(
        `${directionsURL}?origin=${originCoordinates}&destination=${destinationCoordinates}&mode=driving&alternatives=true&key=${googleAPIKey}`
      );
      const data = await response.json();

      const tempRoutes = data.routes.map((route) => {
        const distance = route.legs[0].distance.value;

        const decodedPolyline = polyline.decode(route.overview_polyline.points);
        const coordinates = decodedPolyline.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        return { distance, coordinates };
      });

      calcDistanceOnReady(tempRoutes[0]);
      setRoutes(tempRoutes);
      setSelectedRoute(0);
    } catch (error) {
      console.error("Error requesting directions:", error);
    }
  };

  // const displayRoutes = routes.map((route, index) => {
  //   return (
  //     <TouchableOpacity key={index}>
  //       <View>
  //         <Polyline
  //           coordinates={route.coordinates}
  //           strokeColor={index == selectedRoute ? "#112D4E" : "#96A0AF"}
  //           strokeWidth={5}
  //           zIndex={index == selectedRoute ? 2 : 1}
  //           tappable={true}
  //           onPress={() => {
  //             setSelectedRoute(index);
  //             calcDistanceOnReady(route);
  //           }}
  //         />
  //       </View>
  //     </TouchableOpacity>
  //   );
  // });

  ////////////////////////////////

  const displayRoutes = routes.map((route, index) => {
    console.log("tjekker at index ikke er ", selectedRoute);
    if (index !== selectedRoute) {
      return (
        <Polyline
          key={index}
          coordinates={route.coordinates}
          strokeColor="#96A0AF"
          strokeWidth={5}
          tappable={true}
          onPress={() => {
            setSelectedRoute(index);
            calcDistanceOnReady(route);
            console.log("haysan", index);
          }}
        />
      );
    }
  });

  /////////////////////////////////////////

  //////////////////////////

  return (
    <View style={styles.driveContainer}>
      <MapView ref={mapRef} style={styles.map} initialRegion={middleOfDenmark}>
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}

        {routes.length > 0 && (
          <>
            {displayRoutes}

            {routes[selectedRoute] && (
              <Polyline
                coordinates={routes[selectedRoute].coordinates}
                strokeColor="#112D4E"
                strokeWidth={5}
                zIndex={1}
              />
            )}
          </>
        )}

        {/* {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={googleAPIKey}
            strokeColor="#112D4E"
            strokeWidth={4}
            onReady={calcDistanceOnReady}
          />
        )} */}
      </MapView>

      <View style={styles.driveScreenSearchContainer}>
        {/*------- origin inputfield -------*/}
        <GooglePlacesAutocomplete
          predefinedPlaces={searchHistoryList}
          styles={{ textInput: styles.driveScreenSearchInput }}
          placeholder="From"
          fetchDetails
          GooglePlacesSearchQuery={{
            rankby: "distance",
          }}
          ref={placesRef}
          onPress={(data, details = null) => {
            onPlaceSelected(data, details, "origin");
          }}
          query={{
            key: googleAPIKey,
            language: "en",
            radius: 100000, // in meters
            location: `${middleOfDenmark.latitude},${middleOfDenmark.longitude}`,
          }}
        />
        {/*------- destination inputfield -------*/}
        <GooglePlacesAutocomplete
          predefinedPlaces={searchHistoryList}
          styles={{ textInput: styles.driveScreenSearchInput }}
          placeholder="Destination"
          fetchDetails
          GooglePlacesSearchQuery={{
            rankby: "distance",
          }}
          ref={placesRef}
          onPress={(data, details = null) => {
            onPlaceSelected(data, details, "destination");
          }}
          query={{
            key: googleAPIKey,
            language: "en",
            radius: 100000, // in meters
            location: `${middleOfDenmark.latitude},${middleOfDenmark.longitude}`,
          }}
        />
        {/*------- distance inputfield -------*/}
        <View
          style={[
            styles.driveScreenDistanceInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Text>
            {switchIsEnabled ? "Distance (km):  2x" : "Distance (km): "}
          </Text>
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
            value={switchIsEnabled}
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
            color
            backgroundColor={"#F9F7F7"}
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
          delayPressOut={5000}
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
              onToggleSnackBar();
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
      <Snackbar
        style={styles.snackBar}
        visible={snackBarVisible}
        duration={700}
        onDismiss={onDismissSnackBar}
        action={{ label: "Close" }}
      >
        Registration saved.
      </Snackbar>
    </View>
  );
}
