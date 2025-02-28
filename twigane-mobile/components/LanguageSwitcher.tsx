import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";

interface LanguageSwitcherProps {
  currentLanguage: string;
  onToggle: () => void;
}

export default function LanguageSwitcher({
  currentLanguage,
  onToggle,
}: LanguageSwitcherProps) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.container}>
      <Image
        source={
          currentLanguage === "en"
            ? require("../assets/images/rw-flag.jpg")
            : require("../assets/images/en-flag.png")
        }
        style={styles.flag}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  flag: {
    width: 27,
    height: 27,
    borderRadius: 15,
  },
});
