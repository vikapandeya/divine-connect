import{r as $,j as e}from"./vendor-BLqV_m0t.js";import{P as ye}from"./PageHero-DiOvEVsh.js";import{f as u,D as ae,e as ne,h as ve,i as Ne,j as je,k as we,m as Ce,n as $e,o as De}from"./index-BM-C8NyE.js";import{n as ke,P as Se,o as Ie,m as M,p as z,S as ie,q as le,R as Re,D as w,r as E,A as ce,s as Ae}from"./icons-dZXZzUTT.js";import{u as Pe,c as Te}from"./router-BZJXDFZY.js";import"./motion-D5xlclFS.js";const H=595,B=842;function ze(t){return t.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}function Ee(t,s){const r=t.split(/\s+/).filter(Boolean);if(r.length===0)return[""];const a=[];let n="";return r.forEach(c=>{const i=n?`${n} ${c}`:c;if(i.length<=s){n=i;return}n&&a.push(n),n=c}),n&&a.push(n),a}function I(t=[.16,.13,.11]){return t.map(s=>Number(s.toFixed(3)))}function We(t,s){return Math.max(1,t.length)*s*.52}function Oe(t,s,r){const a=t.trim();if(!a)return[""];const n=a.split(/\n+/),c=s?Math.max(10,Math.floor(s/Math.max(4,r*.52))):Math.max(10,Math.floor(460/Math.max(4,r*.52)));return n.flatMap((i,l)=>{const b=Ee(i,c);return l===0?b:["",...b]})}function Le(t){const s=[],r=t.width??H,a=t.height??B;if(t.backgroundColor){const[n,c,i]=I(t.backgroundColor);s.push(`${n} ${c} ${i} rg`),s.push(`0 0 ${r} ${a} re f`)}return t.elements.forEach(n=>{if(n.type==="rect"){if(s.push("q"),n.fillColor){const[g,x,j]=I(n.fillColor);s.push(`${g} ${x} ${j} rg`)}if(n.strokeColor){const[g,x,j]=I(n.strokeColor);s.push(`${g} ${x} ${j} RG`),s.push(`${n.strokeWidth??1} w`)}s.push(`${n.x} ${n.y} ${n.width} ${n.height} re`),n.fillColor&&n.strokeColor?s.push("B"):n.fillColor?s.push("f"):n.strokeColor&&s.push("S"),s.push("Q");return}if(n.type==="line"){const[g,x,j]=I(n.color??[.8,.76,.7]);s.push("q"),s.push(`${g} ${x} ${j} RG`),s.push(`${n.width??1} w`),s.push(`${n.x1} ${n.y1} m ${n.x2} ${n.y2} l S`),s.push("Q");return}const c=n.size??12,i=n.lineHeight??c+5,[l,b,h]=I(n.color??[.16,.13,.11]),f=Oe(n.text,n.maxWidth,c);s.push("BT"),s.push(`${l} ${b} ${h} rg`),f.forEach((g,x)=>{const j=n.bold?"F2":"F1",p=We(g,c);let S=n.x;n.align==="center"?S=n.x-p/2:n.align==="right"&&(S=n.x-p),s.push(`/${j} ${c} Tf`),s.push(`1 0 0 1 ${S.toFixed(2)} ${(n.y-x*i).toFixed(2)} Tm`),s.push(`(${ze(g)}) Tj`)}),s.push("ET")}),s.join(`
`)}function Me(t,s=H,r=B){const a=["1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj","2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",`3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${s} ${r}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj`,`4 0 obj << /Length ${t.length} >> stream
${t}
endstream
endobj`,"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj","6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj"];let n=`%PDF-1.4
`;const c=[0];a.forEach(l=>{c.push(n.length),n+=`${l}
`});const i=n.length;return n+=`xref
0 ${a.length+1}
`,n+=`0000000000 65535 f 
`,c.slice(1).forEach(l=>{n+=`${l.toString().padStart(10,"0")} 00000 n 
`}),n+=`trailer << /Size ${a.length+1} /Root 1 0 R >>
startxref
${i}
%%EOF`,new Blob([n],{type:"application/pdf"})}function He(t,s){if(typeof window>"u")return;const r=window.URL.createObjectURL(s),a=window.document.createElement("a");a.href=r,a.download=t.endsWith(".pdf")?t:`${t}.pdf`,a.click(),window.URL.revokeObjectURL(r)}function F(t,s){const r=s.width??H,a=s.height??B,n=Me(Le(s),r,a);He(t,n)}const pe=842;function m(t){return pe-t}function k(t,s){return pe-t-s}function U(t){return t?new Date(t).toLocaleString("en-IN"):"Not available"}function R(t){return t?t.split(/[-_\s]+/).filter(Boolean).map(s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join(" "):"Pending"}function L(t,s){return`${t}-${s.replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(-12)}`}function Be(t){const s=t.items[0],r=t.items.length===1&&(t.itemCount||t.items.length)===1,a=r&&s?`${s.name} Certificate`:"Sacred Product Purchase Certificate",n=r?"Product purchase verification":"Multi-item purchase verification",c=r&&s?`This certificate confirms that ${s.name} was purchased through DivineConnect and recorded with payment details in your order history.`:"This certificate confirms that the listed sacred products were purchased through DivineConnect and recorded with payment details in your order history.";return{title:a,subtitle:n,summary:c,primaryItem:s,hasSingleItem:r}}function D(t,s,r,a,n,c,i){t.push({type:"rect",x:s,y:k(r,n),width:a,height:n,fillColor:i.accentSoft,strokeColor:i.border,strokeWidth:1}),t.push({type:"text",x:s+18,y:m(r+24),text:c.title.toUpperCase(),size:9,bold:!0,color:i.muted});let l=r+50;c.rows.forEach((b,h)=>{t.push({type:"text",x:s+18,y:m(l),text:b.label,size:9,bold:!0,color:i.muted}),t.push({type:"text",x:s+18,y:m(l+16),text:b.value,size:12,bold:h===0,color:i.text,maxWidth:a-36,lineHeight:15}),l+=42})}function q(t){const{theme:s}=t,r=[{type:"rect",x:34,y:34,width:527,height:774,fillColor:s.panel,strokeColor:s.border,strokeWidth:1.5},{type:"rect",x:34,y:784,width:527,height:24,fillColor:s.accent},{type:"rect",x:54,y:616,width:487,height:150,fillColor:s.accentSoft,strokeColor:s.border,strokeWidth:1},{type:"text",x:56,y:m(66),text:"DivineConnect",size:13,bold:!0,color:s.panel},{type:"text",x:540,y:m(66),text:t.footerLabel.toUpperCase(),size:9,bold:!0,color:s.panel,align:"right"},{type:"text",x:297.5,y:m(120),text:t.subtitle.toUpperCase(),size:10,bold:!0,color:s.muted,align:"center"},{type:"text",x:297.5,y:m(154),text:t.title,size:24,bold:!0,color:s.text,align:"center",maxWidth:420,lineHeight:28},{type:"rect",x:184,y:k(188,28),width:227,height:28,fillColor:s.panel,strokeColor:s.border,strokeWidth:1},{type:"text",x:297.5,y:m(207),text:t.documentId,size:10,bold:!0,color:s.text,align:"center"},{type:"text",x:297.5,y:m(254),text:t.recipientLabel.toUpperCase(),size:10,bold:!0,color:s.muted,align:"center"},{type:"text",x:297.5,y:m(286),text:t.recipient,size:23,bold:!0,color:s.text,align:"center",maxWidth:360,lineHeight:27},{type:"text",x:297.5,y:m(330),text:t.summary,size:11,color:s.text,align:"center",maxWidth:390,lineHeight:16}],a=t.cards.slice(0,4);for(;a.length<4;)a.push({title:"Information",rows:[{label:"Status",value:"Available in your DivineConnect profile"}]});D(r,58,394,220,112,a[0],s),D(r,316,394,220,112,a[1],s),D(r,58,526,220,112,a[2],s),D(r,316,526,220,112,a[3],s),r.push({type:"rect",x:58,y:k(660,78),width:478,height:78,fillColor:s.panel,strokeColor:s.border,strokeWidth:1},{type:"text",x:74,y:m(684),text:"Blessing Note",size:9,bold:!0,color:s.muted},{type:"text",x:74,y:m(706),text:t.footerNote,size:11,color:s.text,maxWidth:446,lineHeight:16},{type:"line",x1:74,y1:98,x2:214,y2:98,color:s.border,width:1},{type:"text",x:74,y:82,text:"Digital Verification Desk",size:9,bold:!0,color:s.muted},{type:"line",x1:382,y1:98,x2:522,y2:98,color:s.border,width:1},{type:"text",x:382,y:82,text:"DivineConnect Records",size:9,bold:!0,color:s.muted}),F(t.filename,{backgroundColor:s.background,elements:r})}function Fe(t,s,r){var h;const a={background:[.996,.978,.949],hero:[.745,.322,.125],heroSoft:[.973,.875,.741],panel:[1,.995,.986],text:[.247,.176,.122],muted:[.565,.435,.341],border:[.905,.753,.627]},n=(r==null?void 0:r.displayName)||(r==null?void 0:r.email)||"Devotee",c=((h=r==null?void 0:r.addresses)==null?void 0:h[0])||"Address will be shared during confirmation",i=R(s.mode||"online"),l=[{type:"rect",x:0,y:636,width:595,height:206,fillColor:a.hero},{type:"rect",x:34,y:34,width:527,height:774,fillColor:a.panel,strokeColor:a.border,strokeWidth:1.25},{type:"rect",x:58,y:552,width:479,height:198,fillColor:a.panel,strokeColor:a.border,strokeWidth:1},{type:"text",x:297.5,y:m(70),text:"DivineConnect",size:14,bold:!0,color:[1,.986,.955],align:"center"},{type:"text",x:297.5,y:m(108),text:"Sacred Puja Invitation",size:27,bold:!0,color:[1,.986,.955],align:"center"},{type:"text",x:297.5,y:m(140),text:"A devotional card designed for family sharing, event planning, and sacred remembrance.",size:11,color:[1,.935,.846],align:"center",maxWidth:380,lineHeight:15},{type:"rect",x:191,y:k(168,30),width:213,height:30,fillColor:a.heroSoft},{type:"text",x:297.5,y:m(188),text:t,size:10,bold:!0,color:a.text,align:"center"},{type:"text",x:297.5,y:m(262),text:"With blessings and devotion, you are warmly invited to join this sacred occasion.",size:11,color:a.muted,align:"center",maxWidth:360,lineHeight:15},{type:"text",x:297.5,y:m(308),text:s.serviceTitle||"Puja Booking",size:24,bold:!0,color:a.text,align:"center",maxWidth:360,lineHeight:28},{type:"text",x:297.5,y:m(340),text:`Hosted for ${n}`,size:12,color:a.muted,align:"center"}];[{label:"Puja Date",value:s.date,left:84},{label:"Puja Time",value:s.timeSlot,left:223},{label:"Mode",value:i,left:362}].forEach(f=>{l.push({type:"rect",x:f.left,y:k(378,82),width:112,height:82,fillColor:a.heroSoft,strokeColor:a.border,strokeWidth:1},{type:"text",x:f.left+56,y:m(402),text:f.label.toUpperCase(),size:9,bold:!0,color:a.muted,align:"center"},{type:"text",x:f.left+56,y:m(434),text:f.value,size:12,bold:!0,color:a.text,align:"center",maxWidth:88,lineHeight:15})}),D(l,58,492,228,124,{title:"Invitation Details",rows:[{label:"Devotee Name",value:n},{label:"Booking Reference",value:s.bookingReference||s.id}]},{border:a.border,accentSoft:[.994,.969,.925],text:a.text,muted:a.muted}),D(l,308,492,228,124,{title:"Venue and Presence",rows:[{label:"Address",value:c},{label:"Attendance",value:"Family, friends, and close well-wishers are welcome"}]},{border:a.border,accentSoft:[.994,.969,.925],text:a.text,muted:a.muted}),l.push({type:"rect",x:58,y:k(644,96),width:478,height:96,fillColor:[.994,.969,.925],strokeColor:a.border,strokeWidth:1},{type:"text",x:74,y:m(668),text:"Blessings and Note",size:9,bold:!0,color:a.muted},{type:"text",x:74,y:m(692),text:"May this sacred gathering bring peace, blessings, and spiritual strength to the devotee, the family, and every invited guest. Please keep this card for sharing and event coordination.",size:11,color:a.text,maxWidth:446,lineHeight:16},{type:"text",x:74,y:86,text:"Presented with care by DivineConnect",size:10,bold:!0,color:a.muted},{type:"text",x:520,y:86,text:"Sacred service invitation",size:10,color:a.muted,align:"right"}),F(`${t.toLowerCase()}-invitation`,{backgroundColor:a.background,elements:l})}function Ue(t,s){const r=L(t.type==="puja"?"PUJA":"DARSHAN",t.bookingReference||t.id),a=(s==null?void 0:s.displayName)||(s==null?void 0:s.email)||"Devotee";q({filename:`${r.toLowerCase()}-certificate`,title:t.type==="puja"?"Sacred Service Certificate":"Darshan Participation Certificate",subtitle:t.type==="puja"?"Verified booking record":"Verified darshan record",documentId:r,recipientLabel:"Issued To",recipient:a,summary:"This digital certificate confirms that the requested sacred service has been successfully reserved through DivineConnect and recorded in your activity history.",cards:[{title:"Service Overview",rows:[{label:"Service",value:t.serviceTitle||`${R(t.type)} booking`},{label:"Mode",value:R(t.mode||"online")}]},{title:"Schedule",rows:[{label:"Booking Date",value:t.date},{label:"Time Slot",value:t.timeSlot}]},{title:"Verification",rows:[{label:"Reference",value:t.bookingReference||t.id},{label:"Status",value:R(t.status)}]},{title:"Amount Summary",rows:[{label:"Amount",value:`Rs. ${u(t.totalAmount)}`},{label:"Issued On",value:U(t.updatedAt||t.createdAt)}]}],footerNote:"Keep this certificate for support follow-up, service check-in, and future reference inside your DivineConnect profile.",footerLabel:"Digital certificate",theme:{background:[.988,.969,.937],panel:[1,.997,.988],border:[.898,.812,.702],accent:[.812,.357,.118],accentSoft:[.982,.933,.867],text:[.231,.176,.122],muted:[.545,.439,.333]}})}function qe(t,s){const r=L("INVITE",t.bookingReference||t.id);Fe(r,t,s)}function de(t){var c,i,l,b,h,f;const s=L("ORDER",t.orderNumber||t.id),r=Be(t),a=t.items.slice(0,2).map(g=>g.name).join(", "),n=t.items.length>2?` +${t.items.length-2} more`:"";q({filename:`${s.toLowerCase()}-certificate`,title:r.title,subtitle:r.subtitle,documentId:s,recipientLabel:"Issued To",recipient:((c=t.customerDetails)==null?void 0:c.fullName)||"DivineConnect Customer",summary:r.summary,cards:[{title:"Product Details",rows:[{label:r.hasSingleItem?"Product Name":"Products",value:r.hasSingleItem&&r.primaryItem?r.primaryItem.name:`${a}${n}`},{label:"Category / Quantity",value:r.hasSingleItem&&r.primaryItem?`${r.primaryItem.category} | Qty ${r.primaryItem.quantity}`:`${t.items.length} items in this purchase`}]},{title:"Source and Pricing",rows:[{label:"Temple / Source",value:((i=r.primaryItem)==null?void 0:i.templeName)||((l=r.primaryItem)==null?void 0:l.category)||"DivineConnect marketplace selection"},{label:"Total Amount",value:`Rs. ${u(t.totalAmount)}`}]},{title:"Payment Snapshot",rows:[{label:"Payment Method",value:((b=t.receipt)==null?void 0:b.paymentMethod)||"Secure checkout"},{label:"Payment Status",value:R(((h=t.receipt)==null?void 0:h.paymentStatus)||"Paid")}]},{title:"Order Trace",rows:[{label:"Order Number",value:t.orderNumber||t.id.slice(-6).toUpperCase()},{label:"Issued On",value:U(((f=t.receipt)==null?void 0:f.issuedAt)||t.createdAt)}]}],footerNote:"Use this certificate together with the invoice for recordkeeping, product verification, customer support, and delivery reconciliation.",footerLabel:"Product certificate",theme:{background:[.958,.978,.975],panel:[.994,.998,.997],border:[.741,.843,.816],accent:[.09,.451,.408],accentSoft:[.903,.957,.944],text:[.101,.2,.196],muted:[.314,.427,.408]}})}function Ge(t){const s=L("KUNDALI",t.id);q({filename:`${s.toLowerCase()}-certificate`,title:"Kundali Match Certificate",subtitle:"Compatibility reading record",documentId:s,recipientLabel:"Primary Profile",recipient:t.name,summary:"This certificate confirms that a compatibility reading was generated in the DivineConnect Kundali Match experience and stored as a devotional reference.",cards:[{title:"Primary Details",rows:[{label:"Birth Details",value:`${t.dob} | ${t.tob} | ${t.pob}`},{label:"Reading Type",value:t.readingType==="kundali-match"?"Kundali Match":"Astrology Reading"}]},{title:"Partner Details",rows:[{label:"Partner Name",value:t.partnerName||"Not provided"},{label:"Partner Birth",value:`${t.partnerDob||"N/A"} | ${t.partnerTob||"N/A"} | ${t.partnerPob||"N/A"}`}]},{title:"Reading Log",rows:[{label:"Issued On",value:U(t.createdAt)},{label:"Reference",value:s}]},{title:"Use Case",rows:[{label:"Document Type",value:"Digital compatibility certificate"},{label:"Storage",value:"Saved inside the DivineConnect astrology profile"}]}],footerNote:"This certificate is intended for personal reference and devotional recordkeeping inside the DivineConnect experience.",footerLabel:"Astrology certificate",theme:{background:[.969,.96,.988],panel:[.996,.994,1],border:[.815,.788,.902],accent:[.337,.255,.639],accentSoft:[.937,.921,.988],text:[.176,.153,.286],muted:[.396,.357,.525]}})}const _e=842;function d(t){return _e-t}function v(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function xe(t,s){return t.length<=s?t:`${t.slice(0,Math.max(0,s-1)).trimEnd()}...`}function Ve(t){const s=t.customerDetails||{addressLine1:"",city:"",state:"",pincode:""};return[s.addressLine1,s.addressLine2,`${s.city}, ${s.state} - ${s.pincode}`].filter(Boolean).join(", ")}function me(t){const s=t.orderNumber||`ORDER-${t.id.slice(-6).toUpperCase()}`,r=t.receipt||{orderNumber:s,issuedAt:t.createdAt,paymentMethod:"Secure checkout",paymentStatus:"Paid",transactionId:"Generated at checkout",subtotal:t.totalAmount,shippingFee:0,totalAmount:t.totalAmount},a=t.customerDetails||{fullName:"DivineConnect Customer",email:"Not provided",phoneNumber:"Not provided",addressLine1:t.shippingAddress||"Address not available",city:"",state:"",pincode:""};return{orderNumber:s,receipt:r,customerDetails:a,invoiceDate:new Date(r.issuedAt||t.createdAt).toLocaleString("en-IN"),shippingAddress:Ve(t)||t.shippingAddress||"Address not available"}}function Qe(t){const{orderNumber:s,receipt:r,customerDetails:a,invoiceDate:n,shippingAddress:c}=me(t),i=t.items.map(l=>`
        <tr>
          <td>
            <div class="item-name">${v(l.name)}</div>
            <div class="item-meta">${v(l.templeName||l.category)}</div>
          </td>
          <td>${v(l.category)}</td>
          <td>${l.quantity}</td>
          <td>Rs. ${u(l.price)}</td>
          <td>Rs. ${u(l.price*l.quantity)}</td>
        </tr>`).join("");return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DivineConnect Invoice ${v(s)}</title>
    <style>
      :root {
        --ink: #18212b;
        --muted: #5b6773;
        --line: #d8dee6;
        --panel: #ffffff;
        --bg: #f4f7fb;
        --brand: #0f3d63;
        --brand-soft: #dce8f4;
        --accent: #c87a21;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 28px;
        background: var(--bg);
        color: var(--ink);
        font-family: "Segoe UI", Arial, sans-serif;
      }

      .sheet {
        max-width: 920px;
        margin: 0 auto;
      }

      .hero {
        background: linear-gradient(135deg, var(--brand), #174d7b);
        color: #fff;
        border-radius: 28px;
        padding: 28px 32px;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 24px;
        box-shadow: 0 18px 40px rgba(15, 61, 99, 0.16);
      }

      .hero h1 {
        margin: 10px 0 6px;
        font-size: 34px;
        letter-spacing: -0.02em;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 11px;
        opacity: 0.78;
        font-weight: 700;
      }

      .hero-meta {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 22px;
        padding: 20px;
      }

      .status-chip {
        display: inline-block;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .summary-grid,
      .detail-grid {
        display: grid;
        gap: 18px;
        margin-top: 22px;
      }

      .summary-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 22px;
        box-shadow: 0 8px 24px rgba(18, 33, 49, 0.05);
      }

      .panel h3 {
        margin: 0 0 14px;
        font-size: 13px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .summary-value {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 8px;
      }

      .muted {
        color: var(--muted);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead th {
        text-align: left;
        padding: 14px 16px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
        border-bottom: 1px solid var(--line);
      }

      tbody td {
        padding: 16px;
        border-bottom: 1px solid #edf1f6;
        vertical-align: top;
        font-size: 14px;
      }

      .item-name {
        font-weight: 700;
        margin-bottom: 4px;
      }

      .item-meta {
        color: var(--muted);
        font-size: 12px;
      }

      .totals {
        margin-top: 16px;
        margin-left: auto;
        width: 320px;
        background: var(--brand-soft);
        border-radius: 20px;
        padding: 18px 20px;
      }

      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 8px 0;
      }

      .totals-row.grand {
        border-top: 1px solid rgba(15, 61, 99, 0.14);
        margin-top: 6px;
        padding-top: 14px;
        font-size: 18px;
        font-weight: 800;
      }

      .footer-note {
        margin-top: 18px;
        font-size: 13px;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <section class="hero">
        <div>
          <div class="eyebrow">DivineConnect Finance Desk</div>
          <h1>Tax Invoice / Order Receipt</h1>
          <p class="muted" style="color: rgba(255,255,255,0.82); margin: 0;">
            Structured billing document for sacred commerce orders, payment tracking, and support verification.
          </p>
        </div>
        <div class="hero-meta">
          <div class="status-chip">${v(t.status)}</div>
          <p><strong>Invoice:</strong> ${v(s)}</p>
          <p><strong>Issued On:</strong> ${v(n)}</p>
          <p><strong>Transaction ID:</strong> ${v(r.transactionId||"Generated at checkout")}</p>
          <p><strong>Payment:</strong> ${v(r.paymentMethod)} (${v(r.paymentStatus||"Paid")})</p>
        </div>
      </section>

      <section class="summary-grid">
        <div class="panel">
          <h3>Grand Total</h3>
          <div class="summary-value">Rs. ${u(r.totalAmount)}</div>
          <div class="muted">Including shipping and recorded payment status.</div>
        </div>
        <div class="panel">
          <h3>Line Items</h3>
          <div class="summary-value">${t.itemCount||t.items.length}</div>
          <div class="muted">Products captured in this invoice.</div>
        </div>
        <div class="panel">
          <h3>Payment Status</h3>
          <div class="summary-value">${v(r.paymentStatus||"Paid")}</div>
          <div class="muted">${v(r.paymentMethod||"Secure checkout")}</div>
        </div>
      </section>

      <section class="detail-grid">
        <div class="panel">
          <h3>Bill To</h3>
          <p><strong>${v(a.fullName)}</strong></p>
          <p>${v(a.email)}</p>
          <p>${v(a.phoneNumber)}</p>
        </div>
        <div class="panel">
          <h3>Delivery Address</h3>
          <p>${v(c)}</p>
        </div>
      </section>

      <section class="panel">
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${i}</tbody>
        </table>
        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><strong>Rs. ${u(r.subtotal)}</strong></div>
          <div class="totals-row"><span>Shipping</span><strong>Rs. ${u(r.shippingFee)}</strong></div>
          <div class="totals-row grand"><span>Grand Total</span><span>Rs. ${u(r.totalAmount)}</span></div>
        </div>
        <div class="footer-note">
          This invoice is generated by DivineConnect for order support, print records, and payment reconciliation.
        </div>
      </section>
    </div>
  </body>
</html>`}function Ke(t){const{orderNumber:s,receipt:r,customerDetails:a,invoiceDate:n,shippingAddress:c}=me(t),i=[{type:"rect",x:0,y:0,width:595,height:842,fillColor:[.965,.976,.992]},{type:"rect",x:34,y:632,width:527,height:176,fillColor:[.059,.239,.388]},{type:"text",x:58,y:d(66),text:"DivineConnect Finance Desk",size:10,bold:!0,color:[.867,.914,.965]},{type:"text",x:58,y:d(102),text:"Tax Invoice / Order Receipt",size:21,bold:!0,color:[1,1,1],maxWidth:260,lineHeight:24},{type:"text",x:58,y:d(146),text:"A structured commercial layout for sacred commerce billing, payment verification, and support workflows.",size:11,color:[.875,.922,.969],maxWidth:250,lineHeight:15},{type:"rect",x:374,y:652,width:163,height:122,fillColor:[.114,.314,.482]},{type:"text",x:390,y:d(72),text:"INVOICE SUMMARY",size:8,bold:!0,color:[1,.934,.78],maxWidth:131},{type:"text",x:390,y:d(96),text:`Invoice: ${s}`,size:12,bold:!0,color:[1,1,1],maxWidth:131,lineHeight:14},{type:"text",x:390,y:d(128),text:`Issued On: ${n}`,size:10,color:[.922,.953,.984],maxWidth:131,lineHeight:13},{type:"text",x:390,y:d(158),text:`Txn ID: ${r.transactionId||"Generated at checkout"}`,size:10,color:[.922,.953,.984],maxWidth:131,lineHeight:13},{type:"text",x:390,y:d(188),text:`Status: ${r.paymentStatus||t.status}`,size:10,color:[.922,.953,.984],maxWidth:131,lineHeight:13},{type:"text",x:390,y:d(206),text:`Payment: ${r.paymentMethod||"Secure checkout"}`,size:10,color:[.922,.953,.984],maxWidth:131,lineHeight:13},{type:"rect",x:34,y:538,width:250,height:88,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"rect",x:311,y:538,width:250,height:88,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:d(198),text:"Bill To",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:52,y:d(224),text:a.fullName||"DivineConnect Customer",size:13,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:52,y:d(244),text:`${a.email||"Not provided"} | ${a.phoneNumber||"Not provided"}`,size:10,color:[.353,.404,.463],maxWidth:214,lineHeight:13},{type:"text",x:329,y:d(198),text:"Invoice Snapshot",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:329,y:d(224),text:`Payment: ${r.paymentMethod||"Secure checkout"}`,size:11,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:329,y:d(244),text:`Status: ${r.paymentStatus||"Paid"} | Items: ${t.itemCount||t.items.length}`,size:10,color:[.353,.404,.463],maxWidth:214,lineHeight:13},{type:"rect",x:34,y:256,width:527,height:250,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:d(320),text:"Order Items",size:10,bold:!0,color:[.353,.404,.463]},{type:"rect",x:52,y:458,width:491,height:30,fillColor:[.925,.949,.976]}],l=d(370);[{x:60,text:"Item"},{x:286,text:"Category"},{x:375,text:"Qty"},{x:430,text:"Rate"},{x:495,text:"Total"}].forEach(h=>{i.push({type:"text",x:h.x,y:l,text:h.text,size:9,bold:!0,color:[.353,.404,.463]})});let b=392;return t.items.forEach((h,f)=>{const g=b+f*30,x=d(g+20);i.push({type:"text",x:60,y:d(g),text:xe(h.name,28),size:11,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:286,y:d(g),text:xe(h.category,14),size:10,color:[.353,.404,.463]},{type:"text",x:375,y:d(g),text:String(h.quantity),size:10,color:[.114,.145,.18]},{type:"text",x:430,y:d(g),text:`Rs. ${u(h.price)}`,size:10,color:[.114,.145,.18]},{type:"text",x:495,y:d(g),text:`Rs. ${u(h.price*h.quantity)}`,size:10,bold:!0,color:[.114,.145,.18]},{type:"line",x1:52,y1:x,x2:543,y2:x,color:[.911,.933,.957],width:1})}),i.push({type:"rect",x:34,y:102,width:292,height:122,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:d(636),text:"Delivery and Notes",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:52,y:d(662),text:c,size:11,color:[.114,.145,.18],maxWidth:256,lineHeight:16},{type:"text",x:52,y:d(712),text:"This invoice is generated for payment records, order support, and print documentation inside DivineConnect.",size:10,color:[.353,.404,.463],maxWidth:256,lineHeight:14},{type:"rect",x:348,y:102,width:213,height:122,fillColor:[.862,.914,.969]},{type:"text",x:366,y:d(636),text:"Totals",size:10,bold:!0,color:[.208,.29,.38]},{type:"text",x:366,y:d(666),text:`Subtotal  Rs. ${u(r.subtotal)}`,size:11,color:[.114,.145,.18]},{type:"text",x:366,y:d(690),text:`Shipping  Rs. ${u(r.shippingFee)}`,size:11,color:[.114,.145,.18]},{type:"line",x1:366,y1:128,x2:543,y2:128,color:[.627,.718,.812],width:1},{type:"text",x:366,y:d(724),text:`Grand Total  Rs. ${u(r.totalAmount)}`,size:15,bold:!0,color:[.059,.239,.388]}),i}function W(t){F(`${(t.orderNumber||`order-${t.id.slice(-6)}`).toLowerCase()}-invoice`,{elements:Ke(t)})}function O(t){if(typeof window>"u")return;const s=window.open("","_blank","noopener,noreferrer,width=960,height=720");s&&(s.document.write(Qe(t)),s.document.close(),s.focus(),s.print())}function st(){var G,_,V,Q;const t=Pe(),[s,r]=Te(),a=ae,[n,c]=$.useState(null),[i,l]=$.useState([]),[b,h]=$.useState([]),[f,g]=$.useState([]),[x,j]=$.useState("bookings"),p=b[0]||null;$.useEffect(()=>{const o=s.get("tab");(o==="profile"||o==="bookings"||o==="orders"||o==="readings")&&j(o)},[s]),$.useEffect(()=>{(async()=>{try{const[y,A,P,T]=await Promise.all([je(a.uid),we(a.uid),Ce(a.uid),$e(a.uid)]);c(y),l(A),h(P),g(T)}catch(y){console.error("Error fetching profile data:",y)}})()},[a]);const S=o=>{De(o.items.map(y=>({id:y.productId,name:y.name,price:y.price,image:y.image||"https://picsum.photos/seed/reorder/400/400",quantity:y.quantity,category:y.category,templeName:y.templeName,weight:y.weight,size:y.size}))),t("/cart")},he=o=>{if(o.type==="darshan"){t("/services/darshan");return}t(`/services/puja/${o.serviceId}`)},C=o=>{j(o),r({tab:o})},ue=o=>o.serviceTitle?o.serviceTitle:o.type==="darshan"?"Darshan Support":"Puja Booking",be=x==="bookings"?"Service Bookings":x==="orders"?"Order History":x==="readings"?"Astrology History":"Account Settings",ge=x==="bookings"?i.length:x==="orders"?b.length:x==="readings"?f.length:"Security",fe=[{key:"bookings",label:"Bookings",value:i.length},{key:"orders",label:"Orders",value:b.length},{key:"readings",label:"Readings",value:f.length}];return e.jsxs("div",{className:"mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8",children:[e.jsx(ye,{tone:"stone",eyebrow:"My DivineConnect",title:"A clearer account space for bookings, orders, certificates, and spiritual history.",description:"This profile area is organized to reduce switching friction between service records, invoices, astrology outputs, and personal account details.",stats:[{label:"Bookings",value:`${i.length}`},{label:"Orders",value:`${b.length}`},{label:"Readings",value:`${f.length}`},{label:"Latest Order",value:p?`Rs. ${u(p.totalAmount)}`:"No orders"}],aside:e.jsxs("div",{className:"rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm",children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-600",children:"Account Workspace"}),e.jsxs("div",{className:"mt-5 space-y-3 text-sm text-stone-600",children:[e.jsx("div",{className:"rounded-2xl bg-stone-50 px-4 py-3",children:"Faster switching between bookings, orders, readings, and profile settings."}),e.jsx("div",{className:"rounded-2xl bg-stone-50 px-4 py-3",children:"Certificates, invoices, and reorder actions stay close to the related record."})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-4 gap-8",children:[e.jsxs("div",{className:"lg:col-span-1 space-y-6",children:[e.jsxs("div",{className:"bg-white p-8 rounded-[2rem] border border-stone-200 text-center",children:[e.jsx("img",{src:a.photoURL||"",alt:"",className:"w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-100"}),e.jsx("h2",{className:"text-xl font-bold text-stone-900",children:a.displayName}),e.jsx("p",{className:"text-stone-500 text-sm mb-6 capitalize",children:(n==null?void 0:n.role)||"Devotee"}),e.jsxs("div",{className:"space-y-3 text-left",children:[e.jsxs("div",{className:"flex items-center text-sm text-stone-600",children:[e.jsx(ke,{className:"w-4 h-4 mr-2 text-stone-400"}),e.jsx("span",{className:"truncate",children:a.email})]}),(n==null?void 0:n.phoneNumber)&&e.jsxs("div",{className:"flex items-center text-sm text-stone-600",children:[e.jsx(Se,{className:"w-4 h-4 mr-2 text-stone-400"}),e.jsx("span",{children:n.phoneNumber})]})]}),e.jsx("div",{className:"grid grid-cols-3 gap-3 mt-6 text-left",children:fe.map(o=>e.jsxs("button",{type:"button",onClick:()=>C(o.key),className:`rounded-2xl border p-4 text-left transition-colors ${x===o.key?"border-orange-200 bg-orange-50":"border-stone-100 bg-stone-50 hover:border-orange-100 hover:bg-orange-50/40"}`,children:[e.jsx("p",{className:`text-[11px] uppercase tracking-wider font-bold mb-1 ${x===o.key?"text-orange-500":"text-stone-400"}`,children:o.label}),e.jsx("p",{className:"text-xl font-bold text-stone-900",children:o.value})]},o.key))})]}),e.jsxs("nav",{className:"bg-white rounded-[2rem] border border-stone-200 overflow-hidden",children:[e.jsxs("button",{onClick:()=>C("profile"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="profile"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(Ie,{className:"w-5 h-5 mr-3"}),"My Profile"]}),e.jsxs("button",{onClick:()=>C("bookings"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="bookings"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(M,{className:"w-5 h-5 mr-3"}),"My Bookings"]}),e.jsxs("button",{onClick:()=>C("orders"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="orders"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(z,{className:"w-5 h-5 mr-3"}),"My Orders"]}),e.jsxs("button",{onClick:()=>C("readings"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="readings"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(ie,{className:"w-5 h-5 mr-3"}),"Astrology History"]}),e.jsxs("button",{onClick:()=>t("/vendor"),className:"w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors",children:[e.jsx(le,{className:"w-5 h-5 mr-3"}),"Vendor Dashboard"]}),e.jsxs("button",{onClick:()=>t("/admin"),className:"w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors",children:[e.jsx(le,{className:"w-5 h-5 mr-3"}),"Admin Dashboard"]})]})]}),e.jsx("div",{className:"lg:col-span-3",children:e.jsxs("div",{className:"bg-white rounded-[2.5rem] border border-stone-200 min-h-[600px] overflow-hidden",children:[e.jsxs("div",{className:"px-8 py-6 border-b border-stone-100 flex justify-between items-center",children:[e.jsx("h3",{className:"text-xl font-serif font-bold text-stone-900",children:be}),e.jsxs("div",{className:"flex items-center gap-3",children:[p?e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"hidden md:inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(Re,{className:"w-4 h-4 mr-2"}),"Invoice Ready"]}):null,e.jsx("span",{className:"bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold",children:ge})]})]}),e.jsxs("div",{className:"p-8",children:[p&&x!=="orders"?e.jsx("div",{className:"mb-8 rounded-[2rem] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-stone-50 p-6",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2",children:"Latest Invoice"}),e.jsxs("h4",{className:"text-lg font-bold text-stone-900",children:["Order #",p.orderNumber]}),e.jsxs("p",{className:"text-sm text-stone-600 mt-1",children:[p.items.length," items, ",(G=p.customerDetails)==null?void 0:G.fullName,","," ",(_=p.customerDetails)==null?void 0:_.phoneNumber]}),e.jsxs("p",{className:"text-sm text-stone-500 mt-1",children:["Total: Rs. ",u(p.totalAmount)," | Issued:"," ",new Date(((V=p.receipt)==null?void 0:V.issuedAt)||p.createdAt).toLocaleString()]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(z,{className:"w-4 h-4 mr-2"}),"View Order"]}),e.jsxs("button",{type:"button",onClick:()=>W(p),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>O(p),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]})]})]})}):null,x==="profile"?e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider",children:"Full Name"}),e.jsx("div",{className:"p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900",children:a.displayName})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider",children:"Email Address"}),e.jsx("div",{className:"p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900",children:a.email})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Quick Reorder"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Rebuild past prasad and spiritual offering orders directly into your cart."})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Book Again"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Repeat past puja or darshan flows without manually searching again."})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Saved Readings"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Review recent astrology insights and continue into remedies when needed."})]})]}),p?e.jsx("div",{className:"rounded-[2rem] border border-orange-100 bg-orange-50 p-6",children:e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center md:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2",children:"Latest Invoice"}),e.jsxs("h4",{className:"text-lg font-bold text-stone-900",children:["Order #",p.orderNumber]}),e.jsxs("p",{className:"text-sm text-stone-600 mt-1",children:[p.items.length," items | Rs. ",u(p.totalAmount)]}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Transaction ID: ",((Q=p.receipt)==null?void 0:Q.transactionId)||"Generated at checkout"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(z,{className:"w-4 h-4 mr-2"}),"Open Orders"]}),e.jsxs("button",{type:"button",onClick:()=>W(p),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>O(p),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>de(p),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Product Certificate"]})]})]})}):null,e.jsxs("div",{className:"pt-8 border-t border-stone-100",children:[e.jsx("h4",{className:"text-lg font-bold text-stone-900 mb-6",children:"Demo Access"}),e.jsxs("div",{className:"max-w-md space-y-4",children:[e.jsxs("p",{className:"text-sm text-stone-600",children:["This static demo does not require sign-in. If you want sample credentials for presentations, use"," ",e.jsx("span",{className:"font-bold text-stone-900",children:ne.email})," /"," ",e.jsx("span",{className:"font-bold text-stone-900",children:ne.password}),"."]}),e.jsxs("div",{className:"grid grid-cols-1 gap-3 text-sm text-stone-600",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Devotee demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:ae.email})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Vendor demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:ve.email})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Admin demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:Ne.email})]})]})]})]})]}):x==="bookings"?e.jsx("div",{className:"space-y-4",children:i.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(M,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No bookings found."})]}):i.map(o=>e.jsxs("div",{className:"flex items-center justify-between p-6 rounded-2xl border border-stone-100 hover:border-orange-100 transition-colors",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0",children:e.jsx(M,{className:"w-6 h-6 text-orange-600"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-bold text-stone-900",children:ue(o)}),e.jsxs("p",{className:"text-xs text-stone-500",children:[o.date," at ",o.timeSlot]}),e.jsxs("p",{className:"text-xs text-stone-500",children:["Certificate Ref: ",o.bookingReference||o.id.slice(-8).toUpperCase()]}),o.mode&&e.jsxs("p",{className:"text-xs text-stone-500 capitalize",children:[o.mode," pandit ji service"]})]})]}),e.jsxs("div",{className:"text-right space-y-3",children:[e.jsxs("p",{className:"font-bold text-stone-900",children:["Rs. ",u(o.totalAmount)]}),e.jsx("span",{className:`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.status==="confirmed"?"bg-emerald-100 text-emerald-700":o.status==="pending"?"bg-amber-100 text-amber-700":o.status==="completed"?"bg-blue-100 text-blue-700":"bg-stone-100 text-stone-500"}`,children:o.status}),e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>he(o),className:"inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors",children:["Book Again",e.jsx(ce,{className:"w-4 h-4 ml-1"})]})}),e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>Ue(o,n),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Certificate"]})}),o.type==="puja"?e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>qe(o,n),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Invitation"]})}):null]})]},o.id))}):x==="orders"?e.jsx("div",{className:"space-y-4",children:b.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(z,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No orders found."})]}):b.map(o=>{var y,A,P,T,K,Y,J,Z,X,ee,te,se,oe,re;return e.jsxs("div",{className:"p-6 rounded-2xl border border-stone-100",children:[e.jsx("div",{className:"mb-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3",children:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500",children:"Invoice Ready"}),e.jsx("p",{className:"text-sm font-medium text-stone-600 mt-1",children:"Full invoice includes order number, customer details, payment method, price breakup, and delivery address."})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>W(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>O(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>de(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Product Certificate"]})]})]})}),e.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsxs("span",{className:"text-xs font-bold text-stone-400",children:["Order #",o.orderNumber||o.id.slice(-6).toUpperCase()]}),e.jsx("p",{className:"text-xs text-stone-500 mt-1",children:new Date(o.createdAt).toLocaleDateString()}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Receipt issued: ",new Date(((y=o.receipt)==null?void 0:y.issuedAt)||o.createdAt).toLocaleString()]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>S(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(Ae,{className:"w-4 h-4 mr-2"}),"Reorder"]}),e.jsxs("button",{type:"button",onClick:()=>W(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>O(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 bg-white p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-3",children:"Receipt Details"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-stone-600",children:[e.jsxs("p",{children:["Order No: ",e.jsx("span",{className:"font-bold text-stone-900",children:o.orderNumber})]}),e.jsxs("p",{children:["Payment: ",e.jsx("span",{className:"font-bold text-stone-900",children:(A=o.receipt)==null?void 0:A.paymentMethod})]}),e.jsxs("p",{children:["Payment Status:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((P=o.receipt)==null?void 0:P.paymentStatus)||"Paid"})]}),e.jsxs("p",{children:["Customer: ",e.jsx("span",{className:"font-bold text-stone-900",children:(T=o.customerDetails)==null?void 0:T.fullName})]}),e.jsxs("p",{children:["Contact: ",e.jsx("span",{className:"font-bold text-stone-900",children:(K=o.customerDetails)==null?void 0:K.phoneNumber})]}),e.jsxs("p",{className:"md:col-span-2",children:["Email: ",e.jsx("span",{className:"font-bold text-stone-900",children:(Y=o.customerDetails)==null?void 0:Y.email})]}),e.jsxs("p",{className:"md:col-span-2",children:["Transaction ID:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((J=o.receipt)==null?void 0:J.transactionId)||"Generated at checkout"})]})]})]}),e.jsxs("p",{className:"text-sm font-bold text-stone-900",children:[o.items.length," Items"]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:o.items.slice(0,3).map(N=>e.jsxs("span",{className:"px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold",children:[N.name," x ",N.quantity]},`${o.id}-${N.productId}`))}),e.jsx("p",{className:"text-sm text-stone-500",children:o.shippingAddress}),e.jsxs("div",{className:"text-xs text-stone-500 space-y-1",children:[e.jsxs("p",{children:[(Z=o.customerDetails)==null?void 0:Z.fullName," | ",(X=o.customerDetails)==null?void 0:X.phoneNumber]}),e.jsx("p",{children:(ee=o.customerDetails)==null?void 0:ee.email})]}),o.estimatedDeliveryDate?e.jsxs("div",{className:"rounded-2xl bg-emerald-50 border border-emerald-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1",children:"Estimated Delivery"}),e.jsx("p",{className:"text-sm font-bold text-stone-900",children:new Date(o.estimatedDeliveryDate).toLocaleDateString()})]}):null,e.jsxs("div",{className:"rounded-2xl bg-stone-50 border border-stone-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-2",children:"Receipt Summary"}),e.jsxs("div",{className:"space-y-1 text-sm text-stone-600",children:[o.items.map(N=>e.jsxs("p",{children:[N.name," x ",N.quantity,":"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",u(N.price*N.quantity)]})]},`${o.id}-${N.productId}-line`)),e.jsxs("p",{children:["Subtotal:"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",u(((te=o.receipt)==null?void 0:te.subtotal)||o.totalAmount)]})]}),e.jsxs("p",{children:["Shipping:"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",u(((se=o.receipt)==null?void 0:se.shippingFee)||0)]})]}),e.jsxs("p",{children:["Payment:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((oe=o.receipt)==null?void 0:oe.paymentMethod)||"Secure checkout"})]})]})]}),(re=o.statusTimeline)!=null&&re.length?e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-3",children:"Order Journey"}),e.jsx("div",{className:"space-y-3",children:o.statusTimeline.map(N=>e.jsxs("div",{className:"flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-stone-900",children:N.label}),e.jsx("p",{className:"text-xs text-stone-500",children:N.note})]}),e.jsx("span",{className:"text-[11px] font-medium text-stone-400 whitespace-nowrap",children:new Date(N.completedAt).toLocaleDateString()})]},`${o.id}-${N.status}`))})]}):null]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("p",{className:"font-bold text-stone-900",children:["Rs. ",u(o.totalAmount)]}),e.jsx("span",{className:"text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700",children:o.status})]})]})]},o.id)})}):e.jsx("div",{className:"space-y-4",children:f.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(ie,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No astrology readings found yet."})]}):f.map(o=>e.jsxs("div",{className:"p-6 rounded-2xl border border-stone-100",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold text-orange-500 uppercase tracking-wider",children:o.readingType==="kundali-match"?"Kundali Match":o.readingType==="rashi-phal"?"Rashi Phal":"Astrology Reading"}),e.jsx("h4",{className:"text-lg font-bold text-stone-900 mt-1",children:o.name}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:[new Date(o.createdAt).toLocaleDateString()," | ",o.pob]}),o.partnerName?e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Match with ",o.partnerName]}):null,o.rashi?e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Rashi: ",o.rashi]}):null]}),e.jsxs("button",{type:"button",onClick:()=>t("/astrology"),className:"inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors",children:["Open AI Astrology",e.jsx(ce,{className:"w-4 h-4 ml-1"})]})]}),o.userQuery?e.jsxs("div",{className:"rounded-2xl bg-orange-50 border border-orange-100 p-4 mb-4",children:[e.jsx("p",{className:"text-xs font-bold text-orange-600 uppercase tracking-wider mb-2",children:"Your Question"}),e.jsx("p",{className:"text-sm text-stone-700",children:o.userQuery})]}):null,e.jsx("div",{className:"rounded-2xl bg-stone-50 border border-stone-100 p-4",children:e.jsx("p",{className:"text-sm text-stone-700 whitespace-pre-wrap line-clamp-6",children:o.reading})}),o.readingType==="kundali-match"?e.jsx("div",{className:"mt-4",children:e.jsxs("button",{type:"button",onClick:()=>Ge(o),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Match Certificate"]})}):null]},o.id))})]})]})})]})]})}export{st as default};
