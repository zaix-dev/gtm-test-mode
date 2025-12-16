"use client";

import React, { useEffect, type FC, type ReactNode } from "react";
import { useTestMode } from "./useTestMode";

interface TestModeManagerProps {
  children?: ReactNode;
}

const TestModeBanner: FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      backgroundColor: "red",
      color: "white",
      textAlign: "center",
      padding: "8px 0",
      zIndex: 9999,
      fontSize: "1rem",
      fontWeight: "bold",
    }}
  >
    GTM TEST MODE ACTIVE
  </div>
);

export const TestModeManager: FC<TestModeManagerProps> = ({ children }) => {
  const { isTestModeActive, enableTestMode, disableTestMode } = useTestMode();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).enableTestMode = () => {
        enableTestMode();
        console.log(
          "GTM Test Mode: ENABLED. Redirects will be blocked."
        );
      };
      (window as any).disableTestMode = () => {
        disableTestMode();
        console.log("GTM Test Mode: DISABLED. Normal behavior restored.");
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).enableTestMode;
        delete (window as any).disableTestMode;
      }
    };
  }, [enableTestMode, disableTestMode]);

  return (
    <>
      {isTestModeActive && <TestModeBanner />}
      {children}
    </>
  );
};