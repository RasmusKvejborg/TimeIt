import { da } from "date-fns/locale";
import { StyleSheet, Dimensions } from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const lightBlue = "#DBE2EF";
const darkBlue = "#112D4E";
const almostWhite = "#F9F7F7";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    top: 50,
  },
  sendHoursContainer: {
    flex: 1,
    paddingTop: 40,
  },
  driveContainer: {
    flex: 1,
    alignItems: "center",
  },
  itemStyle: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: lightBlue,
    borderRadius: 15,
    overflow: "hidden",
    width: WIDTH - 20,
    alignSelf: "center",
  },
  itemStyleOldData: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: "#E5E5E5", // light grey
    borderRadius: 15,
    overflow: "hidden",
    width: WIDTH - 20,
    alignSelf: "center",
  },

  driveItemStyle: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: lightBlue,
    borderRadius: 15,
    overflow: "hidden",
    width: WIDTH - 20,
    alignSelf: "center",
  },

  itemStyleLargeText: {
    fontSize: 24,
  },
  itemStyleSmallText: {
    fontSize: 20,
  },
  oldRegistrations: {
    fontSize: 22,
    color: "grey",
    alignSelf: "center",
  },
  itemStyleLargeTextOldData: {
    fontSize: 24,
    color: "grey",
  },
  itemStyleSmallTextOldData: {
    fontSize: 20,
    color: "grey",
  },

  trashCan: {
    position: "absolute",
    left: WIDTH - 70,
    top: 20,
  },
  input: {
    padding: 8,
    textAlign: "center",
    width: 300,
    fontSize: 24,
    marginBottom: 20,
    backgroundColor: lightBlue,
    borderRadius: 15,
    overflow: "hidden",
    color: darkBlue,
  },
  breakInput: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    textAlign: "center",
    // width: 300,
    // marginRight: 5,
    fontSize: 23,
    // marginBottom: 20,
    backgroundColor: lightBlue,
    borderRadius: 10,
    overflow: "hidden",
    color: darkBlue,
  },
  inBetweenHoursText: {
    fontSize: 24,
    alignSelf: "center",
    margin: 10,
    // marginTop: -20,
    // marginBottom: 5,
  },
  noteInput: {
    padding: 8,
    textAlign: "left",
    width: 300,
    fontSize: 24,
    // marginBottom: 10,
    backgroundColor: lightBlue,
    borderRadius: 15,
    overflow: "hidden",
    color: darkBlue,
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    fontSize: 24,
    borderRadius: 15,
    overflow: "hidden",
    padding: 8,
    width: 300,
    textAlign: "center",
    backgroundColor: darkBlue,
    color: almostWhite,
  },
  driveButton: {
    // marginTop: 5,
    fontSize: 20,
    borderRadius: 4,
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 2,
    // width: 80,
    textAlign: "center",
    alignSelf: "center",
    backgroundColor: darkBlue,
    color: almostWhite,
  },

  buttonSendHours: {
    width: WIDTH - 20,
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 4,
    fontSize: 24,
    borderRadius: 15,
    overflow: "hidden",
    paddingVertical: 8,
    backgroundColor: darkBlue,
    color: almostWhite,
  },
  buttonAddActivityOrProject: {
    fontSize: 22,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: darkBlue,
    paddingHorizontal: 7,
    marginHorizontal: 5,
    textAlign: "center",
    backgroundColor: almostWhite,
    color: darkBlue,
  },
  buttonConnectToEconomic: {
    width: WIDTH - 20,
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 4,
    fontSize: 24,
    borderRadius: 15,
    overflow: "hidden",
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: darkBlue,
    backgroundColor: almostWhite,
    color: darkBlue,
  },
  modal: {
    backgroundColor: almostWhite,
    borderRadius: 10,
    overflow: "hidden",
  },
  optionOutsideArray: {
    alignItems: "center",
  },
  timePickerTextInside: {
    textAlign: "center",
    paddingVertical: 12,
    width: WIDTH / 4 - 12,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    color: darkBlue,
    backgroundColor: lightBlue,
  },
  ActivityAndProjectPickerTextInside: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    color: darkBlue, // dark blue
    backgroundColor: lightBlue, // light blue
  },
  snackBar: {
    bottom: 110,
  },
  headlineText: {
    fontSize: 22,
    marginBottom: 5,
    alignSelf: "center",
  },
  line: {
    marginBottom: 10,
    height: 1,
    backgroundColor: darkBlue,
    width: 300,
    alignSelf: "center",
  },

  totalHoursText: {
    fontSize: 22,
    marginTop: 25,
    marginBottom: 20,
    alignSelf: "center", // color: "#112D4E",
  },
  totalOldHoursText: {
    color: "grey",
    fontSize: 22,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "center", // color: "#112D4E",
  },

  map: {
    width: "100%",
    height: "100%",
  },
  driveScreenSearchContainer: {
    position: "absolute",
    width: "90%",
    top: 40,

    // backgroundColor: "#112D4E", // det er vist shadowen som er background...
    // shadowColor: "black",
    // shadowOffset: { width: 2, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 4,
    // elevation: 4,
    padding: 8,
  },
  driveScreenSearchInput: {},
  driveScreenDistanceInput: {
    padding: 8,
    // textAlign: "center",
    // width: 300,
    // fontSize: 24,
    marginBottom: 5,
    backgroundColor: "white",
    borderRadius: 4,
    overflow: "hidden",
    // color: "#112D4E",
  },
  shareButton: {
    backgroundColor: darkBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 60,
  },
  shareButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  topRightIcon: {
    position: "absolute",
    // top: 5,
    right: 20,
    color: darkBlue,
    // marginRight: 10,
  },

  flexTime: {
    fontSize: 40,
    fontWeight: "bold",
  },
  positive: {
    color: "green",
  },
  negative: {
    color: "red",
  },
});
