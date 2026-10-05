const nav=document.getElementById('collections'),viewer=document.getElementById('viewer');
fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Arşiv yüklenemedi');return r.json()}).then(sets=>{
 const total=sets.filter(set=>set.id!=='all').reduce((sum,set)=>sum+set.count,0);
 document.getElementById('count').textContent=total+' çalışma · '+(sets.length-1)+' koleksiyon';
 let group='';
 for(const set of sets){if(group!==set.group){group=set.group;const h=document.createElement('h2');h.textContent=group;nav.append(h)}const a=document.createElement('a');a.href='#'+set.id;a.dataset.id=set.id;const name=document.createElement('span');name.textContent=set.title;const count=document.createElement('small');count.textContent=String(set.count).padStart(2,'0');a.append(name,count);nav.append(a)}
 function select(){const set=sets.find(s=>s.id===location.hash.slice(1))||sets[0];document.getElementById('title').textContent=set.title;document.getElementById('group').textContent=set.group+' / '+set.count+' çalışma';const open=document.getElementById('open');open.href=set.url;if(viewer.getAttribute('src')!==set.url)viewer.src=set.url;viewer.title=set.title;for(const a of nav.querySelectorAll('a')){if(a.dataset.id===set.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}document.title=set.title+' · iwrzwr archive'}
 window.addEventListener('hashchange',select);select();
}).catch(error=>{document.getElementById('title').textContent=error.message});
