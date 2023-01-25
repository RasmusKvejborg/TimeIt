import * as React from "react";
import { View, Text } from "react-native";
import { styles } from "../../GlobalStyles.js";

export default function DriveScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text onPress={() => navigation.navigate("Home")}>
        This is the DriveScreen!
      </Text>
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}
