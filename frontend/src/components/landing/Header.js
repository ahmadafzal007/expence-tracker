import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Header({ scrollToSection }) {

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography 
          variant="h5" 
          sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '1.8rem' }}
        >
          BudgetBuddy
        </Typography>

        <Button 
            color="inherit" 
            href="/" 
            sx={{ fontSize: '1.2rem', fontWeight: 600,mx: 2, textTransform: 'none' }}
        >
          Home
        </Button>
        {/* <Button 
          color="inherit" 
          href="/signin" 
          sx={{ fontSize: '1.2rem', fontWeight: 600,mx: 2, textTransform: 'none' }}
          >
          Expenses
        </Button> */}
        <Button 
          color="inherit" 
          onClick={() => scrollToSection('about')} 
          sx={{ fontSize: '1.2rem', fontWeight: 600,mx: 2, textTransform: 'none' }}
          >
          About
        </Button>
        <Button 
          color="inherit" 
          onClick={() => scrollToSection('contact')} 
          sx={{ fontSize: '1.2rem', fontWeight: 600,mx: 2, textTransform: 'none' }}
          >
          Contact
        </Button>
      </Toolbar>
    </AppBar>
  );
}
