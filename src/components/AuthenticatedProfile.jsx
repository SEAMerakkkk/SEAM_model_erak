import React from "react";
import { Paper, Box, Typography, Avatar } from "@mui/material";

const AuthenticatedProfile = ({ match }) => {
  if (!match) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        maxWidth: 500,
        mx: "auto",
        mt: 5,
        textAlign: "center",
        borderRadius: "16px",
        background:
          "linear-gradient(180deg, white 18%, rgba(255, 190, 50, 0.8) 65%, rgba(10, 190, 40, 0.7) 100%)", // Subtle gradient with white at corners
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        position: "relative",
      }}
    >
      {/* Top Left Logo */}
      <Box
        component="img"
        src="/src/assets/logo-left.png" // Replace with your actual logo path
        alt="Left Logo"
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          width: 90,
          height: 45,
        }}
      />

      {/* Top Right Logo */}
      <Box
        component="img"
        src="/src/assets/logo-right.png" // Replace with your actual logo path
        alt="Right Logo"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 95,
          height: 55,
        }}
      />

      {/* Success Message */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#4caf50", // Green for success
        }}
      >
        Authentication Successful!
      </Typography>

      {/* Byline */}
      <Typography
        variant="body2"
        gutterBottom
        sx={{
          fontWeight: "400",
          color: "#555",
          fontStyle: "bold",
          mt: 1,
        }}
      >
        Secure authentication via SEAM
      </Typography>

      {/* Welcome Text */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "500", color: "#333", mt: 2 }}
      >
        Welcome, <span style={{ color: "#1976d2" }}>{match.name}</span>!
      </Typography>

      {/* User Details */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
          gap: 3,
        }}
      >
        {/* Registered Image */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "500",
              mb: 1,
              color: "#555",
            }}
          >
            Your Personal Info:
          </Typography>
          <Avatar
            src={match.image}
            alt="Registered face"
            sx={{
              width: 180,
              height: 180,
              border: "2px solid #4caf50",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          />
        </Box>

        {/* Personalized Message */}
        <Typography
          variant="body6"
          sx={{
            fontSize: "1.3rem",
            color: "#2234a8",
            lineHeight: "1.5",
            textShadow: "1px 1px 4px rgba(5, 5, 9, 0.1)",
          }}
        >
          Mera Aadhaar, Meri Pehchan
        </Typography>
      </Box>
    </Paper>
  );
};

export default AuthenticatedProfile;
