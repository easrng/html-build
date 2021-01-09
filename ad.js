import badgeMaker from "https://jspm.dev/badge-maker";
const TIMEOUT = 10000;
function jsonp(url) {
  return new Promise((resolve, reject) => {
    let callbackName = "jsonpCallback" + Math.floor(Math.random() * 100000);
    let timeoutTrigger = window.setTimeout(function() {
      window[callbackName] = Function.prototype;
      reject(new Error("Timeout"));
    }, TIMEOUT);
    window[callbackName] = function(data) {
      window.clearTimeout(timeoutTrigger);
      resolve(data);
    };
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    url = new URL(url);
    url.searchParams.set("callback", callbackName);
    script.src = url.href;
    script.onerror = e => {
      console.error(e);
      reject(new Error("Script error."));
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}
(async () => {
  let ad = await jsonp(
    "https://server.ethicalads.io/api/v1/decision/?publisher=html-build-easrng-us-to&ad_types=text-v1&div_ids=ad&keywords=electron|nw.js|web|html&campaign_types=paid|community|house&format=jsonp"
  );
  const s = document.querySelector(".sponsor");
  let i = new Image();
  i.src = ad.view_url;
  i.className = "pixel";
  let a = document.createElement("a");
  a.target="_blank"
  a.href = ad.link;
  a.innerHTML = badgeMaker.makeBadge({
    label: ad.copy.headline.trim().replace(/:$/, ""),
    message: ad.copy.content.trim() + " " + ad.copy.cta.trim(),
    color: "blue"
  });
  s.append(i,a)
})();
