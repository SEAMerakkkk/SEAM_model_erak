import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import FaceAuthentication from "./components/FaceAuthentication"; // Authentication
import Header from "./components/Header";

function App() {
  const [mode, setMode] = useState(1); // 0 = Register, 1 = Authenticate (no registration mode now)
  const [registeredFaces, setRegisteredFaces] = useState([]); // Stores registered faces
  const [names, setNames] = useState([]); // Stores names with images
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

  // Load names.json and process dataset
  useEffect(() => {
    const loadDataset = async () => {
      if (modelsLoaded) {
        // Fetch and parse the JSON file
        try {
          const response = await fetch("/dataset/names.json");
          const data = await response.json();
          setNames(data); // Set the names and images from the JSON

          const faceDescriptors = [];

          for (let item of data) {
            try {
              const img = await faceapi.fetchImage(item.image); // Fetch image as Blob from public directory
              const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

              // Check if the image has a valid face detection
              if (detections) {
                console.log(`Descriptors for ${item.name} detected`);
                faceDescriptors.push({
                  descriptor: detections.descriptor,
                  name: item.name,
                  image: item.image, // Store the name along with the descriptor
                });
              } else {
                console.warn(`No face detected in ${item.name}`);
              }
            } catch (error) {
              console.error(`Error processing image ${item.name}:`, error);
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
        } catch (error) {
          console.error("Error loading names.json:", error);
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
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;
