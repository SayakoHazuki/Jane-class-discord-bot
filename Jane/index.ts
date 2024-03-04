import "dotenv/config";
import { startClient } from "./core/client.js";

if (!process.env.TOKEN) {
  console.log("No token found in .env file. Exiting.");
  process.exit(1);
}

if (process.argv.length >= 3 && process.argv.slice(2)[0] === "dev") {
  startClient(true);
} else {
  startClient(false);
}

console.log("Waking Jane up - NodeJS", process.version);
