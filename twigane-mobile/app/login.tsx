import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { router, Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/images/logo1.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Please login to continue learning</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!email.trim() || !password.trim()) && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={!email.trim() || !password.trim()}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <Link href="/registration" asChild>
            <TouchableOpacity style={styles.switchButton}>
              <Text style={styles.switchButtonText}>New here? Register</Text>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 300,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "200",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#fc8f12",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    padding: 15,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#2196F3",
    fontSize: 16,
  },
});
