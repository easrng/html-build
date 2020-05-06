(async () => {
  return {
    html: await (await fetch(
      URL.createObjectURL(document.querySelector("#html").files[0])
    )).text(),
    icon: new Blob([document.querySelector("#icon").files[0]]),
    name:document.querySelector("#name").value
  };
})();
