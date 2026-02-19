import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), "..");
const command = process.argv[2] || "dev";
const extraArgs = process.argv.slice(3);

process.chdir(projectRoot);

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const args = [nextBin, command, ".", ...extraArgs];

const child = spawn(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
});

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }
    process.exit(code ?? 0);
});
