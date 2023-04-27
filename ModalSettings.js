import React, { useEffect, useState } from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Clipboard,
} from "react-native";
import { getDataFromFirestore } from "./PostToFireBase.js";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const ModalSettings = (props) => {
  const { isVisible, xAgreementGrantToken, employeeNo } = props;
  const [flexTime, setFlextid] = useState();

  const onPressItem = () => {
    props.setIsSettingsVisible(false);
    // props.setEmployeeData(number, name);
  };

  useEffect(() => {
    const fetchFlextid = async () => {
      const flextidFromFirestore = await getDataFromFirestore(
        xAgreementGrantToken,
        employeeNo
      );
      setFlextid(flextidFromFirestore || 0);
    };

    if (xAgreementGrantToken && employeeNo) fetchFlextid();
  }, []);

  // ----------------------------------

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

      {xAgreementGrantToken && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            Clipboard.setString(
              `https://endpointfortimeitapp.herokuapp.com/?token=${xAgreementGrantToken}`
            );
            Alert.alert(
              "Share e-conomic connection",
              `1. Ask employee to download this app. \n \n2. Send this link to employee's phone (link copied to clipboard). \n \nhttps://endpointfortimeitapp.herokuapp.com/?token=${xAgreementGrantToken}`
            );
          }}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.headlineText}>Flex hours:</Text>
      <Text
        style={[
          styles.flexTime,
          flexTime >= 0 ? styles.positive : styles.negative,
        ]}
      >
        {flexTime && flexTime}
      </Text>
    </SafeAreaView>
  );
};

export { ModalSettings };
