import { StyleSheet, Dimensions } from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

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
  itemStyle: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: "#DBE2EF",
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
    backgroundColor: "#DBE2EF",
    borderRadius: 15,
    overflow: "hidden",
    color: "#112D4E",
  },
  button: {
    marginTop: 20,
    fontSize: 24,
    borderRadius: 15,
    overflow: "hidden",
    padding: 8,
    width: 300,
    textAlign: "center",
    backgroundColor: "#112D4E",
    color: "#F9F7F7",
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
    backgroundColor: "#112D4E",
    color: "#F9F7F7",
  },
  buttonAddActivityOrProject: {
    fontSize: 22,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#112D4E",
    paddingHorizontal: 7,
    marginHorizontal: 5,
    textAlign: "center",
    backgroundColor: "#F9F7F7",
    color: "#112D4E",
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
    borderColor: "#112D4E",
    backgroundColor: "#F9F7F7",
    color: "#112D4E",
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
    color: "#112D4E",
    backgroundColor: "#DBE2EF",
  },
  ActivityAndProjectPickerTextInside: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    color: "#112D4E",
    backgroundColor: "#DBE2EF",
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
});
