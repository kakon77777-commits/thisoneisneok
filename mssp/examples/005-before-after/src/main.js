// The same program as baseline/monolith.js, restructured.
//
//   node src/main.js [--csv]
//   node src/main.js --measure    the comparison table
import { known, mayProduce } from "./SCL/policy.js";
import { reading } from "./SMS/model.js";
import { summarise } from "./SMS/summarise.js";
import { validate } from "./SMS/validate.js";
import { measure, renderTable } from "./DMS/measure.js";

const READINGS = [
  reading("north", 21.4, "09:00"),
  reading("north", 22.1, "10:00"),
  reading("south", null, "09:00"),
  reading("south", 19.8, "10:00"),
  reading("roof", 84.2, "09:00"),
];

async function main(argv) {
  if (argv.includes("--measure")) {
    console.log(renderTable(await measure()));
    return 0;
  }

  // Derived from policy, not a branch. The first version of this line read
  //   argv.includes("--csv") ? "formats/csv" : "formats/text"
  // which is a dispatch branch in the core — exactly the coupling the
  // restructuring exists to remove, and it meant adding a format touched this
  // file after all. The measurement caught it: --json printed text.
  const asked = argv.find((a) => a.startsWith("--") && known().includes(`formats/${a.slice(2)}`));
  const wanted = asked ? `formats/${asked.slice(2)}` : "formats/text";
  if (!mayProduce(wanted)) {
    console.log(`\n  ${wanted} is not permitted by policy`);
    return 1;
  }

  // Loaded on demand, and only the one asked for.
  const { render } = await import(`./TMS/${wanted}.js`);
  const { kept, dropped } = validate(READINGS);

  console.log(`\n== readings (${wanted.split("/")[1]})`);
  console.log(render(summarise(kept), dropped));
  return 0;
}

process.exit(await main(process.argv.slice(2)));
