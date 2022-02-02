import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import strings from "./strings.js";
window.strings=strings
for(let e of document.querySelectorAll('[data-l10n-string]')) e.textContent=strings[e.dataset.l10nString]
stats.beacon("page-load")
const worker = new Worker("worker.js");
const compilers = Comlink.wrap(worker);
const log=document.querySelector("#log");
log.placeholder=strings.logPlaceholder;
compilers.setLogger(Comlink.proxy(text=>{
  log.value+=text+"\n"
}));
compilers.setStrings(Object.assign({}, strings));
/* global saveAs */
document.querySelector("form").onsubmit = async e => {
  e.preventDefault();
  let o = {
    html: document.querySelector("#html").files[0],
    icon: document.querySelector("#icon").files[0],
    name: document.querySelector("#name").value
  };
  document.querySelector("form input[type=submit]").disabled = true;
  stats.beacon("build-start")
  document.querySelector("#setCursor").textContent="*{cursor:wait!important;}"
  let targets = [
    ...document.querySelector("form select").selectedOptions
  ].map(e => e.value);
  for (var target of targets) {
    var [target, arch] = target.split("-");
    saveAs(
      await compilers[target]({ ...o, arch }),
      o.name + (arch ? " " + arch : "") + " - " + target + ".zip"
    );
  }
  document.querySelector("form input[type=submit]").disabled = false;
  stats.beacon("build-done")
  document.querySelector("#setCursor").textContent="";
};
let defaultParams = Object.fromEntries([
  ...new URLSearchParams(location.search).entries()
]);
document.querySelector("#name").value = defaultParams.name || "";
async function createFileListFromString(str) {
  str=str.split("|");
  let list = new DataTransfer();
  let file = new File([await(await fetch(str[1])).blob()], str[0]);
  list.items.add(file);
  return list.files;
}
if(defaultParams.icon)createFileListFromString(defaultParams.icon).then(e=>document.querySelector("#icon").files=e)
if(defaultParams.html)createFileListFromString(defaultParams.html).then(e=>document.querySelector("#html").files=e)
