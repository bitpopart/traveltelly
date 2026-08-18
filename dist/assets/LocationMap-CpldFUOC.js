import{r as u,j as x}from"./index-9oFfl1dr.js";import{L as t}from"./leaflet-src-BU67GAHr.js";import{u as i}from"./useMapProvider-NxoDpVav.js";import{g as w}from"./mapConfig-jMKUUHVu.js";const b=`data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.12 113.81">
  <defs>
    <style>
      .cls-1 {
        fill: #fc0;
      }
      .cls-2 {
        fill: #fff;
      }
      .cls-3 {
        fill: #27b0ff;
      }
    </style>
  </defs>
  <circle class="cls-2" cx="36.31" cy="49.53" r="19.75"/>
  <path class="cls-3" d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"/>
  <path class="cls-1" d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z"/>
</svg>`)}`,k=t.icon({iconUrl:b,iconSize:[42,62],iconAnchor:[21,62],popupAnchor:[0,-62],shadowUrl:void 0,shadowSize:void 0,shadowAnchor:void 0});console.log("🎯 Main marker icon created (inline SVG)");const l=r=>{const e=(r==null?void 0:r.color)||"#f59e0b",a=(r==null?void 0:r.icon)||"📍",n=(r==null?void 0:r.size)||"medium",c={small:"w-8 h-8 text-xl",medium:"w-10 h-10 text-2xl",large:"w-12 h-12 text-3xl"};return t.divIcon({html:`
      <div class="relative flex items-center justify-center ${c[n]}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <svg class="absolute w-full h-full" viewBox="0 0 24 36" fill="${e}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.6-5.4-12-12-12z"/>
        </svg>
        <span class="relative z-10 -mt-2" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${a}</span>
      </div>
    `,className:"custom-marker",iconSize:[40,40],iconAnchor:[20,40],popupAnchor:[0,-40]})},d={default:l({color:"#f59e0b",icon:"📍"}),photo:l({color:"#3b82f6",icon:"📷"}),location:l({color:"#10b981",icon:"📍"}),food:l({color:"#ef4444",icon:"🍽️"}),hotel:l({color:"#8b5cf6",icon:"🏨"}),activity:l({color:"#f59e0b",icon:"🎯"}),shop:l({color:"#ec4899",icon:"🛍️"}),nature:l({color:"#059669",icon:"🌲"}),culture:l({color:"#7c3aed",icon:"🏛️"}),selected:k};function C({onLocationSelect:r,initialLocation:e,readonly:a=!1}){const n=u.useRef(null),c=u.useRef(null),o=u.useRef(null),{mapProvider:h}=i();return u.useEffect(()=>{if(!n.current)return;const s=t.map(n.current).setView(e?[e.lat,e.lng]:[54.526,15.2551],e?15:4);c.current=s;const f=w(h);if(t.tileLayer(f.url,{attribution:f.attribution,maxZoom:f.maxZoom}).addTo(s),e){console.log("🗺️ Creating marker with icon:",d.selected);const m=t.marker([e.lat,e.lng],{icon:d.selected}).addTo(s).bindPopup(`📍 Location: ${e.lat.toFixed(6)}, ${e.lng.toFixed(6)}`).openPopup();o.current=m}return a||s.on("click",m=>{const{lat:p,lng:g}=m.latlng;o.current&&s.removeLayer(o.current);const v=t.marker([p,g],{icon:d.selected}).addTo(s).bindPopup(`📍 Selected: ${p.toFixed(6)}, ${g.toFixed(6)}`).openPopup();o.current=v,r(p,g)}),()=>{c.current&&(c.current.remove(),c.current=null)}},[e,r,a,h]),u.useEffect(()=>{if(!c.current||!e)return;o.current&&c.current.removeLayer(o.current);const s=t.marker([e.lat,e.lng],{icon:d.selected}).addTo(c.current).bindPopup(`📍 Location: ${e.lat.toFixed(6)}, ${e.lng.toFixed(6)}`).openPopup();o.current=s,c.current.setView([e.lat,e.lng],15)},[e]),x.jsxs("div",{className:"relative w-full h-full",children:[x.jsx("div",{ref:n,className:"w-full h-full"}),!a&&x.jsx("div",{className:"absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm z-[1000]",children:"📍 Click on the map to select location"})]})}export{C as L};
