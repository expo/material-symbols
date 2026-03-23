import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Home } from "@expo/material-symbols/home";
import { Search } from "@expo/material-symbols/search";
import { Star } from "@expo/material-symbols/star";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const icons = [
  { name: "Star", source: Star },
  { name: "Home", source: Home },
  { name: "Search", source: Search },
];

const sizes = [16, 24, 32, 48];
const colors = ["#000000", "#007AFF", "#E53935", "#43A047"];

export default function IconsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>@expo/material-symbols</Text>
      <Text style={styles.subtitle}>via @expo/ui Icon (Jetpack Compose)</Text>

      <Text style={styles.sectionTitle}>Icons</Text>
      <View style={styles.iconRow}>
        {icons.map(({ name, source }) => (
          <View key={name} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={source} contentDescription={name} size={32} />
            </Host>
            <Text style={styles.iconLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Sizes</Text>
      <View style={styles.iconRow}>
        {sizes.map((size) => (
          <View key={size} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={Star} size={size} />
            </Host>
            <Text style={styles.iconLabel}>{size}dp</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Tint colors</Text>
      <View style={styles.iconRow}>
        {colors.map((color) => (
          <View key={color} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={Star} size={32} tintColor={color} />
            </Host>
            <Text style={styles.iconLabel}>{color}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  iconCell: {
    alignItems: "center",
    width: 80,
    rowGap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconLabel: {
    fontSize: 10,
    textAlign: "center",
  },
});
