import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { exit } from "process";
import { loadConfigFromFile } from "vite-plus";

// ---------- utils ----------
const run = (cmd: string) => {
	console.log(">", cmd);

	try {
		execSync(cmd, { stdio: "inherit" });
	} catch (error) {
		const err = error as any;
		if (cmd.includes("robocopy")) {
			if (err.status > 7) {
				exit(err.sta);
			}
		} else if (err.status !== 0) {
			exit(err.status);
		}
	}
};

const readEnvFile = () => {
	const raw = fs.readFileSync(".smb", "utf-8");
	const out: Record<string, string> = {};

	for (const line of raw.split("\n")) {
		const l = line.trim();
		if (!l || l.startsWith("#")) continue;

		const [k, v] = l.split("=");
		out[k.trim()] = v.trim();
	}

	return out;
};

const getArg = (args: string[], name: string): string | undefined => {
	const i = args.indexOf(name);
	return i !== -1 ? args[i + 1] : undefined;
};

// ---------- vite ----------
const getVitePaths = async (script: string | null = null) => {
	let scriptBase = null;
	if (script) {
		const raw = fs.readFileSync("package.json", "utf-8");
		const data = JSON.parse(raw);
		if ("scripts" in data && script in data.scripts) {
			const cmd = data.scripts[script];
			const args = cmd.split(/\s+/);
			scriptBase = getArg(args, "--base");
		}
	}
	const res = await loadConfigFromFile({ command: "build", mode: "production" }, undefined);

	const cfg = res?.config ?? {};

	const outDir = cfg.build?.outDir ?? "dist";
	let base = scriptBase ?? cfg.base ?? "/";

	base = base.replace(/^\/+|\/+$/g, "");
	const subdir = base || "";

	return { outDir, subdir };
};

const deployWindows = (host: string, subdir: string, outDir: string) => {
	const { server, share } = parseHost(host);
	const target = path.win32.join(`\\\\${server}\\${share}`, subdir);

	run(`if not exist "${target}" mkdir "${target}"`);
	run(`robocopy ${outDir}\\assets "${target}\\assets" /MIR /W:0 /R:0`);
	run(`robocopy ${outDir} "${target}" /E /IS /IT /XD assets`);
};

const parseHost = (host: string) => {
	// //SERVER/SHARE → SERVER + SHARE
	const parts = host.replace("//", "").split("/");
	return {
		server: parts[0],
		share: parts[1],
	};
};

const deployLinux = (host: string, subdir: string, outDir: string) => {
	const { server, share } = parseHost(host);

	const baseCmd = `//${server}/${share} -N`; // anonymous

	// create target dir
	run(`smbclient ${baseCmd} -c "mkdir ${subdir}" >/dev/null 2>&1`);

	// --- mirror assets ---
	// delete remote assets dir completely (simple + safe)
	run(`smbclient ${baseCmd} -c "cd ${subdir}/assets; rm *" >/dev/null 2>&1`);
	run(`smbclient ${baseCmd} -c "cd ${subdir}; rmdir assets" >/dev/null 2>&1`);

	// recreate + upload
	run(`smbclient ${baseCmd} -c "cd ${subdir}; mkdir assets" >/dev/null 2>&1`);

	// --- upload root (overwrite only) ---
	run(`smbclient ${baseCmd} -c "lcd ${outDir}; cd ${subdir}; prompt OFF; recurse ON; mput *" >/dev/null 2>&1`);
};

// ---------- main ----------
const main = async () => {
	const cfg = readEnvFile();
	let { outDir, subdir } = await getVitePaths();

	console.log("outDir:", outDir);
	console.log("subdir:", subdir || "(root)");

	run("vpr build");

	if (os.platform() === "win32") {
		deployWindows(cfg.HOST, subdir, outDir);
	} else {
		deployLinux(cfg.HOST, subdir, outDir);
	}

	console.log("Deploy done");
};

main().catch(console.error);
