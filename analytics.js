// Create a class for the element
class EasrngStats extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    let overrideDNT = localStorage.getItem("overrideDNT");
    if (overrideDNT == null && navigator.doNotTrack == "1") {
      shadow.insertAdjacentHTML(
        "beforeEnd",
        `<div class="box" style="background: white;position: fixed;bottom: 0;left: 0;margin: 1rem;padding: 0.5rem;max-width: 25rem;border: 1px solid #333;border-radius: 4px;min-height: 8rem;display: flex;flex-direction: column;width: calc(100% - 2rem);box-sizing: border-box;"><p><b>Hello!</b> I like to see how much traffic my site is getting, so I collect some statistics. I don't track you, or collect any identifying information, but since you use Do Not Track, I figured I should ask before I collect anything.</p><div style="display: flex;justify-content: space-evenly;"><button class="nothanks">No Thanks</button> <button class="allow">Allow</button></div></div>`
      );
      let e = shadow.querySelector(`.box`);
      e.querySelector(`.nothanks`).addEventListener("click", () => {
        localStorage.setItem("overrideDNT", (overrideDNT = "1"));
        e.remove();
      });
      e.querySelector(`.allow`).addEventListener("click", () => {
        localStorage.setItem("overrideDNT", (overrideDNT = "0"));
        e.remove();
      });
    }
  }
}

// Define the new element
customElements.define("easrng-stats-control", EasrngStatsControl);
export site => event => {
        if ((overrideDNT || navigator.doNotTrack) != "1")
          navigator.sendBeacon(
            "https://collect.easrng.workers.dev/",
            JSON.stringify({ event, site })
          );
      };