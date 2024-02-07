"use strict";(globalThis.webpackChunkshuffle_docs=globalThis.webpackChunkshuffle_docs||[]).push([[64],{3636:(e,t,n)=>{n.d(t,{Iu:()=>u,yg:()=>d});var r=n(5668);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},h="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),h=p(n),c=a,d=h["".concat(l,".").concat(c)]||h[c]||f[c]||i;return n?r.createElement(d,o(o({ref:t},u),{},{components:n})):r.createElement(d,o({ref:t},u))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[h]="string"==typeof e?e:a,o[1]=s;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5264:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>f,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var r=n(4359),a=(n(5668),n(3636));const i={sidebar_position:14},o="FAQs",s={unversionedId:"faqs",id:"faqs",title:"FAQs",description:"Why Does Shuffle leave empty spaces?",source:"@site/docs/faqs.md",sourceDirName:".",slug:"/faqs",permalink:"/Shuffle/docs/faqs",draft:!1,editUrl:"https://github.com/Vestride/Shuffle/tree/main/apps/website/docs/docs/faqs.md",tags:[],version:"current",sidebarPosition:14,frontMatter:{sidebar_position:14},sidebar:"tutorialSidebar",previous:{title:"Supported browsers",permalink:"/Shuffle/docs/supported-browsers"},next:{title:"Changelog (abbreviated)",permalink:"/Shuffle/docs/changelog"}},l={},p=[{value:"Why Does Shuffle leave empty spaces?",id:"why-does-shuffle-leave-empty-spaces",level:2},{value:"Why are images overlapping?",id:"why-are-images-overlapping",level:2},{value:"What\u2019s the difference between Shuffle and Isotope?",id:"whats-the-difference-between-shuffle-and-isotope",level:2},{value:"Padding isn\u2019t working on the shuffle element",id:"padding-isnt-working-on-the-shuffle-element",level:2},{value:"Can I center the layout?",id:"can-i-center-the-layout",level:2},{value:"It\u2019s not working with Bootstrap 4",id:"its-not-working-with-bootstrap-4",level:2}],u={toc:p},h="wrapper";function f(e){let{components:t,...n}=e;return(0,a.yg)(h,(0,r.c)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.yg)("h1",{id:"faqs"},"FAQs"),(0,a.yg)("h2",{id:"why-does-shuffle-leave-empty-spaces"},"Why Does Shuffle leave empty spaces?"),(0,a.yg)("p",null,"The algorithm used to place items does not keep track of empty space nor try to fill them. If you require this functionality, I suggest ",(0,a.yg)("a",{parentName:"p",href:"http://packery.metafizzy.co/"},"packery"),"."),(0,a.yg)("h2",{id:"why-are-images-overlapping"},"Why are images overlapping?"),(0,a.yg)("p",null,"If the size of your items are dependent on images, they can overlap if shuffle is initialized before all the images have loaded. Check out ",(0,a.yg)("a",{parentName:"p",href:"https://codepen.io/Vestride/details/podNGMR"},"this demo")," to see how to fix it."),(0,a.yg)("h2",{id:"whats-the-difference-between-shuffle-and-isotope"},"What\u2019s the difference between Shuffle and Isotope?"),(0,a.yg)("p",null,"Isotope:"),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},"more layout modes"),(0,a.yg)("li",{parentName:"ul"},"more options"),(0,a.yg)("li",{parentName:"ul"},"community of users"),(0,a.yg)("li",{parentName:"ul"},"commercial use requires a license")),(0,a.yg)("p",null,"Shuffle:"),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},"robust filtering"),(0,a.yg)("li",{parentName:"ul"},"slightly smaller"),(0,a.yg)("li",{parentName:"ul"},"responsive by default"),(0,a.yg)("li",{parentName:"ul"},"sizer element (which ",(0,a.yg)("a",{parentName:"li",href:"https://packery.metafizzy.co/options.html#element-sizing"},"packery also has"),")")),(0,a.yg)("p",null,"They are ",(0,a.yg)("em",{parentName:"p"},"very")," similar, but I think Shuffle's filtering and sorting are easier to customize, which is the main reason I created this library. Isotope has a much larger community, is battle-tested, and has many stackoverflow answers."),(0,a.yg)("h2",{id:"padding-isnt-working-on-the-shuffle-element"},"Padding isn\u2019t working on the shuffle element"),(0,a.yg)("p",null,"The padding is ignored by Shuffle because it creates complexities with absolute positioning the shuffle-items when they have a percentage width as well as setting the height of the shuffle container because of box-sizing. To fix this, wrap the shuffle element in another element which has the padding on it."),(0,a.yg)("h2",{id:"can-i-center-the-layout"},"Can I center the layout?"),(0,a.yg)("p",null,"Yes. Use the ",(0,a.yg)("inlineCode",{parentName:"p"},"isCentered")," option."),(0,a.yg)("h2",{id:"its-not-working-with-bootstrap-4"},"It\u2019s not working with Bootstrap 4"),(0,a.yg)("p",null,"Bootstrap 4 uses flexbox for grids, so your main shuffle container element must be a ",(0,a.yg)("inlineCode",{parentName:"p"},".row")," and the items inside the row (shuffle items) should all be columns. See the ",(0,a.yg)("a",{parentName:"p",href:"https://codepen.io/Vestride/details/weWbJQ"},"Bootstrap 4 grid demo"),"."),(0,a.yg)("hr",null),(0,a.yg)("admonition",{title:"Didn't find an answer?",type:"info"},(0,a.yg)("p",{parentName:"admonition"},"Try browsing the ",(0,a.yg)("a",{parentName:"p",href:"https://codepen.io/collection/AWGLbd"},"CodePen collection")," or searching the issues ",(0,a.yg)("a",{parentName:"p",href:"https://github.com/Vestride/Shuffle/issues"},"on GitHub"),".")))}f.isMDXComponent=!0}}]);