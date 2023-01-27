import * as React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../../GlobalStyles.js";
import axios from "axios";

export default function DriveScreen({ navigation }) {
  let [isLoading, setIsLoading] = React.useState(true);
  let [response, setResponse] = React.useState();

  const config = {
    headers: {
      "X-AgreementGrantToken": "Xb7Jrvqj6dpbPKn0GTLGYbuU6P9D4fHi3OvfHIkEgfs1",
      "X-AppSecretToken": "gGl2gV5qcBMGB71S2xM60ozdiNPDnEdMXdk6z4jmTF01",
      "Content-Type": "application/json",
    },
  };

  const getContent = () => {
    fetch("https://restapi.e-conomic.com/customers", {
      headers: {
        "X-AgreementGrantToken": "Xb7Jrvqj6dpbPKn0GTLGYbuU6P9D4fHi3OvfHIkEgfs1",
        "X-AppSecretToken": "gGl2gV5qcBMGB71S2xM60ozdiNPDnEdMXdk6z4jmTF01",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setResponse(result);
      });

    response !== undefined &&
      response.collection.map((value) => console.log(value.name));
  };

  // -------------------------------------------- POST ----------------------------------------------------------------

  const postContent = () => {
    axios
      .post(
        "https://restapi.e-conomic.com/customers",
        {
          currency: "DKK",
          customerGroup: {
            customerGroupNumber: 1,
            self: "https://restapi.e-conomic.com/vat-zones/1?demo",
          },
          vatZone: {
            vatZoneNumber: 1,
            self: "https://restapi.e-conomic.com/vat-zones/1?demo",
          },
          name: "TESTER",
          paymentTerms: {
            paymentTermsNumber: 1,
            self: "https://restapi.e-conomic.com/vat-zones/1?demo",
          },
        },
        config
      )

      // Gammel måde at gøre det på: (den nye er Axios)

      // fetch("https://restapi.e-conomic.com/customers", {
      //   body: JSON.stringify({
      //     currency: "DKK",
      //     customerGroup: {
      //       customerGroupNumber: 1,
      //       self: "https://restapi.e-conomic.com/vat-zones/1?demo",
      //     },
      //     vatZone: {
      //       vatZoneNumber: 1,
      //       self: "https://restapi.e-conomic.com/vat-zones/1?demo",
      //     },
      //     name: "Rasmus",
      //     paymentTerms: {
      //       paymentTermsNumber: 1,
      //       self: "https://restapi.e-conomic.com/vat-zones/1?demo",
      //     },
      //   }),

      //   method: "POST",

      //   headers: {
      //     "X-AgreementGrantToken": "Xb7Jrvqj6dpbPKn0GTLGYbuU6P9D4fHi3OvfHIkEgfs1",
      //     "X-AppSecretToken": "gGl2gV5qcBMGB71S2xM60ozdiNPDnEdMXdk6z4jmTF01",
      //     "Content-Type": "application/json",
      //   },
      // })
      // .then((res) => res.json())

      .then((result) => {
        setResponse(result);
      })
      .catch((e) => console.log(e));

    console.log("hdjfskgsg");
    // console.log(response);
    // return <Text>Test af BITCOIN IN USD: {response["bpi"]["USD"].rate} </Text>;
  };

  // navigation.navigate("Home")  kan stå inde i onPress
  return (
    <View style={styles.container}>
      <Text style={styles.button} onPress={() => postContent()}>
        PostConent!
      </Text>
      <Text style={styles.button} onPress={() => getContent()}>
        getContent!
      </Text>
      {response !== undefined &&
        response.collection.map((value, key) => (
          <Text key={key}>{value.name}</Text>
        ))}
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}
