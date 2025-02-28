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
import { router } from "expo-router";

export default function RegistrationScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");

  const handleRegister = () => {
    if (name.trim() && age.trim() && email.trim() && password.trim()) {
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

        <Text style={styles.title}>Welcome to Twigane!</Text>
        <Text style={styles.subtitle}>Please register to get started!</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Child's Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={2}
            placeholderTextColor="#666"
          />

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

          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "en" && styles.activeLanguage,
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text
                style={[
                  styles.languageText,
                  language === "en" && styles.activeText,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "rw" && styles.activeLanguage,
              ]}
              onPress={() => setLanguage("rw")}
            >
              <Text
                style={[
                  styles.languageText,
                  language === "rw" && styles.activeText,
                ]}
              >
                Kinyarwanda
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              (!name.trim() ||
                !age.trim() ||
                !email.trim() ||
                !password.trim()) &&
                styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={
              !name.trim() || !age.trim() || !email.trim() || !password.trim()
            }
          >
            <Text style={styles.registerButtonText}>Start Learning!</Text>
          </TouchableOpacity>
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
    fontWeight: 300,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 200,
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
  languageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    width: "100%",
  },
  languageButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeLanguage: {
    backgroundColor: "#fc8f12",
  },
  languageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeText: {
    color: "white",
  },
  registerButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#00a33c",
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
