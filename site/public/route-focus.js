(function () {
  const focusKey = "vault-cross-search:route-focus";

  function liveRegion() {
    let region = document.getElementById("route-announcer");
    if (!region) {
      region = document.createElement("div");
      region.id = "route-announcer";
      region.className = "sr-only";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      document.body.append(region);
    }
    return region;
  }

  function focusRouteHeading() {
    if (sessionStorage.getItem(focusKey) !== "1") return;
    requestAnimationFrame(function () {
      const heading = document.querySelector("h1");
      if (!(heading instanceof HTMLElement)) return;
      heading.focus({ preventScroll: false });
      liveRegion().textContent = `${heading.textContent || document.title} page loaded`;
    });
  }

  document.addEventListener("click", function (event) {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin) return;
    if (destination.pathname === location.pathname && destination.search === location.search && destination.hash) return;
    sessionStorage.setItem(focusKey, "1");
  }, true);

  window.addEventListener("pageshow", focusRouteHeading);
  document.addEventListener("vault-route-ready", focusRouteHeading);
  document.addEventListener("DOMContentLoaded", liveRegion, { once: true });
}());
