import consoleEle from "./consoleEle.js";
[document.querySelector("h1")].forEach(e => {
  consoleEle(
    e.textContent.replace(/\s+/g, " ").trim(),
    e.tagName,
    e.id,
    e.className,
    "info"
  );
});
console.info("Status will appear below.");
console.info("");
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
const worker = new Worker("worker.js");
const compilers = Comlink.wrap(worker);
/* global saveAs */
document.querySelector("body > form").onsubmit = async e => {
  e.preventDefault();
  let o = {
    html: new Blob([document.querySelector("#html").files[0]]),
    icon: new Blob([document.querySelector("#icon").files[0]]),
    name: document.querySelector("#name").value
  };
  document.querySelector("body > form > input[type=submit]").disabled = true;
  let targets = [
    ...document.querySelector("body > form > select").selectedOptions
  ].map(e => e.value);
  for (var target of targets) {
    var [target, arch] = target.split("-");
    saveAs(
      await compilers[target]({ ...o, arch }),
      o.name + (arch ? " " + arch : "") + " - " + target + ".zip"
    );
  }
  document.querySelector("body > form > input[type=submit]").disabled = false;
};
