import { Button, Chip } from "@mui/material";
import React from "react";

function OrderStatusButton({ status }) {
  const handleClick = () => {};
  return <Chip label={status} variant="outlined" onClick={handleClick} />;
}

export default OrderStatusButton;
