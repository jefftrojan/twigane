import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { router, Link } from "expo-router";
import { authService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from '@expo/vector-icons';

// Define color constants to match the theme
const COLORS = {
  primary: "#FF7D00",
  accent: "#FF9A3D",
  background: "#FFF9F2",
  text: "#333333",
  textLight: "#888888",
  cardLight: "#FFFFFF",
  error: "#E53935",
};

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await authService.login({
        email: email.trim(),
        password: password.trim()
      });

      console.log('Auth response:', response);

      // Check if response exists and has token
      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store only the token since that's what we receive
      await AsyncStorage.setItem('auth_token', response.token);
      
      router.replace("/(tabs)");
    } catch (err) {
      console.error('Login error details:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.background, "#FFFFFF"]}
        style={styles.background}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Please login to continue learning</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="user" size={18} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputWrapper}>
            <FontAwesome5 name="lock" size={18} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!email.trim() || !password.trim() || loading) && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={!email.trim() || !password.trim() || loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
      
          {error ? (
            <View style={styles.errorContainer}>
              <FontAwesome5 name="exclamation-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
      
          <Link href="/registration" asChild>
            <TouchableOpacity style={styles.switchButton}>
              <Text style={styles.switchButtonText}>
                New here? <Text style={styles.switchButtonHighlight}>Register</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: width * 0.7,
    height: 150,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: 56,
  },
  loginButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  errorText: {
    color: COLORS.error,
    marginLeft: 8,
    fontSize: 14,
  },
  switchButton: {
    padding: 15,
  },
  switchButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  switchButtonHighlight: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});