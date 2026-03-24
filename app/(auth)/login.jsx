import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      setError("Invalid Email!");
      setInvalidEmail(true);
      return;
    }
    setInvalidEmail(false);
    try {
      const data = await api.post("/user/login", { email, password });
      if (data.token) {
        login(data.token, data.user);
        router.replace("/(app)");
      } else {
        setError("Login failed");
      }
    } catch (err) {
      console.log("Login error: ", err);
      setError("something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>TCG DIGIBind</Text>
        <TextInput
          style={[styles.input, invalidEmail && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#1A1A1A",
  },
  card: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "#ff7b00",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#ff8800",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 32,
    color: "#9CA3AF",
  },
  input: {
    borderWidth: 0.5,
    borderColor: "#444444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#d00000",
  },
  button: {
    backgroundColor: "#ffc300",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#000000", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginBottom: 12 },
  link: { textAlign: "center", marginTop: 16, color: "#ff8800" },
});
