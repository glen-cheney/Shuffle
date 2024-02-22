"use strict";(globalThis.webpackChunkshuffle_docs=globalThis.webpackChunkshuffle_docs||[]).push([[873],{2666:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>d,contentTitle:()=>t,default:()=>u,frontMatter:()=>l,metadata:()=>o,toc:()=>c});var s=i(1085),r=i(1184);const l={sidebar_position:4},t="Configuring Shuffle",o={id:"configuration",title:"Configuring Shuffle",description:"Here are the options you can change, as well as their defaults. The Shuffle.options property contains all the defaults.",source:"@site/docs/configuration.md",sourceDirName:".",slug:"/configuration",permalink:"/Shuffle/docs/configuration",draft:!1,unlisted:!1,editUrl:"https://github.com/Vestride/Shuffle/tree/main/apps/website/docs/docs/configuration.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"How column widths work",permalink:"/Shuffle/docs/column-widths"},next:{title:"Filters",permalink:"/Shuffle/docs/filters"}},d={},c=[{value:"Options",id:"options",level:2},{value:"<code>buffer</code> [number]",id:"buffer-number",level:3},{value:"<code>columnThreshold</code> [number]",id:"columnthreshold-number",level:3},{value:"<code>columnWidth</code> [number | (containerWidth: number) =&gt; number]",id:"columnwidth-number--containerwidth-number--number",level:3},{value:"<code>delimiter</code> [string | null]",id:"delimiter-string--null",level:3},{value:"<code>easing</code> [string]",id:"easing-string",level:3},{value:"<code>filterMode</code> [Shuffle.FilterMode]",id:"filtermode-shufflefiltermode",level:3},{value:"<code>group</code> [string]",id:"group-string",level:3},{value:"<code>gutterWidth</code> [number | (containerWidth: number) =&gt; number]",id:"gutterwidth-number--containerwidth-number--number",level:3},{value:"<code>initialSort</code> [SortOptions | null]",id:"initialsort-sortoptions--null",level:3},{value:"<code>isCentered</code> [boolean]",id:"iscentered-boolean",level:3},{value:"<code>isRTL</code> [boolean]",id:"isrtl-boolean",level:3},{value:"<code>itemSelector</code> [string]",id:"itemselector-string",level:3},{value:"<code>roundTransforms</code> [boolean]",id:"roundtransforms-boolean",level:3},{value:"<code>sizer</code> [HTMLElement | string | null]",id:"sizer-htmlelement--string--null",level:3},{value:"<code>speed</code> [number]",id:"speed-number",level:3},{value:"<code>staggerAmount</code> [number]",id:"staggeramount-number",level:3},{value:"<code>staggerAmountMax</code> [number]",id:"staggeramountmax-number",level:3},{value:"<code>useTransforms</code> [boolean]",id:"usetransforms-boolean",level:3},{value:"Sorting object",id:"sorting-object",level:2},{value:"<code>by</code> [(element: HTMLElement) =&gt; any]",id:"by-element-htmlelement--any",level:3},{value:"<code>compare</code> [(a: Shuffle.ShuffleItem, b: Shuffle.ShuffleItem) =&gt; number]",id:"compare-a-shuffleshuffleitem-b-shuffleshuffleitem--number",level:3},{value:"<code>key</code> [keyof Shuffle.ShuffleItem]",id:"key-keyof-shuffleshuffleitem",level:3},{value:"<code>randomize</code> [boolean]",id:"randomize-boolean",level:3},{value:"<code>reverse</code> [boolean]",id:"reverse-boolean",level:3}];function h(e){const n={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",p:"p",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"configuring-shuffle",children:"Configuring Shuffle"}),"\n",(0,s.jsxs)(n.p,{children:["Here are the options you can change, as well as their defaults. The ",(0,s.jsx)(n.code,{children:"Shuffle.options"})," property contains all the defaults."]}),"\n",(0,s.jsxs)(n.p,{children:["No options ",(0,s.jsx)(n.em,{children:"need"})," to be specified, but ",(0,s.jsx)(n.code,{children:"itemSelector"})," should be used. Other common options to change are ",(0,s.jsx)(n.code,{children:"speed"})," and ",(0,s.jsx)(n.code,{children:"sizer"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"options",children:"Options"}),"\n",(0,s.jsxs)(n.h3,{id:"buffer-number",children:[(0,s.jsx)(n.code,{children:"buffer"})," [number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"0"})]}),"\n",(0,s.jsx)(n.p,{children:"Useful for percentage based heights when they might not always be exactly the same (in pixels)."}),"\n",(0,s.jsxs)(n.h3,{id:"columnthreshold-number",children:[(0,s.jsx)(n.code,{children:"columnThreshold"})," [number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"0.01"})]}),"\n",(0,s.jsx)(n.p,{children:"Reading the width of elements isn't precise enough and can cause columns to jump between values."}),"\n",(0,s.jsxs)(n.h3,{id:"columnwidth-number--containerwidth-number--number",children:[(0,s.jsx)(n.code,{children:"columnWidth"})," [number | (containerWidth: number) => number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"0"})]}),"\n",(0,s.jsx)(n.p,{children:"A static number or function that returns a number which determines how wide the columns are (in pixels)."}),"\n",(0,s.jsxs)(n.h3,{id:"delimiter-string--null",children:[(0,s.jsx)(n.code,{children:"delimiter"})," [string | null]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"null"})]}),"\n",(0,s.jsxs)(n.p,{children:["Set a delimiter to parse the ",(0,s.jsx)(n.code,{children:"data-groups"})," attribute with using ",(0,s.jsx)(n.code,{children:"String.prototype.split()"}),", instead of using ",(0,s.jsx)(n.code,{children:"JSON.parse()"}),". For example, if your HTML was ",(0,s.jsx)(n.code,{children:'data-groups="nature,city"'}),", you could set ",(0,s.jsx)(n.code,{children:"delimiter: ','"}),"."]}),"\n",(0,s.jsxs)(n.h3,{id:"easing-string",children:[(0,s.jsx)(n.code,{children:"easing"})," [string]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"'cubic-bezier(0.4, 0.0, 0.2, 1)'"})]}),"\n",(0,s.jsx)(n.p,{children:"CSS easing function to use."}),"\n",(0,s.jsxs)(n.h3,{id:"filtermode-shufflefiltermode",children:[(0,s.jsx)(n.code,{children:"filterMode"})," [Shuffle.FilterMode]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"Shuffle.FilterMode.ANY"})]}),"\n",(0,s.jsxs)(n.p,{children:["Affects using an array with filter. e.g. ",(0,s.jsx)(n.code,{children:"filter(['one', 'two'])"}),'. With "any", the element passes the test if any of its groups are in the array. With "all", the element only passes if all groups are in the array.']}),"\n",(0,s.jsxs)(n.h3,{id:"group-string",children:[(0,s.jsx)(n.code,{children:"group"})," [string]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"Shuffle.ALL_ITEMS"})," (",(0,s.jsx)(n.code,{children:'"all"'}),")"]}),"\n",(0,s.jsx)(n.p,{children:"Initial filter group."}),"\n",(0,s.jsxs)(n.h3,{id:"gutterwidth-number--containerwidth-number--number",children:[(0,s.jsx)(n.code,{children:"gutterWidth"})," [number | (containerWidth: number) => number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"0"})]}),"\n",(0,s.jsx)(n.p,{children:"A static number or function that determines how wide the gutters between columns are (in pixels)."}),"\n",(0,s.jsxs)(n.h3,{id:"initialsort-sortoptions--null",children:[(0,s.jsx)(n.code,{children:"initialSort"})," [SortOptions | null]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"null"})]}),"\n",(0,s.jsx)(n.p,{children:"Shuffle can be initialized with a sort object. It is the same object given to the sort method."}),"\n",(0,s.jsxs)(n.h3,{id:"iscentered-boolean",children:[(0,s.jsx)(n.code,{children:"isCentered"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"false"})]}),"\n",(0,s.jsx)(n.p,{children:"Whether to center grid items in the row with the leftover space."}),"\n",(0,s.jsxs)(n.h3,{id:"isrtl-boolean",children:[(0,s.jsx)(n.code,{children:"isRTL"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"false"})]}),"\n",(0,s.jsx)(n.p,{children:"Whether to align grid items to the right in the row."}),"\n",(0,s.jsxs)(n.h3,{id:"itemselector-string",children:[(0,s.jsx)(n.code,{children:"itemSelector"})," [string]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"'*'"})]}),"\n",(0,s.jsx)(n.p,{children:"Query selector to find Shuffle items. e.g. '.picture-item'."}),"\n",(0,s.jsxs)(n.h3,{id:"roundtransforms-boolean",children:[(0,s.jsx)(n.code,{children:"roundTransforms"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"true"})]}),"\n",(0,s.jsx)(n.p,{children:"Whether to round pixel values used in translate(x, y). This usually avoids blurriness."}),"\n",(0,s.jsxs)(n.h3,{id:"sizer-htmlelement--string--null",children:[(0,s.jsx)(n.code,{children:"sizer"})," [HTMLElement | string | null]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"null"})]}),"\n",(0,s.jsx)(n.p,{children:"Element or selector string. Use an element to determine the size of columns and gutters."}),"\n",(0,s.jsxs)(n.h3,{id:"speed-number",children:[(0,s.jsx)(n.code,{children:"speed"})," [number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"250"})]}),"\n",(0,s.jsx)(n.p,{children:"Transition/animation speed (milliseconds)."}),"\n",(0,s.jsxs)(n.h3,{id:"staggeramount-number",children:[(0,s.jsx)(n.code,{children:"staggerAmount"})," [number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"15"})]}),"\n",(0,s.jsx)(n.p,{children:"Transition delay offset for each item in milliseconds."}),"\n",(0,s.jsxs)(n.h3,{id:"staggeramountmax-number",children:[(0,s.jsx)(n.code,{children:"staggerAmountMax"})," [number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"150"})]}),"\n",(0,s.jsx)(n.p,{children:"Maximum stagger delay in milliseconds. This caps the stagger amount so that it does not exceed the given value. Since the transition delay is incremented for each item in the grid, this is useful for large grids of items."}),"\n",(0,s.jsxs)(n.h3,{id:"usetransforms-boolean",children:[(0,s.jsx)(n.code,{children:"useTransforms"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"false"})]}),"\n",(0,s.jsx)(n.p,{children:"Whether to use absolute positioning instead of transforms."}),"\n",(0,s.jsx)(n.h2,{id:"sorting-object",children:"Sorting object"}),"\n",(0,s.jsxs)(n.h3,{id:"by-element-htmlelement--any",children:[(0,s.jsx)(n.code,{children:"by"})," [(element: HTMLElement) => any]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"null"})]}),"\n",(0,s.jsx)(n.p,{children:"Sorting function which gives you the element each shuffle item is using by default."}),"\n",(0,s.jsxs)(n.p,{children:["Returning ",(0,s.jsx)(n.code,{children:"undefined"})," from the ",(0,s.jsx)(n.code,{children:"by"})," function will reset the order to DOM order."]}),"\n",(0,s.jsxs)(n.h3,{id:"compare-a-shuffleshuffleitem-b-shuffleshuffleitem--number",children:[(0,s.jsx)(n.code,{children:"compare"})," [(a: Shuffle.ShuffleItem, b: Shuffle.ShuffleItem) => number]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"null"})]}),"\n",(0,s.jsxs)(n.p,{children:["Instead of using the simple ",(0,s.jsx)(n.code,{children:"by"})," function, you can use the ",(0,s.jsx)(n.code,{children:"compare"})," function provide a completely custom sorting function."]}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:["See ",(0,s.jsx)(n.a,{href:"/Shuffle/docs/sorting#advanced-sorting",children:"Advanced sorting"})," for usage."]})}),"\n",(0,s.jsxs)(n.h3,{id:"key-keyof-shuffleshuffleitem",children:[(0,s.jsx)(n.code,{children:"key"})," [keyof Shuffle.ShuffleItem]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"'element'"})]}),"\n",(0,s.jsxs)(n.p,{children:["Determines which property of the ",(0,s.jsx)(n.code,{children:"ShuffleItem"})," instance is passed to the ",(0,s.jsx)(n.code,{children:"by"})," function."]}),"\n",(0,s.jsxs)(n.h3,{id:"randomize-boolean",children:[(0,s.jsx)(n.code,{children:"randomize"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"false"})]}),"\n",(0,s.jsx)(n.p,{children:"If true, this will skip the sorting and return a randomized order in the array."}),"\n",(0,s.jsxs)(n.h3,{id:"reverse-boolean",children:[(0,s.jsx)(n.code,{children:"reverse"})," [boolean]"]}),"\n",(0,s.jsxs)(n.p,{children:["Default: ",(0,s.jsx)(n.code,{children:"false"})]}),"\n",(0,s.jsx)(n.p,{children:"Use array.reverse() to reverse the results of your sort."})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},1184:(e,n,i)=>{i.d(n,{R:()=>t,x:()=>o});var s=i(4041);const r={},l=s.createContext(r);function t(e){const n=s.useContext(l);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(l.Provider,{value:n},e.children)}}}]);