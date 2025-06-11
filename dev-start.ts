import { spawn } from "child_process";

// 👇 Run docker-compose if Kafka broker is not running
async function ensureKafkaRunning(): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = spawn(
      "docker",
      ["ps", "--filter", "name=broker", "--format", "{{.Names}}"],
      {
        shell: true,
      }
    );

    let output = "";
    check.stdout.on("data", (data) => (output += data.toString()));

    check.on("close", () => {
      if (output.includes("broker")) {
        console.log("✅ Kafka broker container is already running.");
        return resolve();
      }

      console.log("🐳 Kafka broker not running. Starting docker-compose...");
      const compose = spawn("docker-compose", ["up", "-d"], {
        stdio: "inherit",
        shell: true,
      });

      compose.on("close", (code) => {
        if (code === 0) {
          console.log("✅ Docker containers started.");
          resolve();
        } else {
          reject(new Error("❌ Failed to start docker containers."));
        }
      });
    });

    check.on("error", (err) => {
      reject(err);
    });
  });
}

type Service = {
  name: string;
  command: string;
};

const services: Service[] = [
  { name: "auth-service", command: "serve" },
  { name: "@source/product-service", command: "serve" },
  { name: "@./api-gateway", command: "serve" },
  { name: "@source/user-ui", command: "dev" },
  { name: "@source/seller-ui", command: "dev" },
];

function runNxTarget(
  project: string,
  command: string,
  envVars: Record<string, string> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["nx", command, project], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...envVars },
    });

    proc.on("error", (err) => {
      console.error(`❌ Failed to start ${project}:`, err);
      reject(err);
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`❌ ${project} exited with code ${code}`));
    });
  });
}

function runNpmCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("🧹 Running npm run cache...");
    const proc = spawn("npm", ["run", "cache"], {
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("✅ npm run cache completed.");
        resolve();
      } else {
        reject(new Error("❌ npm run cache failed."));
      }
    });

    proc.on("error", (err) => reject(err));
  });
}

(async () => {
  try {
    await runNpmCache(); // 👈 Run this FIRST
    await ensureKafkaRunning(); // 👈 Then check/start Docker

    for (const service of services) {
      console.log(`🔧 Starting ${service.name} (${service.command})...`);

      const env: Record<string, string> =
        service.name === "@source/seller-ui" ? { PORT: "3001" } : {};

      await runNxTarget(service.name, service.command, env);
      await new Promise((res) => setTimeout(res, 1000)); // Delay for stability
    }

    console.log("🐘 Starting kafka-service (last)...");
    await runNxTarget("@source/kafka-service", "serve");
  } catch (err) {
    console.error("❌ Error during startup:", err);
    process.exit(1);
  }
})();
