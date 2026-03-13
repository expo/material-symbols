import AntDesign from "@react-native-vector-icons/ant-design";
import { useState } from "react";
import {
  Button,
  Image,
  View as RNView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SAMPLE_ICONS = [
  "home",
  "heart",
  "star",
  "setting",
  "user",
  "search",
  "camera",
  "bell",
  "gift",
  "rocket",
  "lock",
  "unlock",
  "cloud",
  "fire",
  "eye",
  "edit",
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BasicIcons() {
  return (
    <Section title="Basic Usage">
      <RNView style={styles.iconRow}>
        {SAMPLE_ICONS.map((name) => (
          <RNView key={name} style={styles.iconCell}>
            <AntDesign name={name} size={24} color="#333" />
            <Text style={styles.iconLabel}>{name}</Text>
          </RNView>
        ))}
      </RNView>
    </Section>
  );
}

function SizedIcons() {
  const sizes = [16, 24, 32, 48, 64];
  return (
    <Section title="Sizes">
      <RNView style={styles.iconRow}>
        {sizes.map((size) => (
          <RNView key={size} style={styles.iconCell}>
            <AntDesign name="heart" size={size} color="#e74c3c" />
            <Text style={styles.iconLabel}>{size}px</Text>
          </RNView>
        ))}
      </RNView>
    </Section>
  );
}

function ColoredIcons() {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
  ];
  return (
    <Section title="Colors">
      <RNView style={styles.iconRow}>
        {colors.map((color) => (
          <RNView key={color} style={styles.iconCell}>
            <AntDesign name="star" size={32} color={color} />
            <Text style={[styles.iconLabel, { color }]}>{color}</Text>
          </RNView>
        ))}
      </RNView>
    </Section>
  );
}

function GetImageSourceExample() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <Section title="getImageSource (for tab bars, etc.)">
      <RNView style={styles.iconRow}>
        <Button
          title="Generate Image"
          onPress={async () => {
            try {
              const source = await AntDesign.getImageSource(
                "apple",
                48,
                "#3498db",
              );
              console.log({ source });

              // @ts-ignore
              setImageUri(source.uri.uri);
            } catch (err) {
              console.error("Error generating image source:", err);
            }
          }}
        />
        <Text>imageUri:{String(imageUri)}</Text>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.generatedImage} />
        )}
      </RNView>
    </Section>
  );
}

function InlineTextExample() {
  return (
    <Section title="Inline with Text">
      <Text style={styles.inlineText}>
        Press <AntDesign name="setting" size={16} color="#333" /> to open
        settings
      </Text>
      <Text style={styles.inlineText}>
        <AntDesign name="check-circle" size={16} color="#2ecc71" /> Task
        completed successfully
      </Text>
      <Text style={styles.inlineText}>
        <AntDesign name="warning" size={16} color="#f39c12" /> Please review
        before continuing
      </Text>
    </Section>
  );
}

export default function IconsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>@react-native-vector-icons/ant-design</Text>
      <BasicIcons />
      <SizedIcons />
      <ColoredIcons />
      <GetImageSourceExample />
      <InlineTextExample />
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
  section: {
    rowGap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  iconCell: {
    alignItems: "center",
    width: 64,
    rowGap: 4,
  },
  iconLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  inlineText: {
    fontSize: 14,
    lineHeight: 24,
  },
  generatedImage: {
    width: 48,
    height: 48,
  },
});
