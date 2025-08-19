
import React, { useState } from "react";
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup } from "@mui/material";



export default function TermsAndConditions() {
  const [showTerms, setShowTerms] = useState(false);
  return (
    <>
      <Typography
        variant="caption"
        color="white"
        sx={{ position: 'absolute', left: 16, bottom: 8, cursor: 'pointer', zIndex: 10}}
        onClick={() => setShowTerms(true)}
      >
        By continuing you agree to our
        <span style={{ color: '#FFD700' }}> Terms and Conditions</span>
      </Typography>
      <Dialog open={showTerms} onClose={() => setShowTerms(false)}>
        <DialogTitle>Terms and Conditions This is only a prototype TaC</DialogTitle>
        <DialogContent>
          <FormGroup>
            <p>Other terms are to be defined in the future.</p>
            <h1>Groups and Private Agreement</h1>
            <p>
              Upon the creation of a group, the members may enter into a private agreement governed by <br />
              <br />
              <i>“The contracting parties may establish such stipulations, clauses, terms, and conditions as they may deem convenient, provided they are not contrary to law, morals, good customs, public order, or public policy.”</i>
            </p>
            <br />
            <p>
                This means group members may establish their own set of rules — including payment schedules, contribution amounts, and penalties — which shall be binding among themselves. Ambag is not a party to these agreements and is not responsible for enforcing or monitoring compliance, except to provide the platform where such agreements may be recorded and tracked.
            </p>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <button
            style={{
              background: '#FFD700',
              color: '#2D0A0A',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => setShowTerms(false)}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

