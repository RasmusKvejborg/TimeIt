import { da } from "date-fns/locale";
import { StyleSheet, Dimensions } from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const lightblue = "#DBE2EF";
const darkblue = "#112D4E";

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
    backgroundColor: lightblue,
    borderRadius: 15,
    overflow: "hidden",
    width: WIDTH - 20,
    alignSelf: "center",
  },

  driveItemStyle: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: lightblue,
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
    backgroundColor: lightblue,
    borderRadius: 15,
    overflow: "hidden",
    color: darkblue,
  },
  breakInput: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    textAlign: "center",
    // width: 300,
    // marginRight: 5,
    fontSize: 23,
    // marginBottom: 20,
    backgroundColor: lightblue,
    borderRadius: 10,
    overflow: "hidden",
    color: darkblue,
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
    textAlign: "center",
    width: 300,
    fontSize: 24,
    // marginBottom: 10,
    backgroundColor: lightblue,
    borderRadius: 15,
    overflow: "hidden",
    color: darkblue,
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
    backgroundColor: darkblue,
    color: "#F9F7F7",
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
    backgroundColor: darkblue,
    color: "#F9F7F7", //almost white
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
    backgroundColor: darkblue,
    color: "#F9F7F7",
  },
  buttonAddActivityOrProject: {
    fontSize: 22,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: darkblue,
    paddingHorizontal: 7,
    marginHorizontal: 5,
    textAlign: "center",
    backgroundColor: "#F9F7F7",
    color: darkblue,
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
    borderColor: darkblue,
    backgroundColor: "#F9F7F7",
    color: darkblue,
  },
  modal: {
    backgroundColor: "#F9F7F7",
    borderRadius: 10,
    overflow: "hidden",
  },
  optionOutsideArray: {
    alignItems: "center",
  },
  timePickerTextInside: {
    textAlign: "center",
    paddingVertical: 12,
    width: WIDTH / 4 - 20,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    color: darkblue,
    backgroundColor: lightblue,
    // backgroundColor: "blue",
  },
  ActivityAndProjectPickerTextInside: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    color: darkblue, // dark blue
    backgroundColor: lightblue, // light blue
  },
  snackBar: {
    bottom: 110,
  },
  headlineText: {
    fontSize: 22,
    marginBottom: 20,
    alignSelf: "center",
    // color: "#112D4E",
  },
  totalHoursText: {
    fontSize: 22,
    marginTop: 25,
    marginBottom: 5,
    marginLeft: 30,
    // color: "#112D4E",
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
    backgroundColor: darkblue,
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
    color: darkblue,
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
