import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
const worker = new Worker("worker.js");
const compilers = Comlink.wrap(worker);

document.querySelector("body > form").onsubmit=(async e => {
  e.preventDefault()
  lo
  saveAs(await compilers.allTargets(o),o.name+".zip");
})
