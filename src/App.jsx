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
import FaceAuthentication from "./components/FaceAuthentication"; // Authentication
import AuthenticatedProfile from "./components/AuthenticatedProfile";
import Header from "./components/Header";

function App() {
  const [mode, setMode] = useState(1); // 0 = Register, 1 = Authenticate (no registration mode now)
  const [registeredFaces, setRegisteredFaces] = useState([]); // Stores registered faces
  const [authenticatedUser, setAuthenticatedUser] = useState(null); // Stores the authenticated user
  const [modelsLoaded, setModelsLoaded] = useState(false); // Tracks if FaceAPI models are loaded

  // Load FaceAPI models on component mount
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

  // Load the dataset images from the public folder
  useEffect(() => {
    const loadDataset = async () => {
      if (modelsLoaded) {
        const images = [
          "/dataset/1.jpg",
          "/dataset/2.jpg",
          "/dataset/3.jpg",
          "/dataset/4.jpg",
          "/dataset/5.jpg",
        ]; // List of dataset images in the public directory

        const faceDescriptors = [];

        for (let imageName of images) {
          try {
            const img = await faceapi.fetchImage(imageName); // Fetch image as Blob from public directory
            const detections = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            // Check if the image has a valid face detection
            if (detections) {
              console.log(`Descriptors for ${imageName} detected`);
              faceDescriptors.push(detections.descriptor); // Add descriptor to the registered faces
            } else {
              console.warn(`No face detected in ${imageName}`);
            }
          } catch (error) {
            console.error(`Error processing image ${imageName}:`, error);
          }
        }

        // Ensure we have face descriptors to register
        if (faceDescriptors.length > 0) {
          setRegisteredFaces(faceDescriptors);
        } else {
          console.warn(
            "No face descriptors were extracted from the dataset images."
          );
        }
      }
    };

    loadDataset();
  }, [modelsLoaded]);

  const handleAuthenticated = (match) => {
    setAuthenticatedUser(match);
  };

  if (!modelsLoaded) {
    return (
      <Container maxWidth="lg">
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
        <Header />
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}></Box>

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
