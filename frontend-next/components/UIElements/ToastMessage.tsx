'use client';

import { Snackbar, Alert, AlertColor } from "@mui/material";
import { FC } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  severity?: AlertColor; // 'success' | 'error' | 'warning' | 'info'
  autoHideDuration?: number;
  onClose: () => void;
};

const ToastMesssage: FC<ToastProps> = ({
  open,
  message,
  severity = "info",
  autoHideDuration = 3000,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMesssage;