import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();

    const deviceData: any = {
      browser: {
        name: result.browser.name,
        version: result.browser.version,
      },
      os: {
        name: result.os.name,
        version: result.os.version,
      },
      device: {
        model: result.device.model,
        type: result.device.type || "desktop", // Default to 'desktop' if type is undefined
        vendor: result.device.vendor,
      },
      engine: {
        name: result.engine.name,
        version: result.engine.version,
      },
      cpu: {
        architecture: result.cpu.architecture,
      },
      // language: navigator.language || navigator.userLanguage,
      // platform: navigator.platform,
    };

    setDeviceInfo(deviceData);
  }, []);

  return deviceInfo;
};

export default useDeviceInfo;
