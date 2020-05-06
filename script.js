/* global JSZip */
let compilers = {};
let allNwjs = {
  windows: (async () => {
    return await (await fetch(
      "https://yacdn.org/serve/https://dl.nwjs.io/v0.45.5/nwjs-v0.45.5-win-x64.zip"
    )).blob();
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
  let zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
};

(async () => {
  let o = {
    name: "Test App",
    icon: "https://cdn2.scratch.mit.edu/get_image/user/default_90x90.png",
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Test App</title>
  </head>
  <body>
  <h1>Hello, World!</h1>
  </body>
</html>`
  };
  o.icon = await (await fetch("https://yacdn.org/serve/" + o.icon)).blob();

  location.href = URL.createObjectURL(await compilers.windows(o));
})();
