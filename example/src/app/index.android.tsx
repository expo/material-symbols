import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Home } from "@expo/material-symbols/home";
import { Search } from "@expo/material-symbols/search";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Star } from "@expo/material-symbols/star";
import SearchRounded from "@/assets/search_rounded.xml";
import StarRounded from "@/assets/star_rounded.xml";
import FavoriteSharpFill from "@/assets/favorite_sharp_fill.xml";
import BackspaceWght100 from "@/assets/backspace_wght100.xml";
import BackspaceWght700 from "@/assets/backspace_wght700.xml";
import BackspaceFillWght700 from "@/assets/backspace_fill_wght700.xml";
import DoNotDisturbOn from "@/assets/do_not_disturb_on.xml";

const sizes = [16, 24, 32, 48];
const colors = ["#000000", "#007AFF", "#E53935", "#43A047"];

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>@expo/material-symbols</Text>
      <Text style={styles.subtitle}>via @expo/ui Icon (Jetpack Compose)</Text>

      <Text style={styles.sectionTitle}>Library icons (tree-shakeable)</Text>
      <View style={styles.iconRow}>
        {[
          { name: "Star", source: Star },
          { name: "Home", source: Home },
          { name: "Search", source: Search },
        ].map(({ name, source }) => (
          <View key={name} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={source} contentDescription={name} size={32} />
            </Host>
            <Text style={styles.iconLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Styles</Text>
      <View style={styles.iconRow}>
        {[
          { name: "Search\noutlined", source: Search },
          { name: "Search\nrounded", source: SearchRounded },
          { name: "Star\noutlined", source: Star },
          { name: "Star\nrounded", source: StarRounded },
          { name: "Favorite\nsharp fill", source: FavoriteSharpFill },
        ].map(({ name, source }) => (
          <View key={name} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={source} size={32} />
            </Host>
            <Text style={styles.iconLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Weights</Text>
      <View style={styles.iconRow}>
        {[
          { name: "Backspace\nwght100", source: BackspaceWght100 },
          { name: "Backspace\nwght700", source: BackspaceWght700 },
          { name: "Backspace\nfill wght700", source: BackspaceFillWght700 },
        ].map(({ name, source }) => (
          <View key={name} style={styles.iconCell}>
            <Host matchContents>
              <Icon source={source} size={32} />
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
              <Icon source={Star} size={32} tint={color} />
            </Host>
            <Text style={styles.iconLabel}>{color}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Other</Text>
      <View style={styles.iconRow}>
        <View style={styles.iconCell}>
          <Host matchContents>
            <Icon source={DoNotDisturbOn} size={32} />
          </Host>
          <Text style={styles.iconLabel}>DoNotDisturbOn</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
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
