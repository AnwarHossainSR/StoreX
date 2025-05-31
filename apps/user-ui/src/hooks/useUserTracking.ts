import { useEffect, useState } from "react";

// Utility function to check if cached data is expired
const isCacheExpired = (timestamp: number, days: number) => {
  const now = new Date().getTime();
  const expirationTime = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  return now - timestamp > expirationTime;
};

const useUserTracking = (expirationDays = 10) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://ip-api.com/json");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        console.log("data", data);
        const userInfo: any = {
          country: data.country,
          city: data.city,
          region: data.regionName,
          latitude: data.lat,
          longitude: data.lon,
          isp: data.isp,
          ip: data.query,
          timestamp: new Date().getTime(),
        };

        // Store in localStorage
        localStorage.setItem("userTrackingData", JSON.stringify(userInfo));
        setUserData(userInfo);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Check localStorage for cached data
    const cachedData = localStorage.getItem("userTrackingData");
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (!isCacheExpired(parsedData.timestamp, expirationDays)) {
        setUserData(parsedData);
        return;
      }
    }

    // Fetch new data if no valid cache exists
    fetchUserData();
  }, [expirationDays]);

  return { userData, isLoading, error };
};

export default useUserTracking;
