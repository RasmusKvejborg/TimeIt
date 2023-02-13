import { StyleSheet, Dimensions } from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    top: 50,
  },
  sendHoursContainer: {
    flex: 1,
    paddingTop: 40,
    // paddingHorizontal: 20,
    // width: WIDTH - 20,
    // justifyContent: "center",
    // alignItems: "center",
  },
  itemStyle: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: "#DBE2EF",
    borderRadius: 15,
    width: WIDTH - 20,
    alignSelf: "center",

    // fontSize: 24,
    // width: WIDTH - 20,
  },
  itemStyleLargeText: {
    // marginTop: 24,
    // padding: 30,
    fontSize: 24,
  },
  itemStyleSmallText: {
    fontSize: 16,
    // textAlign: "right",
  },
  trashCan: {
    position: "absolute",
    left: WIDTH - 70,
    top: 20,

    // alignItems: "flex-end",
    // justifyContent: "center",
  },
  input: {
    // borderWidth: 1,
    // borderColor: "black",
    padding: 8,
    textAlign: "center",
    width: 300,
    // color: "white",
    fontSize: 24,
    marginBottom: 20,
    backgroundColor: "#DBE2EF",
    borderRadius: 15,
    color: "#112D4E",
  },
  button: {
    // borderWidth: 1,
    marginTop: 20,
    fontSize: 24,
    borderRadius: 15,
    padding: 8,
    // paddingHorizontal: 45,
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
    paddingVertical: 8,
    backgroundColor: "#112D4E",
    color: "#F9F7F7",
  },
  modal: {
    backgroundColor: "#F9F7F7",
    borderRadius: 10,
  },
  optionOutsideArray: {
    alignItems: "center",
  },
  timePickerTextInside: {
    // alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginHorizontal: 5,
    marginVertical: 7,
    fontSize: 22,
    // fontWeight: "bold",
    color: "#112D4E",
    backgroundColor: "#DBE2EF",
  },
  snackBar: {
    position: "absolute",
    width: "100%",
    bottom: 80,
    height: 70,
    // // alignItems: "baseline",
    // justifyContent: "flex-end",
  },
  registerHoursText: {
    fontSize: 22,
    marginBottom: 20,
    // color: "#112D4E",
  },
});
