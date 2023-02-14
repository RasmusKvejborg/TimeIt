import * as React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../../GlobalStyles.js";
import axios from "axios";

export default function DriveScreen({ navigation }) {
  let [isLoading, setIsLoading] = React.useState(true);
  let [response, setResponse] = React.useState();

  const config = {
    headers: {
      "X-AgreementGrantToken": "QsQJc5VzgFoxJKlaoY4qiEuQ7rL60MQimZhJuCgDUaM1",
      "X-AppSecretToken": "gGl2gV5qcBMGB71S2xM60ozdiNPDnEdMXdk6z4jmTF01",
      "Content-Type": "application/json",
    },
  };

  // Version 2 kunne være fedt hvis man også kunne registrerer
  // kørsel på projekt baseret på to adresser. Her ville nogle
  // foretrukne adresser være fint at få listet.
  // Altså firmaadrsse, hjemmeadresse og kundesdresse.

  const getContent = () => {
    fetch("https://restapi.e-conomic.com/customers", {
      headers: {
        "X-AgreementGrantToken": "QsQJc5VzgFoxJKlaoY4qiEuQ7rL60MQimZhJuCgDUaM1",
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
      .then((result) => {
        setResponse(result);
      })
      .catch((e) => console.log(e));

    console.log("hdjfskgsg");
  };

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

  // -------------------------------- post timeentry ---------------------------------------------
  const postTimeEntry = (note) => {
    axios
      .post(
        "https://apis.e-conomic.com/api/v16.2.2/timeentries",
        {
          activityNumber: 1,
          date: "2023-02-02T15:23:01Z",
          employeeNumber: 1,
          projectNumber: 1,
          numberOfHours: 7,
          text: { note }, // KAN SGU NOK OS LÆRE AT LAVE DET HER TIL AT VÆRE NOTEN...
        },
        config
      )
      .then((result) => {
        setResponse(result);
      })
      .catch((e) => console.log(e));

    console.log("hdjfskgsg");
  };

  // navigation.navigate("Home")  kan stå inde i onPress
  return (
    <View style={styles.container}>
      <Text
        style={styles.button}
        onPress={() => postTimeEntry("nu er det her noten")}
      >
        PostConent!
      </Text>
      <Text style={styles.button} onPress={() => getContent()}>
        getContent!
      </Text>
      {/* {response !== undefined &&   // this is for getting...
        response.collection.map((value, key) => (
          <Text key={key}>{value.name}</Text>
        ))} */}
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}
