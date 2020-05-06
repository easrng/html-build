(async () => {
  let apk = await (await fetch(
    "https://cdn.glitch.com/81b8b52c-881a-4697-bf55-08cc61865172%2FApp.apk?v=1588794922845"
  )).blob();
  let zip = await JSZip.loadAsync(apk);
  window.zip = zip;
})();
