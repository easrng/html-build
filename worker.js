/* global JSZip Comlink */
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("https://stuk.github.io/jszip/dist/jszip.js");

function genUUID() {
        // Reference: https://stackoverflow.com/a/2117523/709884
        return ("10000000-1000-4000-8000-100000000000").replace(/[018]/g, s => {
            const c = Number.parseInt(s, 10)
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        })
}

let compilers = {};
let allNwjs = {
  windows: async () => {
    console.log("Loading Windows nw.js");
    let b = await (await fetch(
      "https://cdn.glitch.com/81b8b52c-881a-4697-bf55-08cc61865172%2Fnwjs-v0.45.5-win-x64.zip?v=1589978196234"
    )).blob();
    console.log("Loaded Windows nw.js");
    return b;
  },
  mac: async () => {
    console.log("Loading Mac nw.js");
    let b = await (await fetch(
      "https://cdn.glitch.com/81b8b52c-881a-4697-bf55-08cc61865172%2Fnwjs-v0.45.5-osx-x64.zip?v=1589978183687"
    )).blob();
    console.log("Loaded Mac nw.js");
    return b;
  },
  linux: async () => {
    console.log("Loading Linux nw.js");
    let b = await (await fetch(
      "https://cdn.glitch.com/81b8b52c-881a-4697-bf55-08cc61865172%2Fnwjs-v0.45.5-linux-x64.zip?v=1588776347141"
    )).blob();
    console.log("Loaded Linux nw.js");
    return b;
  }
};

async function getNwjs(version) {
  if (typeof allNwjs[version] == "function") {
    allNwjs[version] = allNwjs[version]();
  }
  return await allNwjs[version];
}

compilers.windows = async o => {
  let nwjs = await getNwjs("windows");
  let zip = await JSZip.loadAsync(nwjs);
  let prefix = Object.keys(zip.files)
    .join("\n")
    .match(/^(.+\/)credits.html$/m)[1];
  await Promise.all(zip.folder(prefix).filter(e=>true).map(async e => {
    zip.file("internal/" + e.name, await e.async("uint8array"));
  }));
  zip.remove(prefix)
  prefix = Object.keys(zip.files)
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
  zip.file("Launch.bat",`START "" ${prefix.replace(/\//g,"\\")}nw.exe`)
  console.log("Generating app for Windows...");
  let zipBlob = await zip.generateAsync({ type: "blob" });
  console.log("Generated app for Windows!");
  return zipBlob;
};

compilers.linux = async o => {
  let nwjs = await getNwjs("linux");
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
  console.log("Generating app for Linux...");
  let zipBlob = await zip.generateAsync({ type: "blob" });
  console.log("Generated app for Linux!");
  return zipBlob;
};

compilers.mac = async o => {
  let nwjs = await getNwjs("mac");
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
  console.log("Generating app for Mac...");
  let zipBlob = await zip.generateAsync({ type: "blob" });
  console.log("Generated app for Mac!");
  return zipBlob;
};

Comlink.expose(compilers);
