import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = ["주문 접수", "제조 중", "픽업 대기", "수령 완료"];

const statusToStep = {
  REQUEST: 0,
  INPROGRESS: 1,
  COMPLETED: 2,
  RECEIVED: 3,
  REJECTED: 0,
  CANCELED: 0,
};

export default function OrderStepper({ orderStatus }) {
  const activeStep =
    orderStatus && orderStatus in statusToStep ? statusToStep[orderStatus] : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const isCanceled = orderStatus === "CANCELED" && index === 0;

          // 커스텀 아이콘 컴포넌트
          const StepIcon = (props) => {
            const { active, completed, className } = props;

            if (isCanceled)
              return <CancelIcon sx={{ color: "red" }} className={className} />;

            // 완료된 단계는 ✓ 표시 (선택사항)
            if (completed)
              return (
                <CheckCircleIcon
                  sx={{ color: active ? "primary.main" : "gray" }}
                  className={className}
                />
              );

            return (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: active ? "primary.main" : "grey.400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "primary.main" : "grey.500",
                  fontSize: 13,
                }}
                className={className}
              >
                {index + 1}
              </Box>
            );
          };

          return (
            <Step key={label}>
              <StepLabel
                StepIconComponent={StepIcon}
                sx={{
                  "& .MuiStepLabel-label": isCanceled ? { color: "red" } : {},
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
