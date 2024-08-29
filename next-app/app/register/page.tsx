"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, firestore } from "../../firebase/firebase";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
} from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { addDoc, collection } from "firebase/firestore";

export default function RegisterPage() {
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("user", user);
      await sendEmailVerification(user);

      await setDoc(doc(firestore, "users", user.uid), {
        FirstName: firstname,
        LastName: lastname,
        Email: user.email,
        Gender: gender,
      });

      setMessage(
        "Registration successful! Please check your email for verification."
      );

      // Navigate to dashboard after the document is written
      router.push("/dashboard");

      // Clear fields
      setFirstname("");
      setLastname("");
      setGender("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error during registration:", error);
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleRegister}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        mt: 4,
      }}
    >
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
        required
      />

      <TextField
        label="Last Name"
        variant="outlined"
        fullWidth
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
        required
      />

      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <FormControl variant="outlined" fullWidth required>
        <InputLabel id="gender-label">Gender</InputLabel>
        <Select
          labelId="gender-label"
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          label="Gender"
        >
          <MenuItem value="">
            <em>Select Gender</em>
          </MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {error && <Typography color="error">{error}</Typography>}
      {message && <Typography color="primary">{message}</Typography>}

      <Button variant="contained" color="primary" type="submit">
        Create User Profile
      </Button>
    </Box>
  );
}
