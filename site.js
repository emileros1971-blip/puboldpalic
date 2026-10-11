'use strict';
(() => {
 const c=window.PUB_TEXT,base=document.body.dataset.base||'';
 const $=id=>document.getElementById(id);
 if(document.body.dataset.page==='index' && (location.hash==='#menu'||location.hash==='#drinks'||location.hash.startsWith('#drink-'))) {location.replace(location.hash==='#menu'?'meni.html':'bar.html'+location.hash);return;}

 const nav=document.querySelector('.nav-toggle');
 nav?.addEventListener('click',()=>{const open=nav.getAttribute('aria-expanded')!=='true';nav.setAttribute('aria-expanded',String(open));$('navigation').classList.toggle('open',open)});
 document.querySelectorAll('.navigation a').forEach(a=>a.addEventListener('click',()=>{nav?.setAttribute('aria-expanded','false');$('navigation').classList.remove('open')}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav?.setAttribute('aria-expanded','false');$('navigation').classList.remove('open')}});
 const search=$('pizza-search');let filter='all';
 const normal=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function filterPizzas(){let visible=0;const q=normal(search.value.trim());document.querySelectorAll('#pizza-list .pizza-card').forEach(el=>{const show=normal(el.dataset.search).includes(q)&&(filter==='all'||el.dataset.tags.split(' ').includes(filter));el.hidden=!show;if(show)visible++});$('no-results').hidden=visible>0;}
 search?.addEventListener('input',filterPizzas);
 document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});filterPizzas()}));
 const photoDialog=$('photo-dialog');
 document.querySelectorAll('[data-lightbox]').forEach(a=>a.addEventListener('click',e=>{if(typeof photoDialog.showModal!=='function')return;e.preventDefault();$('photo-full').src=a.href;$('photo-full').alt=a.dataset.lightbox;$('photo-caption').textContent=a.dataset.lightbox;photoDialog.showModal()}));
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close-dialog')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
 const audio=$('lounge-audio'),musicDialog=$('music-dialog'),trackButtons=[...document.querySelectorAll('[data-track]')];let track=null;
 audio.volume=.22;
 function updateMusic(){trackButtons.forEach(b=>{const playing=b.dataset.track===track&&!audio.paused;b.textContent=playing?c.pause:c.play;b.setAttribute('aria-pressed',String(playing))})}
 document.querySelectorAll('.music-open').forEach(b=>b.addEventListener('click',()=>musicDialog.showModal()));
 trackButtons.forEach(btn=>btn.addEventListener('click',async()=>{try{if(track===btn.dataset.track&&!audio.paused)audio.pause();else{if(track!==btn.dataset.track){track=btn.dataset.track;audio.src=base+'assets/lounge-'+track+'.mp3'}await audio.play();$('music-message').textContent=c.musicHint}updateMusic()}catch{$('music-message').textContent=c.audioError;updateMusic()}}));
 document.querySelector('.music-stop')?.addEventListener('click',()=>{audio.pause();audio.currentTime=0;updateMusic()});
 audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);audio.addEventListener('error',()=>{$('music-message').textContent=c.audioError;updateMusic()});
 const board=$('game-board');if(!board)return;
 const start=$('game-start'),resume=$('game-resume'),share=$('game-share');let state='idle',caught=0,mistakes=0,startAt=0,elapsed=0,timer=null,lastResult=null;
 const storageKey='puboldpalic-pepperoni-v1-best';
 const safeRead=()=>{try{const n=Number(localStorage.getItem(storageKey));return n>0&&Number.isFinite(n)?n:null}catch{return null}};
 const format=n=>(n/1000).toFixed(1)+'s';
 let best=safeRead();$('best-time').textContent=best?format(best):'—';
 function elapsedNow(){return elapsed+(state==='running'?performance.now()-startAt:0)}
 function drawStats(){$('caught-count').textContent=caught;$('mistake-count').textContent=mistakes;$('game-time').textContent=format(elapsedNow())}
 function drawPizza(){board.replaceChildren();const phase=Math.random()*Math.PI*2;let index=0;const positions=[[.5,.5]];for(const [count,radius]of [[6,.15],[10,.28],[14,.405]])for(let i=0;i<count;i++){const a=phase+i*2*Math.PI/count+(count===10?.17:0);positions.push([.5+Math.cos(a)*radius,.5+Math.sin(a)*radius])}for(const [x,y]of positions){const b=document.createElement('button');b.type='button';b.className='pepperoni';b.style.left=x*100+'%';b.style.top=y*100+'%';b.setAttribute('aria-label',c.slice+' '+(++index));b.setAttribute('aria-pressed','false');b.disabled=state!=='running';b.addEventListener('click',e=>{e.stopPropagation();if(state!=='running')return;if(b.classList.contains('caught')){miss();return}b.classList.add('caught');b.setAttribute('aria-pressed','true');caught++;drawStats();if(caught===31)finish(true)});board.appendChild(b)}}
 function stopTimer(){clearInterval(timer);timer=null;}
 function setEnabled(on){board.querySelectorAll('button').forEach(b=>b.disabled=!on);board.classList.toggle('inactive',!on)}
 function begin(){stopTimer();state='running';caught=0;mistakes=0;elapsed=0;startAt=performance.now();lastResult=null;share.hidden=true;resume.hidden=true;board.classList.remove('won');drawPizza();setEnabled(true);drawStats();$('game-status').textContent=c.gameRules;start.textContent=c.restart;timer=setInterval(drawStats,100)}
 function miss(){mistakes++;board.classList.remove('miss');void board.offsetWidth;board.classList.add('miss');drawStats();if(mistakes>=3)finish(false)}
 function finish(won){elapsed=elapsedNow();state=won?'won':'lost';stopTimer();setEnabled(false);drawStats();$('game-status').textContent=won?c.win:c.lose;board.classList.toggle('won',won);if(won){if(!best||elapsed<best){best=elapsed;try{localStorage.setItem(storageKey,String(best))}catch{}$('best-time').textContent=format(best)}lastResult='Pub Old Palić · '+c.win+' '+c.time+': '+format(elapsed)+' · '+c.mistakes+': '+mistakes+'/3';share.hidden=false}}
 board.addEventListener('click',()=>{if(state==='running')miss()});
 start.addEventListener('click',begin);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='running'){elapsed=elapsedNow();state='paused';stopTimer();setEnabled(false);resume.hidden=false;$('game-status').textContent=c.gamePaused;drawStats()}});
 resume.addEventListener('click',()=>{if(state!=='paused')return;state='running';startAt=performance.now();setEnabled(true);resume.hidden=true;$('game-status').textContent=c.gameRules;timer=setInterval(drawStats,100)});
 share.addEventListener('click',async()=>{if(!lastResult)return;const url=location.href.split('#')[0];try{if(navigator.share)await navigator.share({title:'Pub Old Palić · 31',text:lastResult,url});else if(navigator.clipboard){await navigator.clipboard.writeText(lastResult+'\n'+url);$('game-status').textContent=c.copied}else $('game-status').textContent=c.shareFail}catch(e){if(e.name!=='AbortError')$('game-status').textContent=c.shareFail}});
 drawPizza();drawStats();
})();
