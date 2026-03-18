import { StyleSheet, Text, View } from "react-native";

export default function IconsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TODO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});
