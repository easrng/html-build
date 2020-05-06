export default function consoleEle(text, tag, id, klass, method) {
  let e = document.createElement(tag||"pre");
  e.id = id||"";
  e.className = klass||"";
  e.style.display="none";
  document.body.appendChild(e);
  let s = getComputedStyle(e).cssText.replace(/display:[^;]+;/g,"");
  e.remove();
  console[method||"log"]("%c"+text, s);
}
