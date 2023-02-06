import * as React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

//screens
import HomeScreen from "./screens/HomeScreen.js";
import DriveScreen from "./screens/DriveScreen.js";
import SendHoursScreen from "./screens/SendHoursScreen.js";
import { setStatusBarBackgroundColor } from "expo-status-bar";

//screen names
const homeScreenName = "Work";
const driveScreenName = "Drive";
const SendHoursScreenName = "Check & Send";

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={homeScreenName}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#3F72AF",
          tabBarLabelStyle: { paddingBottom: 2, fontSize: 16 },
          tabBarStyle: { height: 70 },

          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let routeName = route.name;

            if (routeName === homeScreenName) {
              iconName = "stopwatch"; // I could have said   iconname = focused ? "home" : "home-outline"  but it seems to work just with this somehow.
            }

            if (routeName === driveScreenName) {
              iconName = "car";
            }

            if (routeName === SendHoursScreenName) {
              iconName = "list";
            }

            return (
              <Ionicons name={iconName} size={32} color={color}></Ionicons>
            );
          },
        })}
      >
        <Tab.Screen name={homeScreenName} component={HomeScreen} />
        <Tab.Screen name={driveScreenName} component={DriveScreen} />
        <Tab.Screen name={SendHoursScreenName} component={SendHoursScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
