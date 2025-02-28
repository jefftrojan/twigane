import React, { useState, useRef } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import {
  Pressable,
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function TabBarIcon({ name, color }) {
  return <FontAwesome size={24} color={color} style={styles.icon} />;
}

export default function TabLayout() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleLanguage = () =>
    setCurrentLanguage(currentLanguage === "en" ? "rw" : "en");

  const toggleProfileDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: profileDropdownVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setProfileDropdownVisible(!profileDropdownVisible));
  };

  const CustomHeader = () => (
    <LinearGradient
      colors={["#ffffff", "#f7f7f7"]}
      style={styles.headerContainer}
    >
      <Text style={styles.headerTitle}>Twigane</Text>
      <View style={styles.headerRight}>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onToggle={toggleLanguage}
        />
        <TouchableOpacity
          onPress={toggleProfileDropdown}
          style={styles.profileButton}
        >
          <FontAwesome
            name="user-circle"
            size={24}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </TouchableOpacity>
        {profileDropdownVisible && (
          <Animated.View
            style={[
              styles.dropdownMenu,
              { opacity: fadeAnim },
              isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight,
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleProfileDropdown}
            >
              <FontAwesome
                name="user"
                size={16}
                color={isDark ? "#fff" : "#333"}
              />
              <Text style={[styles.menuText, isDark && styles.menuTextDark]}>
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleProfileDropdown}
            >
              <FontAwesome
                name="cog"
                size={16}
                color={isDark ? "#fff" : "#333"}
              />
              <Text style={[styles.menuText, isDark && styles.menuTextDark]}>
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleProfileDropdown}
            >
              <FontAwesome
                name="sign-out"
                size={16}
                color={isDark ? "#fff" : "#333"}
              />
              <Text style={[styles.menuText, isDark && styles.menuTextDark]}>
                Logout
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        header: () => <CustomHeader />,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: "Games",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="gamepad" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FC8F12",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    marginLeft: 10,
    borderRadius: 20,
  },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    width: 160,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownMenuLight: {
    backgroundColor: "#fff",
  },
  dropdownMenuDark: {
    backgroundColor: "#222",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  menuText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  menuTextDark: {
    color: "#fff",
  },
  icon: {
    marginBottom: -3,
  },
});
