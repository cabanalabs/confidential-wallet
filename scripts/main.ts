import {deployLocal} from "./deploy";

async function main () {
  await deployLocal();
}

main()
.then(() => process.exit())
.catch((error) => {
  console.error(error);
  process.exit(1);
});