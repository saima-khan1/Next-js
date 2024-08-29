"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from "@mui/material";

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log("dashboard", user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.FirstName} ${userData.LastName}`);
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChangePassword = () => {
    router.push("/passwordchange");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          {userName && (
            <Typography variant="h4" gutterBottom>
              Welcome, {userName}!
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            sx={{ mr: 2 }}
          >
            Logout
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default DashboardPage;
