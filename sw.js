if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let o={};const l=e=>s(e,t),d={module:{uri:t},exports:o,require:l};i[t]=Promise.all(n.map((e=>d[e]||l(e)))).then((e=>(r(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-Bpa6KzEX.js",revision:null},{url:"assets/index-tIg6Y6ki.css",revision:null},{url:"index.html",revision:"2e25b1da1e4474ff269e64be1a14f5e4"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"logo.svg",revision:"9345fd554006d981648110581baf212c"},{url:"manifest.webmanifest",revision:"57fe84d5f3431d6408a583e64e8d91da"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
//# sourceMappingURL=sw.js.map
