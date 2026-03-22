import{r as D,j as e}from"./vendor-dPF08jOt.js";import{f as h}from"./utils-DgU7Z3cZ.js";import{D as ne,e as ae,f as ye,h as ve,i as Ne,j as je,k as we,m as Ce,n as De}from"./index-D-rtbmTK.js";import{k as $e,P as ke,l as Re,j as M,m as P,e as ie,n as le,R as Se,D as w,o as E,A as de,p as Ae}from"./icons-Bo4juUlL.js";import{u as Ie,b as Te}from"./router-C66eSwqK.js";import"./motion-5iuvwa5p.js";const B=595,H=842;function ze(t){return t.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}function Pe(t,s){const a=t.split(/\s+/).filter(Boolean);if(a.length===0)return[""];const r=[];let n="";return a.forEach(d=>{const i=n?`${n} ${d}`:d;if(i.length<=s){n=i;return}n&&r.push(n),n=d}),n&&r.push(n),r}function S(t=[.16,.13,.11]){return t.map(s=>Number(s.toFixed(3)))}function Ee(t,s){return Math.max(1,t.length)*s*.52}function Oe(t,s,a){const r=t.trim();if(!r)return[""];const n=r.split(/\n+/),d=s?Math.max(10,Math.floor(s/Math.max(4,a*.52))):Math.max(10,Math.floor(460/Math.max(4,a*.52)));return n.flatMap((i,l)=>{const g=Pe(i,d);return l===0?g:["",...g]})}function Le(t){const s=[],a=t.width??B,r=t.height??H;if(t.backgroundColor){const[n,d,i]=S(t.backgroundColor);s.push(`${n} ${d} ${i} rg`),s.push(`0 0 ${a} ${r} re f`)}return t.elements.forEach(n=>{if(n.type==="rect"){if(s.push("q"),n.fillColor){const[b,x,j]=S(n.fillColor);s.push(`${b} ${x} ${j} rg`)}if(n.strokeColor){const[b,x,j]=S(n.strokeColor);s.push(`${b} ${x} ${j} RG`),s.push(`${n.strokeWidth??1} w`)}s.push(`${n.x} ${n.y} ${n.width} ${n.height} re`),n.fillColor&&n.strokeColor?s.push("B"):n.fillColor?s.push("f"):n.strokeColor&&s.push("S"),s.push("Q");return}if(n.type==="line"){const[b,x,j]=S(n.color??[.8,.76,.7]);s.push("q"),s.push(`${b} ${x} ${j} RG`),s.push(`${n.width??1} w`),s.push(`${n.x1} ${n.y1} m ${n.x2} ${n.y2} l S`),s.push("Q");return}const d=n.size??12,i=n.lineHeight??d+5,[l,g,u]=S(n.color??[.16,.13,.11]),v=Oe(n.text,n.maxWidth,d);s.push("BT"),s.push(`${l} ${g} ${u} rg`),v.forEach((b,x)=>{const j=n.bold?"F2":"F1",m=Ee(b,d);let R=n.x;n.align==="center"?R=n.x-m/2:n.align==="right"&&(R=n.x-m),s.push(`/${j} ${d} Tf`),s.push(`1 0 0 1 ${R.toFixed(2)} ${(n.y-x*i).toFixed(2)} Tm`),s.push(`(${ze(b)}) Tj`)}),s.push("ET")}),s.join(`
`)}function We(t,s=B,a=H){const r=["1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj","2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",`3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${s} ${a}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj`,`4 0 obj << /Length ${t.length} >> stream
${t}
endstream
endobj`,"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj","6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj"];let n=`%PDF-1.4
`;const d=[0];r.forEach(l=>{d.push(n.length),n+=`${l}
`});const i=n.length;return n+=`xref
0 ${r.length+1}
`,n+=`0000000000 65535 f 
`,d.slice(1).forEach(l=>{n+=`${l.toString().padStart(10,"0")} 00000 n 
`}),n+=`trailer << /Size ${r.length+1} /Root 1 0 R >>
startxref
${i}
%%EOF`,new Blob([n],{type:"application/pdf"})}function Me(t,s){if(typeof window>"u")return;const a=window.URL.createObjectURL(s),r=window.document.createElement("a");r.href=a,r.download=t.endsWith(".pdf")?t:`${t}.pdf`,r.click(),window.URL.revokeObjectURL(a)}function F(t,s){const a=s.width??B,r=s.height??H,n=We(Le(s),a,r);Me(t,n)}const pe=842;function p(t){return pe-t}function k(t,s){return pe-t-s}function U(t){return t?new Date(t).toLocaleString("en-IN"):"Not available"}function A(t){return t?t.split(/[-_\s]+/).filter(Boolean).map(s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join(" "):"Pending"}function W(t,s){return`${t}-${s.replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(-12)}`}function $(t,s,a,r,n,d,i){t.push({type:"rect",x:s,y:k(a,n),width:r,height:n,fillColor:i.accentSoft,strokeColor:i.border,strokeWidth:1}),t.push({type:"text",x:s+18,y:p(a+24),text:d.title.toUpperCase(),size:9,bold:!0,color:i.muted});let l=a+50;d.rows.forEach((g,u)=>{t.push({type:"text",x:s+18,y:p(l),text:g.label,size:9,bold:!0,color:i.muted}),t.push({type:"text",x:s+18,y:p(l+16),text:g.value,size:12,bold:u===0,color:i.text,maxWidth:r-36,lineHeight:15}),l+=42})}function G(t){const{theme:s}=t,a=[{type:"rect",x:34,y:34,width:527,height:774,fillColor:s.panel,strokeColor:s.border,strokeWidth:1.5},{type:"rect",x:34,y:784,width:527,height:24,fillColor:s.accent},{type:"rect",x:54,y:616,width:487,height:150,fillColor:s.accentSoft,strokeColor:s.border,strokeWidth:1},{type:"text",x:56,y:p(66),text:"DivineConnect",size:13,bold:!0,color:s.panel},{type:"text",x:540,y:p(66),text:t.footerLabel.toUpperCase(),size:9,bold:!0,color:s.panel,align:"right"},{type:"text",x:297.5,y:p(120),text:t.subtitle.toUpperCase(),size:10,bold:!0,color:s.muted,align:"center"},{type:"text",x:297.5,y:p(154),text:t.title,size:24,bold:!0,color:s.text,align:"center",maxWidth:420,lineHeight:28},{type:"rect",x:184,y:k(188,28),width:227,height:28,fillColor:s.panel,strokeColor:s.border,strokeWidth:1},{type:"text",x:297.5,y:p(207),text:t.documentId,size:10,bold:!0,color:s.text,align:"center"},{type:"text",x:297.5,y:p(254),text:t.recipientLabel.toUpperCase(),size:10,bold:!0,color:s.muted,align:"center"},{type:"text",x:297.5,y:p(286),text:t.recipient,size:23,bold:!0,color:s.text,align:"center",maxWidth:360,lineHeight:27},{type:"text",x:297.5,y:p(330),text:t.summary,size:11,color:s.text,align:"center",maxWidth:390,lineHeight:16}],r=t.cards.slice(0,4);for(;r.length<4;)r.push({title:"Information",rows:[{label:"Status",value:"Available in your DivineConnect profile"}]});$(a,58,394,220,112,r[0],s),$(a,316,394,220,112,r[1],s),$(a,58,526,220,112,r[2],s),$(a,316,526,220,112,r[3],s),a.push({type:"rect",x:58,y:k(660,78),width:478,height:78,fillColor:s.panel,strokeColor:s.border,strokeWidth:1},{type:"text",x:74,y:p(684),text:"Blessing Note",size:9,bold:!0,color:s.muted},{type:"text",x:74,y:p(706),text:t.footerNote,size:11,color:s.text,maxWidth:446,lineHeight:16},{type:"line",x1:74,y1:98,x2:214,y2:98,color:s.border,width:1},{type:"text",x:74,y:82,text:"Digital Verification Desk",size:9,bold:!0,color:s.muted},{type:"line",x1:382,y1:98,x2:522,y2:98,color:s.border,width:1},{type:"text",x:382,y:82,text:"DivineConnect Records",size:9,bold:!0,color:s.muted}),F(t.filename,{backgroundColor:s.background,elements:a})}function Be(t,s,a){var u;const r={background:[.996,.978,.949],hero:[.745,.322,.125],heroSoft:[.973,.875,.741],panel:[1,.995,.986],text:[.247,.176,.122],muted:[.565,.435,.341],border:[.905,.753,.627]},n=(a==null?void 0:a.displayName)||(a==null?void 0:a.email)||"Devotee",d=((u=a==null?void 0:a.addresses)==null?void 0:u[0])||"Address will be shared during confirmation",i=A(s.mode||"online"),l=[{type:"rect",x:0,y:636,width:595,height:206,fillColor:r.hero},{type:"rect",x:34,y:34,width:527,height:774,fillColor:r.panel,strokeColor:r.border,strokeWidth:1.25},{type:"rect",x:58,y:552,width:479,height:198,fillColor:r.panel,strokeColor:r.border,strokeWidth:1},{type:"text",x:297.5,y:p(70),text:"DivineConnect",size:14,bold:!0,color:[1,.986,.955],align:"center"},{type:"text",x:297.5,y:p(108),text:"Sacred Puja Invitation",size:27,bold:!0,color:[1,.986,.955],align:"center"},{type:"text",x:297.5,y:p(140),text:"A devotional card designed for family sharing, event planning, and sacred remembrance.",size:11,color:[1,.935,.846],align:"center",maxWidth:380,lineHeight:15},{type:"rect",x:191,y:k(168,30),width:213,height:30,fillColor:r.heroSoft},{type:"text",x:297.5,y:p(188),text:t,size:10,bold:!0,color:r.text,align:"center"},{type:"text",x:297.5,y:p(262),text:"With blessings and devotion, you are warmly invited to join this sacred occasion.",size:11,color:r.muted,align:"center",maxWidth:360,lineHeight:15},{type:"text",x:297.5,y:p(308),text:s.serviceTitle||"Puja Booking",size:24,bold:!0,color:r.text,align:"center",maxWidth:360,lineHeight:28},{type:"text",x:297.5,y:p(340),text:`Hosted for ${n}`,size:12,color:r.muted,align:"center"}];[{label:"Puja Date",value:s.date,left:84},{label:"Puja Time",value:s.timeSlot,left:223},{label:"Mode",value:i,left:362}].forEach(v=>{l.push({type:"rect",x:v.left,y:k(378,82),width:112,height:82,fillColor:r.heroSoft,strokeColor:r.border,strokeWidth:1},{type:"text",x:v.left+56,y:p(402),text:v.label.toUpperCase(),size:9,bold:!0,color:r.muted,align:"center"},{type:"text",x:v.left+56,y:p(434),text:v.value,size:12,bold:!0,color:r.text,align:"center",maxWidth:88,lineHeight:15})}),$(l,58,492,228,124,{title:"Invitation Details",rows:[{label:"Devotee Name",value:n},{label:"Booking Reference",value:s.bookingReference||s.id}]},{border:r.border,accentSoft:[.994,.969,.925],text:r.text,muted:r.muted}),$(l,308,492,228,124,{title:"Venue and Presence",rows:[{label:"Address",value:d},{label:"Attendance",value:"Family, friends, and close well-wishers are welcome"}]},{border:r.border,accentSoft:[.994,.969,.925],text:r.text,muted:r.muted}),l.push({type:"rect",x:58,y:k(644,96),width:478,height:96,fillColor:[.994,.969,.925],strokeColor:r.border,strokeWidth:1},{type:"text",x:74,y:p(668),text:"Blessings and Note",size:9,bold:!0,color:r.muted},{type:"text",x:74,y:p(692),text:"May this sacred gathering bring peace, blessings, and spiritual strength to the devotee, the family, and every invited guest. Please keep this card for sharing and event coordination.",size:11,color:r.text,maxWidth:446,lineHeight:16},{type:"text",x:74,y:86,text:"Presented with care by DivineConnect",size:10,bold:!0,color:r.muted},{type:"text",x:520,y:86,text:"Sacred service invitation",size:10,color:r.muted,align:"right"}),F(`${t.toLowerCase()}-invitation`,{backgroundColor:r.background,elements:l})}function He(t,s){const a=W(t.type==="puja"?"PUJA":"DARSHAN",t.bookingReference||t.id),r=(s==null?void 0:s.displayName)||(s==null?void 0:s.email)||"Devotee";G({filename:`${a.toLowerCase()}-certificate`,title:t.type==="puja"?"Sacred Service Certificate":"Darshan Participation Certificate",subtitle:t.type==="puja"?"Verified booking record":"Verified darshan record",documentId:a,recipientLabel:"Issued To",recipient:r,summary:"This digital certificate confirms that the requested sacred service has been successfully reserved through DivineConnect and recorded in your activity history.",cards:[{title:"Service Overview",rows:[{label:"Service",value:t.serviceTitle||`${A(t.type)} booking`},{label:"Mode",value:A(t.mode||"online")}]},{title:"Schedule",rows:[{label:"Booking Date",value:t.date},{label:"Time Slot",value:t.timeSlot}]},{title:"Verification",rows:[{label:"Reference",value:t.bookingReference||t.id},{label:"Status",value:A(t.status)}]},{title:"Amount Summary",rows:[{label:"Amount",value:`Rs. ${h(t.totalAmount)}`},{label:"Issued On",value:U(t.updatedAt||t.createdAt)}]}],footerNote:"Keep this certificate for support follow-up, service check-in, and future reference inside your DivineConnect profile.",footerLabel:"Digital certificate",theme:{background:[.988,.969,.937],panel:[1,.997,.988],border:[.898,.812,.702],accent:[.812,.357,.118],accentSoft:[.982,.933,.867],text:[.231,.176,.122],muted:[.545,.439,.333]}})}function Fe(t,s){const a=W("INVITE",t.bookingReference||t.id);Be(a,t,s)}function ce(t){var a,r,n,d,i;const s=W("ORDER",t.orderNumber||t.id);G({filename:`${s.toLowerCase()}-certificate`,title:"Order Completion Certificate",subtitle:"Sacred commerce verification",documentId:s,recipientLabel:"Prepared For",recipient:((a=t.customerDetails)==null?void 0:a.fullName)||"DivineConnect Customer",summary:"This certificate confirms that the listed order was generated through DivineConnect, captured with payment details, and stored in your order history.",cards:[{title:"Order Details",rows:[{label:"Order Number",value:t.orderNumber||t.id.slice(-6).toUpperCase()},{label:"Item Count",value:String(t.itemCount||t.items.length)}]},{title:"Payment Snapshot",rows:[{label:"Payment Method",value:((r=t.receipt)==null?void 0:r.paymentMethod)||"Secure checkout"},{label:"Payment Status",value:A(((n=t.receipt)==null?void 0:n.paymentStatus)||"Paid")}]},{title:"Transaction Trace",rows:[{label:"Transaction ID",value:((d=t.receipt)==null?void 0:d.transactionId)||"Generated at checkout"},{label:"Issued On",value:U(((i=t.receipt)==null?void 0:i.issuedAt)||t.createdAt)}]},{title:"Fulfillment",rows:[{label:"Total Amount",value:`Rs. ${h(t.totalAmount)}`},{label:"Delivery Address",value:t.shippingAddress}]}],footerNote:"Use this certificate together with the invoice for recordkeeping, customer support, and delivery reconciliation.",footerLabel:"Order certificate",theme:{background:[.958,.978,.975],panel:[.994,.998,.997],border:[.741,.843,.816],accent:[.09,.451,.408],accentSoft:[.903,.957,.944],text:[.101,.2,.196],muted:[.314,.427,.408]}})}function Ue(t){const s=W("KUNDALI",t.id);G({filename:`${s.toLowerCase()}-certificate`,title:"Kundali Match Certificate",subtitle:"Compatibility reading record",documentId:s,recipientLabel:"Primary Profile",recipient:t.name,summary:"This certificate confirms that a compatibility reading was generated in the DivineConnect Kundali Match experience and stored as a devotional reference.",cards:[{title:"Primary Details",rows:[{label:"Birth Details",value:`${t.dob} | ${t.tob} | ${t.pob}`},{label:"Reading Type",value:t.readingType==="kundali-match"?"Kundali Match":"Astrology Reading"}]},{title:"Partner Details",rows:[{label:"Partner Name",value:t.partnerName||"Not provided"},{label:"Partner Birth",value:`${t.partnerDob||"N/A"} | ${t.partnerTob||"N/A"} | ${t.partnerPob||"N/A"}`}]},{title:"Reading Log",rows:[{label:"Issued On",value:U(t.createdAt)},{label:"Reference",value:s}]},{title:"Use Case",rows:[{label:"Document Type",value:"Digital compatibility certificate"},{label:"Storage",value:"Saved inside the DivineConnect astrology profile"}]}],footerNote:"This certificate is intended for personal reference and devotional recordkeeping inside the DivineConnect experience.",footerLabel:"Astrology certificate",theme:{background:[.969,.96,.988],panel:[.996,.994,1],border:[.815,.788,.902],accent:[.337,.255,.639],accentSoft:[.937,.921,.988],text:[.176,.153,.286],muted:[.396,.357,.525]}})}const Ge=842;function c(t){return Ge-t}function y(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function xe(t,s){return t.length<=s?t:`${t.slice(0,Math.max(0,s-1)).trimEnd()}...`}function _e(t){const s=t.customerDetails||{addressLine1:"",city:"",state:"",pincode:""};return[s.addressLine1,s.addressLine2,`${s.city}, ${s.state} - ${s.pincode}`].filter(Boolean).join(", ")}function me(t){const s=t.orderNumber||`ORDER-${t.id.slice(-6).toUpperCase()}`,a=t.receipt||{orderNumber:s,issuedAt:t.createdAt,paymentMethod:"Secure checkout",paymentStatus:"Paid",transactionId:"Generated at checkout",subtotal:t.totalAmount,shippingFee:0,totalAmount:t.totalAmount},r=t.customerDetails||{fullName:"DivineConnect Customer",email:"Not provided",phoneNumber:"Not provided",addressLine1:t.shippingAddress||"Address not available",city:"",state:"",pincode:""};return{orderNumber:s,receipt:a,customerDetails:r,invoiceDate:new Date(a.issuedAt||t.createdAt).toLocaleString("en-IN"),shippingAddress:_e(t)||t.shippingAddress||"Address not available"}}function qe(t){const{orderNumber:s,receipt:a,customerDetails:r,invoiceDate:n,shippingAddress:d}=me(t),i=t.items.map(l=>`
        <tr>
          <td>
            <div class="item-name">${y(l.name)}</div>
            <div class="item-meta">${y(l.templeName||l.category)}</div>
          </td>
          <td>${y(l.category)}</td>
          <td>${l.quantity}</td>
          <td>Rs. ${h(l.price)}</td>
          <td>Rs. ${h(l.price*l.quantity)}</td>
        </tr>`).join("");return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DivineConnect Invoice ${y(s)}</title>
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
          <div class="status-chip">${y(t.status)}</div>
          <p><strong>Invoice:</strong> ${y(s)}</p>
          <p><strong>Issued On:</strong> ${y(n)}</p>
          <p><strong>Transaction ID:</strong> ${y(a.transactionId||"Generated at checkout")}</p>
          <p><strong>Payment:</strong> ${y(a.paymentMethod)} (${y(a.paymentStatus||"Paid")})</p>
        </div>
      </section>

      <section class="summary-grid">
        <div class="panel">
          <h3>Grand Total</h3>
          <div class="summary-value">Rs. ${h(a.totalAmount)}</div>
          <div class="muted">Including shipping and recorded payment status.</div>
        </div>
        <div class="panel">
          <h3>Line Items</h3>
          <div class="summary-value">${t.itemCount||t.items.length}</div>
          <div class="muted">Products captured in this invoice.</div>
        </div>
        <div class="panel">
          <h3>Payment Status</h3>
          <div class="summary-value">${y(a.paymentStatus||"Paid")}</div>
          <div class="muted">${y(a.paymentMethod||"Secure checkout")}</div>
        </div>
      </section>

      <section class="detail-grid">
        <div class="panel">
          <h3>Bill To</h3>
          <p><strong>${y(r.fullName)}</strong></p>
          <p>${y(r.email)}</p>
          <p>${y(r.phoneNumber)}</p>
        </div>
        <div class="panel">
          <h3>Delivery Address</h3>
          <p>${y(d)}</p>
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
          <div class="totals-row"><span>Subtotal</span><strong>Rs. ${h(a.subtotal)}</strong></div>
          <div class="totals-row"><span>Shipping</span><strong>Rs. ${h(a.shippingFee)}</strong></div>
          <div class="totals-row grand"><span>Grand Total</span><span>Rs. ${h(a.totalAmount)}</span></div>
        </div>
        <div class="footer-note">
          This invoice is generated by DivineConnect for order support, print records, and payment reconciliation.
        </div>
      </section>
    </div>
  </body>
</html>`}function Ve(t){const{orderNumber:s,receipt:a,customerDetails:r,invoiceDate:n,shippingAddress:d}=me(t),i=[{type:"rect",x:0,y:0,width:595,height:842,fillColor:[.965,.976,.992]},{type:"rect",x:34,y:650,width:527,height:158,fillColor:[.059,.239,.388]},{type:"text",x:58,y:c(66),text:"DivineConnect Finance Desk",size:10,bold:!0,color:[.867,.914,.965]},{type:"text",x:58,y:c(102),text:"Tax Invoice / Order Receipt",size:25,bold:!0,color:[1,1,1]},{type:"text",x:58,y:c(132),text:"A structured commercial layout for sacred commerce billing, payment verification, and support workflows.",size:11,color:[.875,.922,.969],maxWidth:290,lineHeight:15},{type:"rect",x:380,y:676,width:157,height:98,fillColor:[.114,.314,.482]},{type:"text",x:396,y:c(68),text:t.status.toUpperCase(),size:9,bold:!0,color:[1,.934,.78]},{type:"text",x:396,y:c(98),text:s,size:16,bold:!0,color:[1,1,1],maxWidth:124,lineHeight:18},{type:"text",x:396,y:c(128),text:`Issued On: ${n}`,size:10,color:[.922,.953,.984],maxWidth:125},{type:"text",x:396,y:c(146),text:`Txn ID: ${a.transactionId||"Generated at checkout"}`,size:10,color:[.922,.953,.984],maxWidth:125,lineHeight:13},{type:"rect",x:34,y:538,width:250,height:88,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"rect",x:311,y:538,width:250,height:88,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:c(198),text:"Bill To",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:52,y:c(224),text:r.fullName||"DivineConnect Customer",size:13,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:52,y:c(244),text:`${r.email||"Not provided"} | ${r.phoneNumber||"Not provided"}`,size:10,color:[.353,.404,.463],maxWidth:214,lineHeight:13},{type:"text",x:329,y:c(198),text:"Invoice Snapshot",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:329,y:c(224),text:`Payment: ${a.paymentMethod||"Secure checkout"}`,size:11,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:329,y:c(244),text:`Status: ${a.paymentStatus||"Paid"} | Items: ${t.itemCount||t.items.length}`,size:10,color:[.353,.404,.463],maxWidth:214,lineHeight:13},{type:"rect",x:34,y:256,width:527,height:250,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:c(320),text:"Order Items",size:10,bold:!0,color:[.353,.404,.463]},{type:"rect",x:52,y:458,width:491,height:30,fillColor:[.925,.949,.976]}],l=c(370);[{x:60,text:"Item"},{x:286,text:"Category"},{x:375,text:"Qty"},{x:430,text:"Rate"},{x:495,text:"Total"}].forEach(u=>{i.push({type:"text",x:u.x,y:l,text:u.text,size:9,bold:!0,color:[.353,.404,.463]})});let g=392;return t.items.forEach((u,v)=>{const b=g+v*30,x=c(b+20);i.push({type:"text",x:60,y:c(b),text:xe(u.name,28),size:11,bold:!0,color:[.114,.145,.18],maxWidth:214},{type:"text",x:286,y:c(b),text:xe(u.category,14),size:10,color:[.353,.404,.463]},{type:"text",x:375,y:c(b),text:String(u.quantity),size:10,color:[.114,.145,.18]},{type:"text",x:430,y:c(b),text:`Rs. ${h(u.price)}`,size:10,color:[.114,.145,.18]},{type:"text",x:495,y:c(b),text:`Rs. ${h(u.price*u.quantity)}`,size:10,bold:!0,color:[.114,.145,.18]},{type:"line",x1:52,y1:x,x2:543,y2:x,color:[.911,.933,.957],width:1})}),i.push({type:"rect",x:34,y:102,width:292,height:122,fillColor:[1,1,1],strokeColor:[.825,.866,.92],strokeWidth:1},{type:"text",x:52,y:c(636),text:"Delivery and Notes",size:10,bold:!0,color:[.353,.404,.463]},{type:"text",x:52,y:c(662),text:d,size:11,color:[.114,.145,.18],maxWidth:256,lineHeight:16},{type:"text",x:52,y:c(712),text:"This invoice is generated for payment records, order support, and print documentation inside DivineConnect.",size:10,color:[.353,.404,.463],maxWidth:256,lineHeight:14},{type:"rect",x:348,y:102,width:213,height:122,fillColor:[.862,.914,.969]},{type:"text",x:366,y:c(636),text:"Totals",size:10,bold:!0,color:[.208,.29,.38]},{type:"text",x:366,y:c(666),text:`Subtotal  Rs. ${h(a.subtotal)}`,size:11,color:[.114,.145,.18]},{type:"text",x:366,y:c(690),text:`Shipping  Rs. ${h(a.shippingFee)}`,size:11,color:[.114,.145,.18]},{type:"line",x1:366,y1:128,x2:543,y2:128,color:[.627,.718,.812],width:1},{type:"text",x:366,y:c(724),text:`Grand Total  Rs. ${h(a.totalAmount)}`,size:15,bold:!0,color:[.059,.239,.388]}),i}function O(t){F(`${(t.orderNumber||`order-${t.id.slice(-6)}`).toLowerCase()}-invoice`,{elements:Ve(t)})}function L(t){if(typeof window>"u")return;const s=window.open("","_blank","noopener,noreferrer,width=960,height=720");s&&(s.document.write(qe(t)),s.document.close(),s.focus(),s.print())}function et(){var _,q,V,K;const t=Ie(),[s,a]=Te(),r=ne,[n,d]=D.useState(null),[i,l]=D.useState([]),[g,u]=D.useState([]),[v,b]=D.useState([]),[x,j]=D.useState("bookings"),m=g[0]||null;D.useEffect(()=>{const o=s.get("tab");(o==="profile"||o==="bookings"||o==="orders"||o==="readings")&&j(o)},[s]),D.useEffect(()=>{(async()=>{try{const[f,I,T,z]=await Promise.all([Ne(r.uid),je(r.uid),we(r.uid),Ce(r.uid)]);d(f),l(I),u(T),b(z)}catch(f){console.error("Error fetching profile data:",f)}})()},[r]);const R=o=>{De(o.items.map(f=>({id:f.productId,name:f.name,price:f.price,image:f.image||"https://picsum.photos/seed/reorder/400/400",quantity:f.quantity,category:f.category,templeName:f.templeName,weight:f.weight,size:f.size}))),t("/cart")},he=o=>{if(o.type==="darshan"){t("/services/darshan");return}t(`/services/puja/${o.serviceId}`)},C=o=>{j(o),a({tab:o})},ue=o=>o.serviceTitle?o.serviceTitle:o.type==="darshan"?"Darshan Support":"Puja Booking",be=x==="bookings"?"Service Bookings":x==="orders"?"Order History":x==="readings"?"Astrology History":"Account Settings",ge=x==="bookings"?i.length:x==="orders"?g.length:x==="readings"?v.length:"Security",fe=[{key:"bookings",label:"Bookings",value:i.length},{key:"orders",label:"Orders",value:g.length},{key:"readings",label:"Readings",value:v.length}];return e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-4 gap-8",children:[e.jsxs("div",{className:"lg:col-span-1 space-y-6",children:[e.jsxs("div",{className:"bg-white p-8 rounded-[2rem] border border-stone-200 text-center",children:[e.jsx("img",{src:r.photoURL||"",alt:"",className:"w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-100"}),e.jsx("h2",{className:"text-xl font-bold text-stone-900",children:r.displayName}),e.jsx("p",{className:"text-stone-500 text-sm mb-6 capitalize",children:(n==null?void 0:n.role)||"Devotee"}),e.jsxs("div",{className:"space-y-3 text-left",children:[e.jsxs("div",{className:"flex items-center text-sm text-stone-600",children:[e.jsx($e,{className:"w-4 h-4 mr-2 text-stone-400"}),e.jsx("span",{className:"truncate",children:r.email})]}),(n==null?void 0:n.phoneNumber)&&e.jsxs("div",{className:"flex items-center text-sm text-stone-600",children:[e.jsx(ke,{className:"w-4 h-4 mr-2 text-stone-400"}),e.jsx("span",{children:n.phoneNumber})]})]}),e.jsx("div",{className:"grid grid-cols-3 gap-3 mt-6 text-left",children:fe.map(o=>e.jsxs("button",{type:"button",onClick:()=>C(o.key),className:`rounded-2xl border p-4 text-left transition-colors ${x===o.key?"border-orange-200 bg-orange-50":"border-stone-100 bg-stone-50 hover:border-orange-100 hover:bg-orange-50/40"}`,children:[e.jsx("p",{className:`text-[11px] uppercase tracking-wider font-bold mb-1 ${x===o.key?"text-orange-500":"text-stone-400"}`,children:o.label}),e.jsx("p",{className:"text-xl font-bold text-stone-900",children:o.value})]},o.key))})]}),e.jsxs("nav",{className:"bg-white rounded-[2rem] border border-stone-200 overflow-hidden",children:[e.jsxs("button",{onClick:()=>C("profile"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="profile"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(Re,{className:"w-5 h-5 mr-3"}),"My Profile"]}),e.jsxs("button",{onClick:()=>C("bookings"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="bookings"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(M,{className:"w-5 h-5 mr-3"}),"My Bookings"]}),e.jsxs("button",{onClick:()=>C("orders"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="orders"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(P,{className:"w-5 h-5 mr-3"}),"My Orders"]}),e.jsxs("button",{onClick:()=>C("readings"),className:`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${x==="readings"?"bg-orange-50 text-orange-600":"text-stone-600 hover:bg-stone-50"}`,children:[e.jsx(ie,{className:"w-5 h-5 mr-3"}),"Astrology History"]}),e.jsxs("button",{onClick:()=>t("/vendor"),className:"w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors",children:[e.jsx(le,{className:"w-5 h-5 mr-3"}),"Vendor Dashboard"]}),e.jsxs("button",{onClick:()=>t("/admin"),className:"w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors",children:[e.jsx(le,{className:"w-5 h-5 mr-3"}),"Admin Dashboard"]})]})]}),e.jsx("div",{className:"lg:col-span-3",children:e.jsxs("div",{className:"bg-white rounded-[2.5rem] border border-stone-200 min-h-[600px] overflow-hidden",children:[e.jsxs("div",{className:"px-8 py-6 border-b border-stone-100 flex justify-between items-center",children:[e.jsx("h3",{className:"text-xl font-serif font-bold text-stone-900",children:be}),e.jsxs("div",{className:"flex items-center gap-3",children:[m?e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"hidden md:inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(Se,{className:"w-4 h-4 mr-2"}),"Invoice Ready"]}):null,e.jsx("span",{className:"bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold",children:ge})]})]}),e.jsxs("div",{className:"p-8",children:[m&&x!=="orders"?e.jsx("div",{className:"mb-8 rounded-[2rem] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-stone-50 p-6",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2",children:"Latest Invoice"}),e.jsxs("h4",{className:"text-lg font-bold text-stone-900",children:["Order #",m.orderNumber]}),e.jsxs("p",{className:"text-sm text-stone-600 mt-1",children:[m.items.length," items, ",(_=m.customerDetails)==null?void 0:_.fullName,","," ",(q=m.customerDetails)==null?void 0:q.phoneNumber]}),e.jsxs("p",{className:"text-sm text-stone-500 mt-1",children:["Total: Rs. ",h(m.totalAmount)," | Issued:"," ",new Date(((V=m.receipt)==null?void 0:V.issuedAt)||m.createdAt).toLocaleString()]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(P,{className:"w-4 h-4 mr-2"}),"View Order"]}),e.jsxs("button",{type:"button",onClick:()=>O(m),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>L(m),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]})]})]})}):null,x==="profile"?e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider",children:"Full Name"}),e.jsx("div",{className:"p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900",children:r.displayName})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider",children:"Email Address"}),e.jsx("div",{className:"p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900",children:r.email})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Quick Reorder"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Rebuild past prasad and spiritual offering orders directly into your cart."})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Book Again"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Repeat past puja or darshan flows without manually searching again."})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-5",children:[e.jsx("p",{className:"text-sm font-bold text-stone-900 mb-2",children:"Saved Readings"}),e.jsx("p",{className:"text-sm text-stone-500",children:"Review recent astrology insights and continue into remedies when needed."})]})]}),m?e.jsx("div",{className:"rounded-[2rem] border border-orange-100 bg-orange-50 p-6",children:e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center md:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2",children:"Latest Invoice"}),e.jsxs("h4",{className:"text-lg font-bold text-stone-900",children:["Order #",m.orderNumber]}),e.jsxs("p",{className:"text-sm text-stone-600 mt-1",children:[m.items.length," items | Rs. ",h(m.totalAmount)]}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Transaction ID: ",((K=m.receipt)==null?void 0:K.transactionId)||"Generated at checkout"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("button",{type:"button",onClick:()=>C("orders"),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(P,{className:"w-4 h-4 mr-2"}),"Open Orders"]}),e.jsxs("button",{type:"button",onClick:()=>O(m),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>L(m),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>ce(m),className:"inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Order Certificate"]})]})]})}):null,e.jsxs("div",{className:"pt-8 border-t border-stone-100",children:[e.jsx("h4",{className:"text-lg font-bold text-stone-900 mb-6",children:"Demo Access"}),e.jsxs("div",{className:"max-w-md space-y-4",children:[e.jsxs("p",{className:"text-sm text-stone-600",children:["This static demo does not require sign-in. If you want sample credentials for presentations, use"," ",e.jsx("span",{className:"font-bold text-stone-900",children:ae.email})," /"," ",e.jsx("span",{className:"font-bold text-stone-900",children:ae.password}),"."]}),e.jsxs("div",{className:"grid grid-cols-1 gap-3 text-sm text-stone-600",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Devotee demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:ne.email})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Vendor demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:ye.email})]}),e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:["Admin demo: ",e.jsx("span",{className:"font-bold text-stone-900",children:ve.email})]})]})]})]})]}):x==="bookings"?e.jsx("div",{className:"space-y-4",children:i.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(M,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No bookings found."})]}):i.map(o=>e.jsxs("div",{className:"flex items-center justify-between p-6 rounded-2xl border border-stone-100 hover:border-orange-100 transition-colors",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0",children:e.jsx(M,{className:"w-6 h-6 text-orange-600"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-bold text-stone-900",children:ue(o)}),e.jsxs("p",{className:"text-xs text-stone-500",children:[o.date," at ",o.timeSlot]}),e.jsxs("p",{className:"text-xs text-stone-500",children:["Certificate Ref: ",o.bookingReference||o.id.slice(-8).toUpperCase()]}),o.mode&&e.jsxs("p",{className:"text-xs text-stone-500 capitalize",children:[o.mode," pandit ji service"]})]})]}),e.jsxs("div",{className:"text-right space-y-3",children:[e.jsxs("p",{className:"font-bold text-stone-900",children:["Rs. ",h(o.totalAmount)]}),e.jsx("span",{className:`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.status==="confirmed"?"bg-emerald-100 text-emerald-700":o.status==="pending"?"bg-amber-100 text-amber-700":o.status==="completed"?"bg-blue-100 text-blue-700":"bg-stone-100 text-stone-500"}`,children:o.status}),e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>he(o),className:"inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors",children:["Book Again",e.jsx(de,{className:"w-4 h-4 ml-1"})]})}),e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>He(o,n),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Certificate"]})}),o.type==="puja"?e.jsx("div",{children:e.jsxs("button",{type:"button",onClick:()=>Fe(o,n),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Invitation"]})}):null]})]},o.id))}):x==="orders"?e.jsx("div",{className:"space-y-4",children:g.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(P,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No orders found."})]}):g.map(o=>{var f,I,T,z,Q,Y,J,Z,X,ee,te,se,oe,re;return e.jsxs("div",{className:"p-6 rounded-2xl border border-stone-100",children:[e.jsx("div",{className:"mb-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3",children:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold uppercase tracking-[0.24em] text-orange-500",children:"Invoice Ready"}),e.jsx("p",{className:"text-sm font-medium text-stone-600 mt-1",children:"Full invoice includes order number, customer details, payment method, price breakup, and delivery address."})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>O(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>L(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>ce(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Order Certificate"]})]})]})}),e.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsxs("span",{className:"text-xs font-bold text-stone-400",children:["Order #",o.orderNumber||o.id.slice(-6).toUpperCase()]}),e.jsx("p",{className:"text-xs text-stone-500 mt-1",children:new Date(o.createdAt).toLocaleDateString()}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Receipt issued: ",new Date(((f=o.receipt)==null?void 0:f.issuedAt)||o.createdAt).toLocaleString()]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>R(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(Ae,{className:"w-4 h-4 mr-2"}),"Reorder"]}),e.jsxs("button",{type:"button",onClick:()=>O(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-2"}),"Download Invoice"]}),e.jsxs("button",{type:"button",onClick:()=>L(o),className:"inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors",children:[e.jsx(E,{className:"w-4 h-4 mr-2"}),"Print Invoice"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-2xl border border-stone-100 bg-white p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-3",children:"Receipt Details"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-stone-600",children:[e.jsxs("p",{children:["Order No: ",e.jsx("span",{className:"font-bold text-stone-900",children:o.orderNumber})]}),e.jsxs("p",{children:["Payment: ",e.jsx("span",{className:"font-bold text-stone-900",children:(I=o.receipt)==null?void 0:I.paymentMethod})]}),e.jsxs("p",{children:["Payment Status:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((T=o.receipt)==null?void 0:T.paymentStatus)||"Paid"})]}),e.jsxs("p",{children:["Customer: ",e.jsx("span",{className:"font-bold text-stone-900",children:(z=o.customerDetails)==null?void 0:z.fullName})]}),e.jsxs("p",{children:["Contact: ",e.jsx("span",{className:"font-bold text-stone-900",children:(Q=o.customerDetails)==null?void 0:Q.phoneNumber})]}),e.jsxs("p",{className:"md:col-span-2",children:["Email: ",e.jsx("span",{className:"font-bold text-stone-900",children:(Y=o.customerDetails)==null?void 0:Y.email})]}),e.jsxs("p",{className:"md:col-span-2",children:["Transaction ID:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((J=o.receipt)==null?void 0:J.transactionId)||"Generated at checkout"})]})]})]}),e.jsxs("p",{className:"text-sm font-bold text-stone-900",children:[o.items.length," Items"]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:o.items.slice(0,3).map(N=>e.jsxs("span",{className:"px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold",children:[N.name," x ",N.quantity]},`${o.id}-${N.productId}`))}),e.jsx("p",{className:"text-sm text-stone-500",children:o.shippingAddress}),e.jsxs("div",{className:"text-xs text-stone-500 space-y-1",children:[e.jsxs("p",{children:[(Z=o.customerDetails)==null?void 0:Z.fullName," | ",(X=o.customerDetails)==null?void 0:X.phoneNumber]}),e.jsx("p",{children:(ee=o.customerDetails)==null?void 0:ee.email})]}),o.estimatedDeliveryDate?e.jsxs("div",{className:"rounded-2xl bg-emerald-50 border border-emerald-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1",children:"Estimated Delivery"}),e.jsx("p",{className:"text-sm font-bold text-stone-900",children:new Date(o.estimatedDeliveryDate).toLocaleDateString()})]}):null,e.jsxs("div",{className:"rounded-2xl bg-stone-50 border border-stone-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-2",children:"Receipt Summary"}),e.jsxs("div",{className:"space-y-1 text-sm text-stone-600",children:[o.items.map(N=>e.jsxs("p",{children:[N.name," x ",N.quantity,":"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",h(N.price*N.quantity)]})]},`${o.id}-${N.productId}-line`)),e.jsxs("p",{children:["Subtotal:"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",h(((te=o.receipt)==null?void 0:te.subtotal)||o.totalAmount)]})]}),e.jsxs("p",{children:["Shipping:"," ",e.jsxs("span",{className:"font-bold text-stone-900",children:["Rs. ",h(((se=o.receipt)==null?void 0:se.shippingFee)||0)]})]}),e.jsxs("p",{children:["Payment:"," ",e.jsx("span",{className:"font-bold text-stone-900",children:((oe=o.receipt)==null?void 0:oe.paymentMethod)||"Secure checkout"})]})]})]}),(re=o.statusTimeline)!=null&&re.length?e.jsxs("div",{className:"rounded-2xl border border-stone-100 p-4",children:[e.jsx("p",{className:"text-xs font-bold text-stone-400 uppercase tracking-wider mb-3",children:"Order Journey"}),e.jsx("div",{className:"space-y-3",children:o.statusTimeline.map(N=>e.jsxs("div",{className:"flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-stone-900",children:N.label}),e.jsx("p",{className:"text-xs text-stone-500",children:N.note})]}),e.jsx("span",{className:"text-[11px] font-medium text-stone-400 whitespace-nowrap",children:new Date(N.completedAt).toLocaleDateString()})]},`${o.id}-${N.status}`))})]}):null]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("p",{className:"font-bold text-stone-900",children:["Rs. ",h(o.totalAmount)]}),e.jsx("span",{className:"text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700",children:o.status})]})]})]},o.id)})}):e.jsx("div",{className:"space-y-4",children:v.length===0?e.jsxs("div",{className:"text-center py-20",children:[e.jsx(ie,{className:"w-12 h-12 text-stone-200 mx-auto mb-4"}),e.jsx("p",{className:"text-stone-400",children:"No astrology readings found yet."})]}):v.map(o=>e.jsxs("div",{className:"p-6 rounded-2xl border border-stone-100",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold text-orange-500 uppercase tracking-wider",children:o.readingType==="kundali-match"?"Kundali Match":o.readingType==="rashi-phal"?"Rashi Phal":"Astrology Reading"}),e.jsx("h4",{className:"text-lg font-bold text-stone-900 mt-1",children:o.name}),e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:[new Date(o.createdAt).toLocaleDateString()," | ",o.pob]}),o.partnerName?e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Match with ",o.partnerName]}):null,o.rashi?e.jsxs("p",{className:"text-xs text-stone-500 mt-1",children:["Rashi: ",o.rashi]}):null]}),e.jsxs("button",{type:"button",onClick:()=>t("/astrology"),className:"inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors",children:["Open AI Astrology",e.jsx(de,{className:"w-4 h-4 ml-1"})]})]}),o.userQuery?e.jsxs("div",{className:"rounded-2xl bg-orange-50 border border-orange-100 p-4 mb-4",children:[e.jsx("p",{className:"text-xs font-bold text-orange-600 uppercase tracking-wider mb-2",children:"Your Question"}),e.jsx("p",{className:"text-sm text-stone-700",children:o.userQuery})]}):null,e.jsx("div",{className:"rounded-2xl bg-stone-50 border border-stone-100 p-4",children:e.jsx("p",{className:"text-sm text-stone-700 whitespace-pre-wrap line-clamp-6",children:o.reading})}),o.readingType==="kundali-match"?e.jsx("div",{className:"mt-4",children:e.jsxs("button",{type:"button",onClick:()=>Ue(o),className:"inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors",children:[e.jsx(w,{className:"w-4 h-4 mr-1.5"}),"Download Match Certificate"]})}):null]},o.id))})]})]})})]})})}export{et as default};
