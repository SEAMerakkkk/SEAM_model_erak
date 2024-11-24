import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const AuthenticatedProfile = ({ match }) => {
  if (!match) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Authentication Successful
      </Typography>
      <Typography variant="h6" gutterBottom>
        Welcome, {match.name}!
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Registered Image:
          </Typography>
          <img
            src={match.image}
            alt="Registered face"
            style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default AuthenticatedProfile;