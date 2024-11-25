import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import ReactWebcam from "react-webcam";
import { Button, Typography, Box } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightModeIcon from "@mui/icons-material/LightMode"; // Better icon for lighting
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye"; // Eye icon for looking at the camera
import WarningIcon from "@mui/icons-material/Warning"; // Warning icon for multiple faces or no faces

function FaceAuthentication({ registeredFaces, onAuthenticated }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [instructions, setInstructions] = useState({
    camera: true,
    lighting: true,
  });
  const [cameraError, setCameraError] = useState(null); // State to track camera errors
  const [facesStatus, setFacesStatus] = useState("no-face"); // State to track face detection status

  // Webcam component reference
  const webcamRef = React.useRef(null);

  // Store the face matcher created with the dataset descriptors
  const [faceMatcher, setFaceMatcher] = useState(null);

  useEffect(() => {
    // Check if the webcam is accessible
    const checkCameraAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraError(null); // Clear any previous errors if camera is accessible
      } catch (err) {
        setCameraError(
          "Camera access denied. Please allow access to your camera."
        );
      }
    };

    checkCameraAccess();

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

  // Function to handle face detection continuously
  const handleFaceDetection = async () => {
    const videoElement = webcamRef.current?.video;
    if (!videoElement) return;

    const detections = await faceapi
      .detectAllFaces(videoElement)
      .withFaceLandmarks();

    if (detections.length === 0) {
      setFacesStatus("no-face");
    } else if (detections.length === 1) {
      setFacesStatus("one-face");
    } else {
      setFacesStatus("multiple-faces"); // Updated for 2 or more faces
    }
  };

  // Run face detection every 500ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleFaceDetection();
    }, 500); // Checking for face detection every 500ms

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Ensure the content fits within the viewport
        backgroundColor: "#ffffff", // Set background color to white
        flexDirection: "column",
        gap: 1, // Adjusted gap for better spacing
        padding: "10px", // Add padding to make sure content is spaced well
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 5,
          borderRadius: "25px",
          backgroundColor: "#FAFAF5",
          boxShadow: 6,
          border: "2px solid lightgrey", // Thicker grey border
          width: "100%",
          maxWidth: "420px", // Makes the box more centered and responsive
          flex: 1, // Allow the content to fill the available space
          overflow: "hidden", // Prevent scrolling
        }}
      >
        {cameraError && (
          <Box
            sx={{
              padding: "10px",
              backgroundColor: "#ffebee",
              borderRadius: "8px",
              color: "red",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            <Typography variant="body2">{cameraError}</Typography>
          </Box>
        )}

        {/* Only show webcam box if camera is accessible */}
        {!cameraError && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "300px", // Set a fixed height for the webcam preview
              backgroundColor: "white",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: 3,
              mb: 3, // Adjusted margin for spacing
            }}
          >
            <ReactWebcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "user",
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensures webcam fills the container
              }}
            />

            {/* Visual Border for Alignment */}
            <Box
              sx={{
                position: "absolute",
                top: "15%",
                left: "20%",
                right: "20%",
                bottom: "25%",
                border: "2px dashed #00C853", // Dashed border for alignment
                borderRadius: "12px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none", // Prevent interaction with the border
              }}
            ></Box>
          </Box>
        )}

        {/* Authentication Button */}
        <Button
          variant="contained"
          color="success"
          onClick={handleAuthenticate}
          disabled={
            isAuthenticating || cameraError || facesStatus !== "one-face"
          }
          startIcon={<CameraAltIcon />}
          sx={{
            borderRadius: "12px",
            width: "100%", // Takes up full width of the container
            maxWidth: "420px", // Limits the maximum width
            textTransform: "none",
            fontSize: "16px", // More readable font size
          }}
        >
          {isAuthenticating ? "Authenticating..." : "Authenticate"}
        </Button>

        {/* Faces Detection Status */}
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {facesStatus === "no-face" && (
            <Box sx={{ color: "red", display: "flex", alignItems: "center" }}>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="body2">No face detected</Typography>
            </Box>
          )}
          {facesStatus === "multiple-faces" && (
            <Box
              sx={{ color: "orange", display: "flex", alignItems: "center" }}
            >
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Multiple faces detected</Typography>
            </Box>
          )}
          {facesStatus === "one-face" && (
            <Box sx={{ color: "green", display: "flex", alignItems: "center" }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Ready to Authenticate</Typography>
            </Box>
          )}
        </Box>

        {/* Instructional Section */}
        <Box sx={{ mt: 4, width: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: "start" }}>
            Follow these instructions:
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Stack icons and texts vertically
              alignItems: "flex-start", // Align items to the start (left)
              gap: 1, // Reduced gap to make instructions closer together
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row", // Align icon and text horizontally
                alignItems: "center", // Align icon and text vertically centered
                color: instructions.camera ? "green" : "red",
                mb: 1, // Reduced margin at the bottom to make it closer
              }}
            >
              <RemoveRedEyeIcon
                sx={{ color: instructions.camera ? "green" : "red" }}
              />
              <Typography variant="body5" sx={{ ml: 2 }}>
                Look directly at your camera and stay still
              </Typography>
            </Box>

            {/* New instruction for alignment */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row", // Align icon and text horizontally
                alignItems: "center", // Align icon and text vertically centered
                color: instructions.camera ? "green" : "red",
                mb: 1, // Reduced margin
              }}
            >
              <CheckCircleIcon
                sx={{ color: instructions.camera ? "green" : "red" }}
              />
              <Typography variant="body5" sx={{ ml: 2 }}>
                Position your face within the green frame
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row", // Align icon and text horizontally
                alignItems: "center", // Align icon and text vertically centered
                color: instructions.lighting ? "green" : "red",
                mb: 1, // Reduced margin
              }}
            >
              <LightModeIcon
                sx={{ color: instructions.lighting ? "green" : "red" }}
              />
              <Typography variant="body5" sx={{ ml: 2 }}>
                Ensure good lighting on your face
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Show authenticated user */}
      {authenticatedUser && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="primary">
            Authenticated User: {authenticatedUser}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FaceAuthentication;
