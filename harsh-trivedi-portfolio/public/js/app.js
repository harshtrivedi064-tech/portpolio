const $ = (s) => document.querySelector(s);
const safe = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function init() {
  let d;
  try { const r = await fetch('/api/content'); d = await r.json(); }
  catch { return; }
  const p = d.profile || {};
  document.title = `${p.name || 'Portfolio'} — Portfolio`;
  $('#heroName').innerHTML = `${safe(p.name || 'Your Name')}<span class="accent">.</span>`;
  $('#heroHeadline').textContent = p.headline || '';
  $('#heroIntro').textContent = p.intro || '';
  $('#aboutText').textContent = p.about || '';
  $('#availability').textContent = (p.availability || 'OPEN TO OPPORTUNITIES').toUpperCase();
  $('#location').textContent = p.location || '';
  $('#emailLink').href = p.email ? `mailto:${p.email}` : '#contact';
  $('#year').textContent = new Date().getFullYear();
  $('#projectsGrid').innerHTML = (d.projects || []).map(x => `<article class="project-card"><div class="project-top"><span>✳</span><span>↗</span></div><h3>${safe(x.title)}</h3><p>${safe(x.description)}</p><div class="project-tags">${(x.tech||[]).map(t=>`<span class="tag">${safe(t)}</span>`).join('')}</div>${x.link ? `<p style="margin-top:20px"><a href="${safe(x.link)}" target="_blank" rel="noopener noreferrer">View project ↗</a></p>` : ''}</article>`).join('') || '<p class="muted">Projects coming soon.</p>';
  $('#skillsGrid').innerHTML = (d.skills||[]).map(x=>`<span class="chip">${safe(x.name)} <small>${safe(x.level)}</small></span>`).join('');
  $('#languagesGrid').innerHTML = (d.languages||[]).map(x=>`<span class="chip">${safe(x.name)} <small>${safe(x.level)}</small></span>`).join('');
  const journey = [...(d.education||[]).map(x=>({...x,kind:'Education'})), ...(d.experience||[]).map(x=>({...x,kind:'Experience'}))].sort((a,b)=>(a.period||'').localeCompare(b.period||''));
  $('#journeyList').innerHTML = journey.map(x=>`<article class="timeline-item"><span class="period">${safe(x.period)} · ${safe(x.kind)}</span><h3>${safe(x.title)}${x.organization?' — '+safe(x.organization):''}</h3><p>${safe(x.description||'')}</p></article>`).join('') || '<p class="muted">Your journey will appear here.</p>';
  const achievements = [...(d.certifications||[]), ...(d.achievements||[])];
  $('#achievements').innerHTML = achievements.map(x=>`<span class="chip">${safe(x.title||x.name)}${x.organization?' · '+safe(x.organization):''}</span>`).join('') || '<span class="muted">Add certifications and achievements in Admin.</span>';
  const links = [...(d.socialLinks||[])];
  if (p.github) links.push({label:'GitHub',url:p.github});
  if (p.linkedin) links.push({label:'LinkedIn',url:p.linkedin});
  const unique = [...new Map(links.filter(x=>x.url).map(x=>[x.label,x])).values()];
  $('#socials').innerHTML = unique.map(x=>`<a href="${safe(x.url)}" target="_blank" rel="noopener noreferrer">${safe(x.label)} ↗</a>`).join('');
}
init();
