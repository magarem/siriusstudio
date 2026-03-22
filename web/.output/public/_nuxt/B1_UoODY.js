import{aW as t,bg as n,o as l,c as s,a as r,av as o,aT as a}from"./xXtvY4xC.js";var d=`
    .p-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: dt('toolbar.padding');
        background: dt('toolbar.background');
        border: 1px solid dt('toolbar.border.color');
        color: dt('toolbar.color');
        border-radius: dt('toolbar.border.radius');
        gap: dt('toolbar.gap');
    }

    .p-toolbar-start,
    .p-toolbar-center,
    .p-toolbar-end {
        display: flex;
        align-items: center;
    }
`,p={root:"p-toolbar p-component",start:"p-toolbar-start",center:"p-toolbar-center",end:"p-toolbar-end"},b=t.extend({name:"toolbar",style:d,classes:p}),i={name:"BaseToolbar",extends:n,props:{ariaLabelledby:{type:String,default:null}},style:b,provide:function(){return{$pcToolbar:this,$parentInstance:this}}},c={name:"Toolbar",extends:i,inheritAttrs:!1},m=["aria-labelledby"];function u(e,v,y,g,$,f){return l(),s("div",a({class:e.cx("root"),role:"toolbar","aria-labelledby":e.ariaLabelledby},e.ptmi("root")),[r("div",a({class:e.cx("start")},e.ptm("start")),[o(e.$slots,"start")],16),r("div",a({class:e.cx("center")},e.ptm("center")),[o(e.$slots,"center")],16),r("div",a({class:e.cx("end")},e.ptm("end")),[o(e.$slots,"end")],16)],16,m)}c.render=u;export{c as default};
