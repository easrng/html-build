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
console.info("")
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
const worker = new Worker("worker.js");
const compilers = Comlink.wrap(worker);
/* global saveAs */
document.querySelector("body > form").onsubmit = async e => {
  e.preventDefault();
  let o = {
    html: await (await fetch(
      URL.createObjectURL(document.querySelector("#html").files[0])
    )).text(),
    icon: new Blob([document.querySelector("#icon").files[0]]),
    name: document.querySelector("#name").value
  };
  document.querySelector(
    "body > form > input[type=submit]:nth-child(7)"
  ).disabled = true;
  saveAs(await compilers.allTargets(o), o.name + ".zip");
  document.querySelector(
    "body > form > input[type=submit]:nth-child(7)"
  ).disabled = false;
};
