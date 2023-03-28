import * as React from "react";
import { View, Dimensions, TextInput } from "react-native";
import { styles } from "../../GlobalStyles.js";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { googleAPIKey } from "../../Z_Environments.ts";
import MapViewDirections from "react-native-maps-directions";

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
  const [destination, setDestination] = React.useState();
  const [chooseDistance, setchooseDistance] = React.useState(0);

  const mapRef = React.useRef();

  const moveTo = async (position) => {
    const camera = await mapRef.current.getCamera();
    if (camera) {
      console.log("yallow");
      camera.center = position;
      mapRef.current.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePaddingValue = 50;
  const edgePadding = {
    top: 200,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const zoomTwoPositions = () => {
    console.log("testers");
    mapRef.current.fitToCoordinates([origin, destination], { edgePadding });
  };

  const onPlaceSelected = (details, flag) => {
    console.log("vi flager: ", flag);
    // console.log("detaljer: ",details);
    const set = flag === "origin" ? setOrigin : setDestination;
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
      setchooseDistance(Math.ceil(args.distance));
    }
  };

  React.useEffect(() => {
    if (origin && destination) {
      zoomTwoPositions();
    }
  }, [origin, destination]);

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
          onPress={async (data, details = null) => {
            onPlaceSelected(details, "destination");
          }}
          query={{
            key: googleAPIKey,
            language: "en",
          }}
        />
        {/*------- distance inputfield -------*/}
        <TextInput placeholder="Distance" style={styles.input}>
          Distance: {chooseDistance} km
        </TextInput>
      </View>
    </View>
  );
}
