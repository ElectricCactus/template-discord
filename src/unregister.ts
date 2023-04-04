import { unregisterCommands } from "./register";

if (require.main === module) {
  unregisterCommands();
}
