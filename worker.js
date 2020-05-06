/* global JSZip Comlink */
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("https://stuk.github.io/jszip/dist/jszip.js");

let compilers = {};
let allNwjs = {
  windows: (async () => {
    console.log("Loading Windows nw.js")
    let b=await (await fetch(
      "https://yacdn.org/serve/https://dl.nwjs.io/v0.45.5/nwjs-v0.45.5-win-x64.zip"
    )).blob();
    console.log("Loaded Windows nw.js")
    return b
  })(),
  mac: (async () => {
    console.log("Loading Mac nw.js")
    let b= await (await fetch(
      "https://yacdn.org/serve/https://dl.nwjs.io/v0.45.5/nwjs-v0.45.5-osx-x64.zip"
    )).blob();
    console.log("Loaded Mac nw.js")
    return b
  })(),
  linux: (async () => {
    console.log("Loading Linux nw.js")
    let b= await (await fetch(
      "https://cdn.glitch.com/81b8b52c-881a-4697-bf55-08cc61865172%2Fnwjs-v0.45.5-linux-x64.zip?v=1588776347141"
    )).blob();
    console.log("Loaded Linux nw.js")
    return b
  })()
};

compilers.windows = async o => {
  let nwjs = await allNwjs.windows;
  let zip = await JSZip.loadAsync(nwjs);
  let prefix = Object.keys(zip.files)
    .join("\n")
    .match(/^(.+\/)credits.html$/m)[1];
  zip.file(
    prefix + "package.json",
    JSON.stringify({
      name: o.name,
      main: "index.html",
      icons: { "16": "icon.png" }
    })
  );
  zip.file(prefix + "icon.png", o.icon);
  zip.file(prefix + "index.html", o.html);
  console.log("Generating app for Windows...")
  let zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
};

compilers.linux = async o => {
  let nwjs = await allNwjs.linux;
  let zip = await JSZip.loadAsync(nwjs);
  let prefix = Object.keys(zip.files)
    .join("\n")
    .match(/^(.+\/)credits.html$/m)[1];
  zip.file(
    prefix + "package.json",
    JSON.stringify({
      name: o.name,
      main: "index.html",
      icons: { "16": "icon.png" }
    })
  );
  zip.file(prefix + "icon.png", o.icon);
  zip.file(prefix + "index.html", o.html);
  return zip.generateAsync({ type: "blob" });
};

compilers.mac = async o => {
  let nwjs = await allNwjs.mac;
  let zip = await JSZip.loadAsync(nwjs);
  let prefix =
    Object.keys(zip.files)
      .join("\n")
      .match(/^(.+\/)credits.html$/m)[1] +
    "nwjs.app/Contents/Resources/app.nw/";
  zip.folder(prefix);
  zip.file(
    prefix + "package.json",
    JSON.stringify({
      name: o.name,
      main: "index.html",
      icons: { "16": "icon.png" }
    })
  );
  zip.file(prefix + "icon.png", o.icon);
  zip.file(prefix + "index.html", o.html);
  return zip.generateAsync({ type: "blob" });
};

compilers.allTargets = async o => {
  let [linux, windows, mac] = await Promise.all([
    compilers.linux(o),
    compilers.windows(o),
    compilers.mac(o)
  ]);
  let zip = new JSZip();
  zip.file("windows.zip", windows);
  zip.file("linux.zip", linux);
  zip.file("mac.zip", mac);
  return zip.generateAsync({ type: "blob" });
};

Comlink.expose(compilers)