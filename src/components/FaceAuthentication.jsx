import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import ReactWebcam from "react-webcam";
import { Button, Typography, Box, Paper } from "@mui/material";

function FaceAuthentication({ registeredFaces, onAuthenticated }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // Webcam component reference
  const webcamRef = React.useRef(null);

  // Store the face matcher created with the dataset descriptors
  const [faceMatcher, setFaceMatcher] = useState(null);

  useEffect(() => {
    // Load face-api models when component mounts
    const loadModels = async () => {
      const MODEL_URL = "/models"; // Correct model path
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("Models loaded");

      // Create the face matcher after models are loaded
      if (registeredFaces.length > 0) {
        const faceMatcherInstance = new faceapi.FaceMatcher(
          registeredFaces,
          0.6
        );
        setFaceMatcher(faceMatcherInstance); // Store the face matcher for later use
      }
    };
    loadModels();
  }, [registeredFaces]);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    const imageSrc = webcamRef.current.getScreenshot(); // Get base64 image from webcam

    try {
      const img = new Image();
      img.src = imageSrc; // Create Image element from base64 string

      img.onload = async () => {
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          // If face matcher is ready, try to match
          if (faceMatcher) {
            const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
            if (bestMatch && bestMatch.distance < 0.6) {
              // If a match is found, authenticate the user
              setAuthenticatedUser(bestMatch.label); // Best match label should represent the user
              onAuthenticated(bestMatch.label); // Return the match to the parent
            } else {
              alert("No matching face found!");
            }
          } else {
            alert("Face matcher is not yet loaded.");
          }
        } else {
          alert("No face detected!");
        }
      };
    } catch (error) {
      console.error("Error during authentication:", error);
    }

    setIsAuthenticating(false);
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Face Authentication
      </Typography>
      <Box>
        <ReactWebcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width="640"
          height="480"
          videoConstraints={{
            facingMode: "user",
          }}
        />
      </Box>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Authenticating..." : "Authenticate"}
        </Button>
      </Paper>
      {authenticatedUser && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Authenticated User: {authenticatedUser}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FaceAuthentication;
