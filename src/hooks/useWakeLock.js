import { useEffect } from "react";

export const useWakeLock = () => {
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        // Request a screen wake lock to keep the device active
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.log("Wake Lock error:", err);
      }
    };

    requestWakeLock();

    // Clean-up function to release the lock upon component unmount
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);
};
