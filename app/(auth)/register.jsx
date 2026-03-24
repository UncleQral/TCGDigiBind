import { useRouter } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../../utils/api";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unmatchedPasswords, setUnmatchedPasswords] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      setError("Invalid Email!");
      setInvalidEmail(true);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don´t Match!");
      setUnmatchedPasswords(true);
      return;
    }
    setInvalidEmail(false);
    setUnmatchedPasswords(false);
    try {
      const data = await api.post("/user/register", {
        username,
        email,
        password,
      });
      if (data.affectedRows > 0) {
        router.replace("/(auth)/login");
      } else if (data.message === "Email already in use") {
        setError("Email already in use");
        setInvalidEmail(true);
      }
    } catch (err) {
      setError("something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, invalidEmail && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, unmatchedPasswords && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, unmatchedPasswords && styles.inputError]}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.link}>Already have an Account?</Text>
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
