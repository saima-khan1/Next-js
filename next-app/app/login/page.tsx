"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import {
  Box,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
} from "@mui/material";
import Link from "next/link";

const loginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user.emailVerified) {
        router.push("/dashboard");
        const registrationData = localStorage.getItem("registration");
        const {
          firstName = "",
          lastName = "",
          gender = "",
        } = registrationData ? JSON.parse(registrationData) : {};

        const userDoc = await getDoc(doc(firestore, "users", user.uid));

        if (!userDoc.exists()) {
          await setDoc(doc(firestore, "users", user.uid), {
            firstName,
            lastName,
            email: user.email,
            gender,
          });
        }
        router.push("/dashboard");
        if (userDoc.exists()) {
          router.push("/dashboard");
        } else {
          setError("User profile does not exist.");
        }
      } else {
        setError("please verify your email before logging in");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 400,
          mx: "auto",
          mt: 12,
        }}
      >
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Typography color="error">{error}</Typography>}

        <Button variant="contained" color="primary" type="submit">
          Login
        </Button>
      </Box>
      <Typography variant="body1">
        Don&apos;t have an account?{""}
        <MuiLink component={Link} href="/register" underline="hover">
          Register here
        </MuiLink>
      </Typography>
    </Box>
  );
};
export default loginPage;
