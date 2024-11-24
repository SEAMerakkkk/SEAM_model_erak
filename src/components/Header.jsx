import React from 'react';
import { Box, Typography } from '@mui/material';

const Header = () => {
  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
        <img src="/src/assets/logos/logo1.png" alt="Logo 1" style={{ height: 60 }} />
        <img src="/src/assets/logos/logo2.png" alt="Logo 2" style={{ height: 60 }} />
        <img src="/src/assets/logos/logo3.png" alt="Logo 3" style={{ height: 60 }} />
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Secure Encryption and Authentication System
      </Typography>
    </Box>
  );
};

export default Header;