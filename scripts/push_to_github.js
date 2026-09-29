const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const dir = path.join(__dirname, "..");

  console.log("\n==========================================");
  console.log("  🚀 Push SubVault to Your GitHub Account ");
  console.log("==========================================\n");

  const repoUrl = await ask("1. Paste your GitHub Repository HTTPS URL\n   (e.g., https://github.com/YourUsername/subvault.git):\n   > ");
  if (!repoUrl.trim()) {
    console.error("❌ Repository URL cannot be empty.");
    process.exit(1);
  }

  const username = await ask("\n2. Your GitHub Username:\n   > ");
  const token = await ask("\n3. Your GitHub Personal Access Token (or password):\n   (Generate one at: https://github.com/settings/tokens if 2FA is enabled)\n   > ");

  console.log("\nConnecting to GitHub and pushing 'main' branch...");

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      url: repoUrl.trim(),
      ref: "main",
      onAuth: () => ({
        username: username.trim(),
        password: token.trim(),
      }),
    });

    console.log("\n✅ Success! Your code is now live on GitHub!");
    console.log("Now go to https://vercel.com/new and import this repository to deploy.\n");
  } catch (err) {
    console.error("\n❌ Push failed:", err.message);
    console.log("\nAlternative: If you have Git CLI or GitHub Desktop installed, simply run:");
    console.log(`   git remote add origin ${repoUrl.trim()}`);
    console.log("   git push -u origin main\n");
  } finally {
    rl.close();
  }
}

main();
