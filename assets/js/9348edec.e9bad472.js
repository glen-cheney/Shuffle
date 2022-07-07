"use strict";(globalThis.webpackChunkshuffle_docs=globalThis.webpackChunkshuffle_docs||[]).push([[947],{876:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>d});var n=r(2784);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=s(r),d=a,m=c["".concat(p,".").concat(d)]||c[d]||f[d]||l;return r?n.createElement(m,i(i({ref:t},u),{},{components:r})):n.createElement(m,i({ref:t},u))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,i=new Array(l);i[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var s=2;s<l;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},5317:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>f,frontMatter:()=>l,metadata:()=>o,toc:()=>s});var n=r(8427),a=(r(2784),r(876));const l={sidebar_position:5},i="Filters",o={unversionedId:"filters",id:"filters",title:"Filters",description:"Filter by a group",source:"@site/docs/filters.md",sourceDirName:".",slug:"/filters",permalink:"/Shuffle/docs/filters",draft:!1,editUrl:"https://github.com/Vestride/Shuffle/tree/main/apps/website/docs/docs/filters.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Configuring Shuffle",permalink:"/Shuffle/docs/configuration"},next:{title:"Advanced filters",permalink:"/Shuffle/docs/advanced-filters"}},p={},s=[{value:"Filter by a group",id:"filter-by-a-group",level:2},{value:"Filter by multiple groups",id:"filter-by-multiple-groups",level:2},{value:"Show all items",id:"show-all-items",level:2},{value:"Overrides",id:"overrides",level:2}],u={toc:s};function f(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"filters"},"Filters"),(0,a.kt)("h2",{id:"filter-by-a-group"},"Filter by a group"),(0,a.kt)("p",null,"Use the ",(0,a.kt)("inlineCode",{parentName:"p"},"filter()")," method. If, for example, you wanted to show only items that match ",(0,a.kt)("inlineCode",{parentName:"p"},'"space"'),", you would do this:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"shuffleInstance.filter('space');\n")),(0,a.kt)("h2",{id:"filter-by-multiple-groups"},"Filter by multiple groups"),(0,a.kt)("p",null,"Show multiple groups at once by using an array."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"shuffleInstance.filter(['space', 'nature']);\n")),(0,a.kt)("p",null,"By default, this will show items that match ",(0,a.kt)("inlineCode",{parentName:"p"},"space")," ",(0,a.kt)("em",{parentName:"p"},"or")," ",(0,a.kt)("inlineCode",{parentName:"p"},"nature"),". To show only groups that match ",(0,a.kt)("inlineCode",{parentName:"p"},"space")," ",(0,a.kt)("em",{parentName:"p"},"and")," ",(0,a.kt)("inlineCode",{parentName:"p"},"nature"),", set the ",(0,a.kt)("inlineCode",{parentName:"p"},"filterMode")," option to ",(0,a.kt)("inlineCode",{parentName:"p"},"Shuffle.FilterMode.ALL"),"."),(0,a.kt)("h2",{id:"show-all-items"},"Show all items"),(0,a.kt)("p",null,"To go back to having no items filtered, you can call ",(0,a.kt)("inlineCode",{parentName:"p"},"filter()")," without a parameter, or use ",(0,a.kt)("inlineCode",{parentName:"p"},"Shuffle.ALL_ITEMS")," (which by default is the string ",(0,a.kt)("inlineCode",{parentName:"p"},'"all"'),")."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"shuffleInstance.filter(Shuffle.ALL_ITEMS); // or .filter()\n")),(0,a.kt)("h2",{id:"overrides"},"Overrides"),(0,a.kt)("p",null,"You can override both ",(0,a.kt)("inlineCode",{parentName:"p"},"Shuffle.ALL_ITEMS")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"Shuffle.FILTER_ATTRIBUTE_KEY")," if you want."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"// Defaults\nShuffle.ALL_ITEMS = 'all';\nShuffle.FILTER_ATTRIBUTE_KEY = 'groups';\n\n// You can change them to something else.\nShuffle.ALL_ITEMS = 'any';\nShuffle.FILTER_ATTRIBUTE_KEY = 'categories';\n")),(0,a.kt)("p",null,"Then you would have to use ",(0,a.kt)("inlineCode",{parentName:"p"},"data-categories")," attribute on your items instead of ",(0,a.kt)("inlineCode",{parentName:"p"},"data-groups"),"."))}f.isMDXComponent=!0}}]);