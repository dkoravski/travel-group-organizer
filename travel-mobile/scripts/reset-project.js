#!/usr/bin/env node

/**
 * This script resets the project to a blank state.
 * It deletes or moves the /src/app, /src/components, /src/hooks, and
 * /src/constants directories to /app-example based on user input, then creates
 * a new /src/app directory with index.tsx and _layout.tsx files.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const srcRoot = path.join(root, "src");
const oldDirs = ["app", "components", "hooks", "constants"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`Created /${exampleDir} directory.`);
    }

    for (const dir of oldDirs) {
      const oldDirPath = path.join(srcRoot, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`Moved /src/${dir} to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`Deleted /src/${dir}.`);
        }
      } else {
        console.log(`/src/${dir} does not exist, skipping.`);
      }
    }

    const newAppDirPath = path.join(srcRoot, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\nNew /src/app directory created.");

    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("src/app/index.tsx created.");

    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("src/app/_layout.tsx created.");

    console.log("\nProject reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);
