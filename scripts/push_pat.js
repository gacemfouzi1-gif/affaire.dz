const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");

async function push() {
  const dir = path.join(__dirname, "..");
  const token = "ghp_JELA55NuCi9MqXAItWVK1MjPaVeukL317IbD";
  const url = "https://github.com/gacemfouzi1-gif/affaire.dz.git";

  console.log("Pushing via direct HTTPS socket (bypassing Windows Credential Manager)...");

  const res = await git.push({
    fs,
    http,
    dir,
    remote: "origin",
    url,
    ref: "main",
    onAuth: () => ({
      username: "gacemfouzi1-gif",
      password: token,
    }),
  });

  console.log("Push completed successfully:", JSON.stringify(res));
}

push().catch((err) => {
  console.error("Push error:", err);
  process.exit(1);
});
