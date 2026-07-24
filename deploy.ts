import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Parse command-line arguments (e.g. --dir=dist --branch=gh-pages)
function parseArgs(): { dir: string; branch: string; message: string } {
	const args = process.argv.slice(2);
	const options = {
		dir: "build",
		branch: "build",
		message: "🚀 Deploy commit",
	};

	args.forEach((arg) => {
		if (arg.startsWith("--dir=")) {
			options.dir = arg.split("=")[1];
		} else if (arg.startsWith("--branch=")) {
			options.branch = arg.split("=")[1];
		} else if (arg.startsWith("--message=")) {
			options.message = arg.split("=")[1];
		}
	});

	return options;
}

function run(command: string, args: string[] = [], cwd?: string): void {
	console.log(`> ${command} ${args.join(" ")}`.trim());
	execFileSync(command, args, { stdio: "inherit", cwd });
}

function deploy(): void {
	const { dir, branch, message } = parseArgs();
	const targetDir = path.resolve(process.cwd(), dir);
	const tempGitBackup = path.resolve(process.cwd(), `.git_${dir}_tmp`);

	console.log(`🚀 Deploying folder "${dir}" to branch "${branch}"...\n`);

	// 1. Save worktree `.git` marker if it exists before rebuild wipes it
	const worktreeGitFile = path.join(targetDir, ".git");
	if (fs.existsSync(worktreeGitFile)) {
		fs.renameSync(worktreeGitFile, tempGitBackup);
	}

	try {
		// 2. Clean up any existing worktree reference
		try {
			execFileSync("git", ["worktree", "remove", "--force", dir], { stdio: "ignore" });
		} catch {
			// Ignore error if worktree doesn't exist yet
		}

		fs.rmSync(targetDir, { recursive: true, force: true });
		fs.mkdirSync(targetDir, { recursive: true });

		// 3. Re-add the worktree without checking out existing files
		run("git", ["worktree", "add", dir, branch, "--no-checkout"]);

		// 4. Restore the worktree `.git` marker if we backed it up
		if (fs.existsSync(tempGitBackup)) {
			fs.renameSync(tempGitBackup, worktreeGitFile);
		}

		run("vp build");

		// 5. Commit and push inside the target folder
		run("git", ["add", "-A"], targetDir);

		try {
			run("git", ["commit", "-m", message], targetDir);
		} catch {
			console.log("⚠️ No changes to commit.");
		}

		run("git", ["push", "origin", branch, "-f"], targetDir);

		console.log(`\n✅ Successfully deployed ${dir} to ${branch}!`);
	} catch (error) {
		console.error("\n❌ Deployment failed:", error);
		process.exit(1);
	} finally {
		fs.rmSync(targetDir, { recursive: true, force: true });
		// Cleanup temporary backup file if left over
		if (fs.existsSync(tempGitBackup)) {
			fs.rmSync(tempGitBackup, { force: true });
		}
	}
}

deploy();
