// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth, firestore } from "@/firebase/firebase";
// import type { User } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Container,
//   Button,
//   Box,
// } from "@mui/material";

// const DashboardPage = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [userName, setUserName] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUser(user);
//         console.log("dashboard", user);
//         const userDoc = await getDoc(doc(firestore, "users", user.uid));
//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           setUserName(`${userData.FirstName} ${userData.LastName}`);
//         } else {
//           router.push("/login");
//         }
//       } else {
//         router.push("/login");
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       router.push("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   const handleChangePassword = () => {
//     router.push("/passwordchange");
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//             Dashboard
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <Container maxWidth="sm">
//         <Box sx={{ mt: 4, textAlign: "center" }}>
//           {userName && (
//             <Typography variant="h4" gutterBottom>
//               Welcome, {userName}!
//             </Typography>
//           )}
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleLogout}
//             sx={{ mr: 2 }}
//           >
//             Logout
//           </Button>
//           <Button
//             variant="outlined"
//             color="secondary"
//             onClick={handleChangePassword}
//           >
//             Change Password
//           </Button>
//         </Box>
//       </Container>
//     </div>
//   );
// };

// export default DashboardPage;

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore, storage } from "@/firebase/firebase";
import type { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userImage, setUserImage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.FirstName} ${userData.LastName}`);
          setUserImage(userData.profileImageUrl || null);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const storageRef = ref(storage, `users/${user.uid}/profileImage`);

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Update Firestore with the image URL
      await updateDoc(doc(firestore, "users", user.uid), {
        profileImageUrl: imageUrl,
      });

      setUserImage(imageUrl);
    }
  };

  const handleImageDelete = async () => {
    if (user && userImage) {
      const storageRef = ref(storage, `users/${user.uid}/profileImage`);

      // Delete the image from Firebase Storage
      await deleteObject(storageRef);

      // Update Firestore to remove the image URL
      await updateDoc(doc(firestore, "users", user.uid), {
        profileImageUrl: null,
      });

      setUserImage(null);
    }
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
          {userImage ? (
            <Avatar
              src={userImage}
              alt="Profile Image"
              sx={{ width: 150, height: 150, margin: "0 auto" }}
            />
          ) : (
            <Avatar
              alt="Profile Image"
              sx={{ width: 150, height: 150, margin: "0 auto" }}
            />
          )}
          <Box mt={2}>
            <input
              accept="image/*"
              id="upload-image"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label htmlFor="upload-image">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                <PhotoCamera />
              </IconButton>
            </label>
            {userImage && (
              <Button color="secondary" onClick={handleImageDelete}>
                Delete Image
              </Button>
            )}
          </Box>
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ mr: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default DashboardPage;
