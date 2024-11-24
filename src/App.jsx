import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import {
  Container,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Typography,
} from "@mui/material";
import FaceRegistration from "./components/FaceRegistration";
import FaceAuthentication from "./components/FaceAuthentication";
import AuthenticatedProfile from "./components/AuthenticatedProfile";
import Header from "./components/Header";

function App() {
  const [mode, setMode] = useState(0); // 0 = Register, 1 = Authenticate
  const [registeredFaces, setRegisteredFaces] = useState([]); // Stores registered faces
  const [authenticatedUser, setAuthenticatedUser] = useState(null); // Stores the authenticated user
  const [modelsLoaded, setModelsLoaded] = useState(false); // Tracks if FaceAPI models are loaded

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // Use the relative path for models in the public directory
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  const handleRegister = (faceData) => {
    // Add new face data to the registered list
    setRegisteredFaces((prev) => [...prev, faceData]);
  };

  const handleAuthenticated = (match) => {
    // Set the authenticated user's profile
    setAuthenticatedUser(match);
  };

  if (!modelsLoaded) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>
            Loading face recognition models...
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Please wait while we initialize the system.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Application Header */}
        <Header />

        {/* Tabs for switching between Register and Authenticate modes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={mode} onChange={(_, newValue) => setMode(newValue)}>
            <Tab label="Register" />
            <Tab label="Authenticate" />
          </Tabs>
        </Box>

        {/* Conditional rendering based on the selected mode */}
        {mode === 0 && <FaceRegistration onRegister={handleRegister} />}

        {mode === 1 && (
          <>
            <FaceAuthentication
              registeredFaces={registeredFaces}
              onAuthenticated={handleAuthenticated}
            />
            {authenticatedUser && (
              <AuthenticatedProfile match={authenticatedUser} />
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;
