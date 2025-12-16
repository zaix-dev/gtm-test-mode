"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_STORAGE_KEY = "testModeActive";

export const useTestMode = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    try {
      const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
      setIsActive(storedValue === "true");
    } catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  }, []);

  const handleStorageChange = useCallback(() => {
    try {
      const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
      setIsActive(storedValue === "true");
    }
    catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("testModeChange", handleStorageChange);
    return () => {
      window.removeEventListener("testModeChange", handleStorageChange);
    };
  }, [handleStorageChange]);

  const setTestMode = (enabled: boolean) => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(enabled));
      window.dispatchEvent(new Event("testModeChange"));
    } catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  };

  const enableTestMode = () => setTestMode(true);
  const disableTestMode = () => setTestMode(false);

  return { isTestModeActive: isActive, enableTestMode, disableTestMode };
};