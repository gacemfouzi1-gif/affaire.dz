const git = require("isomorphic-git");
const fs = require("fs");
const path = require("path");

async function initAndCommit() {
  const dir = path.join(__dirname, "..");

  console.log("1. Initializing Git repository in:", dir);
  await git.init({ fs, dir, defaultBranch: "main" });
  console.log("✓ Git repository initialized with default branch 'main'");

  console.log("2. Scanning files to stage according to .gitignore...");
  const statusMatrix = await git.statusMatrix({ fs, dir });

  let addedCount = 0;
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    // If file exists in workdir and needs staging
    if (workdir === 2 && stage !== 2) {
      await git.add({ fs, dir, filepath });
      addedCount++;
    }
  }
  console.log(`✓ Staged ${addedCount} files`);

  console.log("3. Creating initial commit...");
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: "Fouzi Gacem",
      email: "gacemfouzi1@gmail.com",
    },
    message: "Initial commit: SubVault digital accounts & subscriptions e-commerce platform with real catalog and Super-Admin",
  });

  console.log("✓ Committed successfully! Commit SHA:", sha);

  // Read log to verify
  const commits = await git.log({ fs, dir, depth: 1 });
  console.log("✓ Verified commit:", commits[0].commit.message);
  console.log("✓ Author:", commits[0].commit.author.name, `<${commits[0].commit.author.email}>`);
}

initAndCommit().catch((err) => {
  console.error("Error during git initialization:", err);
  process.exit(1);
});
