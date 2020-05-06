function consoleEle(selector) {
  let e = document.createElement("h1");
  document.body.appendChild(e);
  let s = getComputedStyle(e).cssText;
  e.remove();
  console.log("%cHello", s);
}
