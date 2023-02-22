import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import * as React from "react";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ChatSnackBar(props: any) {
  const { snackState } = props;
  const { open, handleClose, message, snackType, position } = snackState;
  return (
    <Snackbar
      onClose={handleClose}
      open={open}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: position?.v || "top",
        horizontal: position?.h || "right",
      }}
    
    >
      <Alert    onClose={handleClose} severity={snackType} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
