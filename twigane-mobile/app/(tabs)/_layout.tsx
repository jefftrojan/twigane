import React, { useState, useRef } from "react";
import { Link, Tabs } from "expo-router";
import {
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
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import ProfileModal from "@/components/ProfileModal";
import * as Animatable from "react-native-animatable";

// Define color constants to match Learning Buddy app
const COLORS = {
  primary: "#FF7D00",
  accent: "#FF9A3D",
  background: "#FFF9F2",
  text: "#333333",
  textLight: "#888888",
  cardLight: "#FFFFFF",
  cardDark: "#FFF0E6",
};

// Custom TabBarIcon component that supports multiple icon libraries
function TabBarIcon({ name, color, type = "fontawesome5" }) {
  if (type === "material") {
    return <MaterialCommunityIcons name={name} size={24} color={color} style={styles.icon} />;
  } else if (type === "ionicons") {
    return <Ionicons name={name} size={24} color={color} style={styles.icon} />;
  } else if (type === "fontawesome5") {
    return <FontAwesome5 name={name} size={22} color={color} style={styles.icon} />;
  }
}

export default function TabLayout() {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Simple profile button with gradient background
  const ProfileButton = () => (
    <TouchableOpacity 
      onPress={() => setProfileModalVisible(true)}
      style={styles.profileButton}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.profileGradient}
      >
        <FontAwesome5 name="user" size={18} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  // Custom header title component
  const HeaderTitle = () => (
    <Text style={styles.headerTitle}>
      Twigane
    </Text>
  );

  return (
    <>
      <Tabs 
        screenOptions={{
          // Header configuration
          headerLeft: () => null, // Remove back button or any left component
          headerRight: () => <ProfileButton />,
          headerTitle: () => <HeaderTitle />,
          headerTitleAlign: "left", // Align title to left
          headerStyle: {
            backgroundColor: "#FFFFFF",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderBottomColor: "rgba(0,0,0,0.05)",
            borderBottomWidth: 1,
            height: 110,
          },
          
          // Tab bar configuration
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "rgba(0,0,0,0.05)",
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Animatable.View
                animation={focused ? "pulse" : undefined}
                iterationCount={focused ? "infinite" : 1}
                duration={1000}
              >
                <TabBarIcon 
                  type="fontawesome5"
                  name="home" 
                  color={color} 
                />
              </Animatable.View>
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: "Games",
            tabBarIcon: ({ color, focused }) => (
              <Animatable.View
                animation={focused ? "pulse" : undefined}
                iterationCount={focused ? "infinite" : 1}
                duration={1000}
              >
                <TabBarIcon 
                  type="material"
                  name={focused ? "gamepad-variant" : "gamepad-variant-outline"} 
                  color={color} 
                />
              </Animatable.View>
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, focused }) => (
              <Animatable.View
                animation={focused ? "pulse" : undefined}
                iterationCount={focused ? "infinite" : 1}
                duration={1000}
              >
                <TabBarIcon 
                  type="material"
                  name="chart-line" 
                  color={color} 
                />
              </Animatable.View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <Animatable.View
                animation={focused ? "pulse" : undefined}
                iterationCount={focused ? "infinite" : 1}
                duration={1000}
              >
                <TabBarIcon 
                  type="ionicons"
                  name={focused ? "chatbubble" : "chatbubble-outline"} 
                  color={color} 
                />
              </Animatable.View>
            ),
          }}
        />
      </Tabs>
      <ProfileModal 
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FC8F12", // Original Twigane color
    letterSpacing: 0.5,
    marginLeft: 16, // Add some left margin
  },
  profileButton: {
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: -3,
  }
});