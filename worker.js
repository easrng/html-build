/* global JSZip Comlink */
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("https://stuk.github.io/jszip/dist/jszip.js");

let strings;

function genUUID() {
  // Reference: https://stackoverflow.com/a/2117523/709884
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, s => {
    const c = Number.parseInt(s, 10);
    return (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16);
  });
}

function b2d(b) {
  return new Promise(c => {
    let f = new FileReader();
    f.onload = e => c(f.result);
    f.readAsDataURL(b);
  });
}
let logger=(e)=>console.log(e);
let compilers = {setLogger:fn=>logger=fn, setStrings:s=>strings=s};
let allNwjs = {
  windows64: async () => {
    logger(strings.logLoadingWindows64NwJs);
    let b = await (await fetch(
      "https://files.catbox.moe/9xzjz2.zip"
    )).blob();
    logger(strings.logLoadedWindows64NwJs);
    return b;
  },
  windows32: async () => {
    logger(strings.logLoadingWindows32NwJs);
    let b = await (await fetch(
      "https://files.catbox.moe/axnv2g.zip"
    )).blob();
    logger(strings.logLoadedWindows32NwJs);
    return b;
  },
  mac64: async () => {
    logger(strings.logLoadingMacNwJs);
    let b = await (await fetch(
      "https://files.catbox.moe/mdaj0c.zip"
    )).blob();
    logger(strings.logLoadedMacNwJs);
    return b;
  },
  linux64: async () => {
    logger(strings.logLoadingLinux64NwJs);
    let b = await (await fetch(
      "https://files.catbox.moe/fjl7gh.zip"
    )).blob();
    logger(strings.logLoadedLinux64NwJs);
    return b;
  },
  linux32: async () => {
    logger(strings.logLoadingLinux32NwJs);
    let b = await (await fetch(
      "https://files.catbox.moe/7kae6q.zip"
    )).blob();
    logger(strings.logLoadedLinux32NwJs);
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
  let nwjs = await getNwjs("windows" + o.arch);
  let zip = await JSZip.loadAsync(nwjs);
  let prefix = Object.keys(zip.files)
    .join("\n")
    .match(/^(.+\/)credits.html$/m)[1];
  await Promise.all(
    zip
      .folder(prefix)
      .filter(e => true)
      .map(async e => {
        zip.file("internal/" + e.name, await e.async("uint8array"));
      })
  );
  zip.remove(prefix);
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
  zip.file("Launch.bat", `START "" ${prefix.replace(/\//g, "\\")}nw.exe`);
  logger(strings.logGeneratingAppForWindows);
  let zipBlob = await zip.generateAsync({ type: "blob" });
  logger(strings.logGeneratedAppForWindows);
  return zipBlob;
};

compilers.linux = async o => {
  let nwjs = await getNwjs("linux" + o.arch);
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
  logger(strings.logGeneratingAppForLinux);
  let zipBlob = await zip.generateAsync({ type: "blob" });
  logger(strings.logGeneratedAppForLinux);
  return zipBlob;
};

compilers.mac = async o => {
  let nwjs = await getNwjs("mac64");
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
  logger(strings.logGeneratingAppForMac);
  let zipBlob = await zip.generateAsync({ type: "blob" });
  logger(strings.logGeneratedAppForMac);
  return zipBlob;
};

compilers.ios = async o => {
  let ic = new OffscreenCanvas(512, 512);
  ic.getContext("2d").drawImage(
    await createImageBitmap(o.icon),
    0,
    0,
    512,
    512
  );
  ic = await ic.convertToBlob({ type: "image/png" });
  let zip = new JSZip();
  zip.file(
    "Click to install.mobileconfig",
    new Blob(
      [
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadOrganization</key>
    <string>HTML Build</string>
    <key>PayloadIdentifier</key>
    <string>me.glitch.html-build.ios.app.${genUUID()}</string>
    <key>PayloadUUID</key>
    <string>${genUUID()}</string>
    <key>PayloadDisplayName</key>
    <string>${o.name}</string>
    <key>PayloadDescription</key>
    <string>App made with HTML Build.</string>
    <key>PayloadRemovalDisallowed</key>
    <false />
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>PayloadType</key>
        <string>com.apple.webClip.managed</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>me.glitch.html-build.ios.icon.${genUUID()}</string>
        <key>PayloadUUID</key>
        <string>${genUUID()}</string>
        <key>PayloadDisplayName</key>
        <string>App</string>
        <key>PayloadDescription</key>
        <string>App made with HTML Build.</string>
        <key>PayloadOrganization</key>
        <string>HTML Build</string>
        <key>URL</key>
        <string>${await b2d(o.html)}</string>
        <key>Label</key>
        <string>${o.name.replace(/[^a-zA-Z0-9\-_]/, function(i) {
          return "&#" + i.charCodeAt(0) + ";";
        })}</string>
        <key>Icon</key>
        <data>${(await b2d(ic)).split(",")[1]}</data>
        <key>IsRemovable</key>
        <true />
        <key>FullScreen</key>
        <true />
      </dict>
    </array>
  </dict>
</plist>
`
      ],
      { type: "application/x-apple-aspen-config" }
    )
  );
  logger(strings.logGeneratingAppForIos);
  let zipBlob = await zip.generateAsync({ type: "blob" });
  logger(strings.logGeneratedAppForIos);
  return zipBlob;
};

Comlink.expose(compilers);
