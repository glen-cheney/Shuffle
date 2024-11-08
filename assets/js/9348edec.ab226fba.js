"use strict";(self.webpackChunkshuffle_docs=self.webpackChunkshuffle_docs||[]).push([[660],{6067:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>c,contentTitle:()=>o,default:()=>h,frontMatter:()=>i,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"filters","title":"Filters","description":"Filter by a group","source":"@site/docs/filters.md","sourceDirName":".","slug":"/filters","permalink":"/Shuffle/docs/filters","draft":false,"unlisted":false,"editUrl":"https://github.com/Vestride/Shuffle/tree/main/apps/website/docs/docs/filters.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5},"sidebar":"tutorialSidebar","previous":{"title":"Configuring Shuffle","permalink":"/Shuffle/docs/configuration"},"next":{"title":"Advanced filters","permalink":"/Shuffle/docs/advanced-filters"}}');var n=t(1085),l=t(1184);const i={sidebar_position:5},o="Filters",c={},d=[{value:"Filter by a group",id:"filter-by-a-group",level:2},{value:"Filter by multiple groups",id:"filter-by-multiple-groups",level:2},{value:"Show all items",id:"show-all-items",level:2},{value:"Overrides",id:"overrides",level:2}];function a(e){const s={code:"code",em:"em",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,l.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.header,{children:(0,n.jsx)(s.h1,{id:"filters",children:"Filters"})}),"\n",(0,n.jsx)(s.h2,{id:"filter-by-a-group",children:"Filter by a group"}),"\n",(0,n.jsxs)(s.p,{children:["Use the ",(0,n.jsx)(s.code,{children:"filter()"})," method. If, for example, you wanted to show only items that match ",(0,n.jsx)(s.code,{children:'"space"'}),", you would do this:"]}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-js",children:"shuffleInstance.filter('space');\n"})}),"\n",(0,n.jsx)(s.h2,{id:"filter-by-multiple-groups",children:"Filter by multiple groups"}),"\n",(0,n.jsx)(s.p,{children:"Show multiple groups at once by using an array."}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-js",children:"shuffleInstance.filter(['space', 'nature']);\n"})}),"\n",(0,n.jsxs)(s.p,{children:["By default, this will show items that match ",(0,n.jsx)(s.code,{children:"space"})," ",(0,n.jsx)(s.em,{children:"or"})," ",(0,n.jsx)(s.code,{children:"nature"}),". To show only groups that match ",(0,n.jsx)(s.code,{children:"space"})," ",(0,n.jsx)(s.em,{children:"and"})," ",(0,n.jsx)(s.code,{children:"nature"}),", set the ",(0,n.jsx)(s.code,{children:"filterMode"})," option to ",(0,n.jsx)(s.code,{children:"Shuffle.FilterMode.ALL"}),"."]}),"\n",(0,n.jsx)(s.h2,{id:"show-all-items",children:"Show all items"}),"\n",(0,n.jsxs)(s.p,{children:["To go back to having no items filtered, you can call ",(0,n.jsx)(s.code,{children:"filter()"})," without a parameter, or use ",(0,n.jsx)(s.code,{children:"Shuffle.ALL_ITEMS"})," (which by default is the string ",(0,n.jsx)(s.code,{children:'"all"'}),")."]}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-js",children:"shuffleInstance.filter(Shuffle.ALL_ITEMS); // or .filter()\n"})}),"\n",(0,n.jsx)(s.h2,{id:"overrides",children:"Overrides"}),"\n",(0,n.jsxs)(s.p,{children:["You can override both ",(0,n.jsx)(s.code,{children:"Shuffle.ALL_ITEMS"})," and ",(0,n.jsx)(s.code,{children:"Shuffle.FILTER_ATTRIBUTE_KEY"})," if you want."]}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-js",children:"// Defaults\nShuffle.ALL_ITEMS = 'all';\nShuffle.FILTER_ATTRIBUTE_KEY = 'groups';\n\n// You can change them to something else.\nShuffle.ALL_ITEMS = 'any';\nShuffle.FILTER_ATTRIBUTE_KEY = 'categories';\n"})}),"\n",(0,n.jsxs)(s.p,{children:["Then you would have to use ",(0,n.jsx)(s.code,{children:"data-categories"})," attribute on your items instead of ",(0,n.jsx)(s.code,{children:"data-groups"}),"."]})]})}function h(e={}){const{wrapper:s}={...(0,l.R)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(a,{...e})}):a(e)}},1184:(e,s,t)=>{t.d(s,{R:()=>i,x:()=>o});var r=t(4041);const n={},l=r.createContext(n);function i(e){const s=r.useContext(l);return r.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:i(e.components),r.createElement(l.Provider,{value:s},e.children)}}}]);