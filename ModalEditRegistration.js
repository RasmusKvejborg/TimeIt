import React from "react";
import { styles } from "./GlobalStyles.js";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const ModalEditRegistration = (props) => {
  const [noteText, setNoteText] = React.useState();

  const { isVisible, note, itemKeyForAddingLater } = props;

  React.useEffect(() => {
    setNoteText(note);
  }, [note]);

  const onPressItem = () => {
    console.log(noteText);
    props.setIsModalVisible(false);
    props.setNewNote(noteText, itemKeyForAddingLater);
  };

  const changeNoteHandler = (val) => {
    setNoteText(val);
  };

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
          top: 5,
          right: WIDTH / 2 - 55,
          padding: 20,
          // zIndex: 1,
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

      <Text style={styles.headlineText}>Edit note</Text>

      <TextInput
        placeholder="Note (optional)"
        style={styles.noteInput}
        onChangeText={(text) => changeNoteHandler(text)}
        multiline={true}
        value={noteText}
      />
      <TouchableOpacity onPress={() => onPressItem()}>
        <Text style={styles.button}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export { ModalEditRegistration as ModalEditRegistration };
