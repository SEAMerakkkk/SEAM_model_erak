import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import ReactWebcam from "react-webcam";
import { Button, Typography, Box, Paper } from "@mui/material";

function FaceAuthentication({ registeredFaces, onAuthenticated }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // Webcam component reference
  const webcamRef = React.useRef(null);

  useEffect(() => {
    // Load face-api models when component mounts
    const loadModels = async () => {
      const MODEL_URL = "/models"; // Correct model path
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("Models loaded");
    };
    loadModels();
  }, []);

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
          const faceMatch = registeredFaces.find(
            (face) =>
              faceapi.euclideanDistance(
                detections.descriptor,
                face.descriptor
              ) < 0.6
          );

          if (faceMatch) {
            setAuthenticatedUser(faceMatch);
            onAuthenticated(faceMatch);
          } else {
            alert("No matching face found!");
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
            Authenticated User: {authenticatedUser.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FaceAuthentication;
