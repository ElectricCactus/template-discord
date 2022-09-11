import { startBot } from "./bot";

async function main() {
  await startBot();
}

if (require.main === module) {
  main();
}
