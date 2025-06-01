import { spawn } from "child_process";

type Service = {
  name: string;
  command: string;
};

const services: Service[] = [
  { name: "auth-service", command: "serve" },
  { name: "@source/product-service", command: "serve" },
  { name: "@./api-gateway", command: "serve" },
  { name: "@source/user-ui", command: "dev" }, // Next.js app uses `dev`
];

function runNxTarget(project: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["nx", command, project], {
      stdio: "inherit",
      shell: true,
    });

    proc.on("error", (err) => {
      console.error(`❌ Failed to start ${project}:`, err);
      reject(err);
    });

    resolve();
  });
}

(async () => {
  for (const service of services) {
    console.log(`🔧 Starting ${service.name} (${service.command})...`);
    await runNxTarget(service.name, service.command);
    await new Promise((res) => setTimeout(res, 1000)); // Delay for stability
  }

  console.log("🐘 Starting kafka-service (last)...");
  await runNxTarget("@source/kafka-service", "serve");
})();
