const $ = s => document.querySelector(s);
let content = null;
const schemas = {
 projects: [{key:'title',label:'Project title'},{key:'description',label:'Description',full:true},{key:'techText',label:'Technologies (comma separated)'},{key:'link',label:'Project URL'},{key:'featured',label:'Featured? (true/false)'}],
 skills: [{key:'name',label:'Skill name'},{key:'level',label:'Level'},{key:'category',label:'Category'}],
 languages: [{key:'name',label:'Language'},{key:'level',label:'Level'}],
 experience: [{key:'title',label:'Role / title'},{key:'organization',label:'Company / organization'},{key:'period',label:'Period'},{key:'description',label:'Description',full:true}],
 education: [{key:'title',label:'Degree / title'},{key:'organization',label:'Institution'},{key:'period',label:'Period'},{key:'description',label:'Description',full:true}],
 certifications: [{key:'title',label:'Certification'},{key:'organization',label:'Issuer'},{key:'period',label:'Date / period'}],
 achievements: [{key:'title',label:'Achievement'},{key:'organization',label:'Organization'},{key:'period',label:'Date / period'}]
};
const uid = () => 'item-' + Math.random().toString(36).slice(2,10);
function msg(el, text, error=false){el.textContent=text;el.classList.toggle('error',error)}
async function api(url, options={}) {
 const r=await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
 const data=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(data.error||'Request failed'); return data;
}
async function status(){
 try {const s=await api('/api/admin/status'); if(s.loggedIn) await openDashboard();} catch {}
}
$('#loginForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);
 try {await api('/api/admin/login',{method:'POST',body:JSON.stringify({username:f.get('username'),password:f.get('password')})});await openDashboard();}
 catch(err){msg($('#loginMessage'),err.message,true)}
});
async function openDashboard(){
 try{content=await api('/api/content');$('#loginPanel').hidden=true;$('#dashboard').hidden=false;renderAll();}
 catch(err){msg($('#loginMessage'),err.message,true)}
}
function renderAll(){
 document.querySelectorAll('[data-profile]').forEach(el=>el.value=content.profile?.[el.dataset.profile]||'');
 Object.keys(schemas).forEach(renderList);
}
function renderList(key){
 const target=$('#'+key+'Editor');target.innerHTML='';
 (content[key] ||= []).forEach((item,index)=>{
  const card=document.createElement('div');card.className='editor-item';
  schemas[key].forEach(field=>{
   let value=item[field.key]??'';
   if(field.key==='techText') value=Array.isArray(item.tech)?item.tech.join(', '):'';
   const label=document.createElement('label');if(field.full)label.className='full';label.textContent=field.label;
   let el;
   if(field.key==='description'){el=document.createElement('textarea');el.rows=2;}
   else {el=document.createElement('input');if(field.key==='link')el.type='url';}
   el.value=value;el.dataset.key=key;el.dataset.index=index;el.dataset.field=field.key;
   el.addEventListener('input',()=>{
    const k=el.dataset.key,i=Number(el.dataset.index),f=el.dataset.field;
    content[k][i][f]=f==='techText'?el.value.split(',').map(x=>x.trim()).filter(Boolean):f==='featured'?el.value.toLowerCase()==='true':el.value;
    if(f==='techText'){content[k][i].tech=content[k][i][f];}
   });
   label.appendChild(el);card.appendChild(label);
  });
  const remove=document.createElement('button');remove.type='button';remove.className='remove-btn';remove.textContent='Remove this item';remove.addEventListener('click',()=>{content[key].splice(index,1);renderList(key)});card.appendChild(remove);target.appendChild(card);
 });
}
document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{
 const key=btn.dataset.add;const item={id:uid()};
 schemas[key].forEach(f=>{if(f.key==='techText')item.tech=[];else if(f.key==='featured')item.featured=false;else item[f.key]='';});
 content[key].push(item);renderList(key);
}));
$('#saveBtn').addEventListener('click',async()=>{
 document.querySelectorAll('[data-profile]').forEach(el=>content.profile[el.dataset.profile]=el.value.trim());
 try{await api('/api/admin/content',{method:'PUT',body:JSON.stringify(content)});msg($('#saveMessage'),'Saved successfully. Your public portfolio is updated.');}
 catch(err){msg($('#saveMessage'),err.message,true)}
});
$('#logoutBtn').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'});}catch{} location.reload();});
$('#uploadForm').addEventListener('submit',async e=>{
 e.preventDefault();const form=new FormData(e.currentTarget);
 try{const r=await fetch('/api/admin/upload',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw new Error(d.error||'Upload failed');msg($('#uploadMessage'),`Uploaded: ${d.url} — copy this URL into the appropriate field.`); }
 catch(err){msg($('#uploadMessage'),err.message,true)}
});
status();
