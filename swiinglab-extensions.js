
/* SwiingLab — navigation et carnets 2026-11-11. Préserve les stockages existants. */
const slxRead=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch(e){return fallback}};
const slxWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){alert("Enregistrement impossible. Vérifie l’espace de stockage.");return false}};
const slxBack=(fn,label="Retour")=>'<button class="slBack" onclick="'+fn+'">‹ '+label+'</button>';
const slxTop=(title,fn="slHome()",label="Accueil")=>'<div class="slPageTop">'+slxBack(fn,label)+'<h1>'+safe(title)+'</h1></div>';
const slxMenu=(items)=>'<div class="slTiles">'+items.map(x=>slCard(x[0],x[1],x[2],x[3],!!x[4])).join('')+'</div>';
const slxNum=x=>{if(x===null||x===undefined||String(x).trim()==="")return null;const n=Number(String(x).replace(",","."));return Number.isFinite(n)?n:null};
const slxId=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,7);
const slxDate=x=>x?new Date(x).toLocaleDateString("fr-FR"):"—";
const slxEmpty='<p class="muted">Aucune donnée enregistrée pour le moment.</p>';
function slxNav(title,back,items){realUI(slxTop(title,back)+slxMenu(items));setActiveTab("accueil")}
slHome=function(){
 const year=new Date().getFullYear(),goals=slxRead("swiinglab_goals_v1",[]).filter(g=>g.year===year).slice(0,3);
 realUI('<section class="slWelcome"><span class="slEyebrow">SWIINGLAB · MON ESPACE GOLF</span><div class="slWelcomeHead"><span class="slWelcomeLogo"></span><span><h1>Bienvenue sur le green.</h1><p>Ton golf, tes progrès, à ton rythme.</p></span></div></section>'+
 (goals.length?'<div class="info"><h3>Mes objectifs '+year+'</h3>'+goals.map(g=>slxProgressLine(g)).join('')+'</div>':'')+
 slxMenu([['◎','Entraînement','TrackMan · Putt Tracker','slxTraining()',true],['▣','Compétition','Carnet · Index · Palmarès','slxCompetition()',true],['▥','Centre de données','Statistiques · Objectifs · Records','slxData()',true],['◉','Mon sac','Clubs · Distances · Entretien','slxBagHome()',true],['⛳','Mes parcours','Carnet des golfs joués','slxCourses()',true],['◯','Mon profil','Profil · Imports · Sauvegarde','profile()',true]]));
 setActiveTab("accueil");
 slxWrappedCheck();
};
function slxTraining(){slxNav("Entraînement","slHome()",[['◉','TrackMan','Practice · Parcours','slTrackmanHome()',true],['◎','Putt Tracker','Centre d’entraînement putting','puttTrackerHome()',true],['▤','Historique des séances','Entraînements enregistrés','slxTrainingHistory()',true]])}
function slxTrainingHistory(){
 const h=loadHistory(),pt=ptSessions();
 realUI(slxTop("Historique des séances","slxTraining()","Entraînement")+
 '<h2>Entraînements</h2>'+(h.length?h.slice().reverse().map(s=>'<div class="histItem"><b>'+safe(s.nom||s.exercise||s.id||s.club||"Séance")+'</b><span>'+safe(s.date||"")+'</span></div>').join(''):slxEmpty)+
 '<h2>Putt Tracker</h2>'+(pt.length?pt.slice().reverse().map(s=>'<div class="histItem"><b>'+safe(s.exercise||"Putting")+'</b><span>'+Number(s.made||0)+'/'+Number(s.attempts||0)+'</span></div>').join(''):slxEmpty));
}
function slxCompetition(){slxNav("Compétition","slHome()",[['▤','Carnet de compétitions','Saisie et historique','slxComps()',true],['↘','Suivi de mon index WHS','Historique des index saisis','slxIndex()',true],['★','Mon palmarès','Résultats en tournoi','slxPalmares()',true]])}
const slxCompsGet=()=>slxRead("swiinglab_competitions_v1",[]);
function slxComps(){
 const a=slxCompsGet().slice().sort((x,y)=>y.date.localeCompare(x.date));
 realUI(slxTop("Carnet de compétitions","slxCompetition()","Compétition")+
 '<button class="primary" onclick="slxCompForm()">＋ Ajouter une compétition</button>'+
 (a.length?a.map(x=>'<div class="menuCard" onclick="slxCompForm(\''+x.id+'\')"><b>'+safe(x.name)+'</b><span class="muted">'+safe(x.date)+' · '+safe(x.course||"")+' · '+safe(x.format||"")+'</span><p>Brut '+safe(x.gross||"—")+' · Net '+safe(x.net||"—")+' · '+safe(x.place||"—")+' / '+safe(x.players||"—")+'</p></div>').join(''):slxEmpty));
}
function slxCompForm(id){
 const e=slxCompsGet().find(x=>x.id===id)||{},fields=[["name","Nom de la compétition","text"],["date","Date","date"],["course","Parcours","text"],["format","Formule de jeu","text"],["gross","Score brut","number"],["net","Score net","number"],["place","Position au classement","number"],["players","Nombre de participants","number"],["index","Index après compétition","number"]];
 realUI(slxTop(id?"Modifier une compétition":"Nouvelle compétition","slxComps()","Carnet")+
 '<div class="info"><form id="slxCompForm" onsubmit="slxCompSave(event,\''+(id||"")+'\')">'+fields.map(([key,label,type])=>'<div class="field"><label>'+label+'</label><input name="'+key+'" type="'+type+'" '+(type==="number"?'min="0" step="'+(key==="index"?'0.1':'1')+'"':'')+' value="'+safe(e[key]??(key==="date"?new Date().toISOString().slice(0,10):""))+'"></div>').join('')+
 '<button class="primary" type="submit">Enregistrer</button></form>'+(id?'<button class="secondary" onclick="slxCompDelete(\''+id+'\')">Supprimer</button>':'')+'</div>');
}
function slxCompSave(ev,id){
 ev.preventDefault();const f=new FormData(ev.target),r=Object.fromEntries(f.entries());if(!r.name.trim()){alert("Nom de compétition requis");return}
 if(r.place&&r.players&&Number(r.place)>Number(r.players)){alert("La position dépasse le nombre de participants.");return}
 const a=slxCompsGet(),i=a.findIndex(x=>x.id===id);r.id=id||slxId();if(i>=0)a[i]=r;else a.push(r);if(slxWrite("swiinglab_competitions_v1",a))slxComps();
}
function slxCompDelete(id){if(!confirm("Supprimer cette compétition ?"))return;slxWrite("swiinglab_competitions_v1",slxCompsGet().filter(x=>x.id!==id));slxComps()}
function slxIndex(){
 const all=slxCompsGet().filter(x=>x.index!==""&&slxNum(x.index)!==null).sort((a,b)=>a.date.localeCompare(b.date)),last=all.at(-1),best=all.length?Math.min(...all.map(x=>slxNum(x.index))):null;
 realUI(slxTop("Suivi de mon index WHS","slxCompetition()","Compétition")+'<div class="statsGrid"><div class="stat">Index actuel<strong>'+(last?safe(last.index):"—")+'</strong></div><div class="stat">Meilleur index<strong>'+(best===null?"—":best)+'</strong></div></div>'+
 '<p class="muted">Évolution interne selon les index saisis dans tes compétitions. L’index officiel reste celui de la FFGolf.</p>'+
 slxWHSChart(all)+(all.length?all.map(x=>'<div class="histItem"><b>'+safe(x.date)+'</b><span>'+safe(x.index)+' · '+safe(x.name)+'</span></div>').join(''):slxEmpty));
}
function slxWHSChart(all){
 const a=all.filter(x=>slxNum(x.index)!==null&&/^\\d{4}-\\d{2}-\\d{2}$/.test(x.date||""));
 if(!a.length)return '<div class="info"><h3>Évolution de l’index WHS</h3><p class="muted">Renseigne ton index après une compétition pour voir le graphique.</p></div>';
 const v=a.map(x=>slxNum(x.index)),lo=Math.floor(Math.min(...v)-1),hi=Math.ceil(Math.max(...v)+1),xp=i=>a.length===1?175:44+270*i/(a.length-1),yp=y=>153-125*(y-lo)/Math.max(1,hi-lo);
 const path=v.map((y,i)=>(i?'L':'M')+xp(i)+' '+yp(y)).join(' ');
 const dots=a.map((q,i)=>'<circle cx="'+xp(i)+'" cy="'+yp(v[i])+'" r="4" fill="#4dc7b4"><title>'+safe(q.date)+' : '+safe(q.index)+'</title></circle>').join('');
 return '<div class="info"><h3>Évolution de l’index WHS</h3><svg viewBox="0 0 345 193" role="img" aria-label="Évolution de l’index selon la date" style="width:100%"><line x1="42" y1="22" x2="42" y2="154" stroke="currentColor"/><line x1="42" y1="154" x2="325" y2="154" stroke="currentColor"/><text x="4" y="25" font-size="11" fill="currentColor">'+hi+'</text><text x="4" y="154" font-size="11" fill="currentColor">'+lo+'</text><text x="4" y="12" font-size="10" fill="currentColor">Index</text><path d="'+path+'" stroke="#4dc7b4" stroke-width="2.5" fill="none"/>'+dots+'<text x="45" y="181" font-size="10" fill="currentColor">'+safe(a[0].date)+'</text><text x="324" y="191" text-anchor="end" font-size="10" fill="currentColor">'+safe(a[a.length-1].date)+'</text></svg></div>';
}
function slxPalmares(){const a=slxCompsGet(),ranked=a.filter(x=>slxNum(x.place)>0),wins=ranked.filter(x=>Number(x.place)===1).length;
 realUI(slxTop("Mon palmarès","slxCompetition()","Compétition")+'<div class="statsGrid"><div class="stat">Compétitions<strong>'+a.length+'</strong></div><div class="stat">Victoires<strong>'+wins+'</strong></div></div>'+
 (ranked.length?ranked.map(x=>'<div class="histItem"><b>'+safe(x.name)+'</b><span>'+safe(x.place)+'e sur '+safe(x.players||"—")+'</span></div>').join(''):slxEmpty));
}
function slxData(){slxNav("Centre de données","slHome()",[['▥','Mes statistiques','Résultats par source','slxStats()',true],['◎','Mes objectifs','1 à 3 objectifs annuels','slxGoals()',true],['★','Mon Hall of Fame','Records personnels','slxRecords()',true]])}
function slxStats(){
 const real=(realGet().rounds||[]),virt=slVirtualData(),scores=virt.map(x=>slxNum(x.totalScore)).filter(x=>x!==null);
 realUI(slxTop("Mes statistiques","slxData()","Centre de données")+
 '<h2>Parcours sur simulateur</h2><div class="statsGrid"><div class="stat">Parties<strong>'+virt.length+'</strong></div><div class="stat">Score moyen<strong>'+(scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):"—")+'</strong></div></div>'+
 '<p class="muted">Les fairways, GIR et putts ne sont calculés que lorsqu’ils sont présents dans les données TrackMan. Aucune donnée manquante n’est inventée.</p>'+
 '<h2>Parcours réels</h2><div class="statsGrid"><div class="stat">Cartes enregistrées<strong>'+real.length+'</strong></div><div class="stat">Compétitions<strong>'+slxCompsGet().length+'</strong></div></div>'+
 slxMenu([['▥','Statistiques TrackMan Practice','Mesures techniques et exercices','progressHub()',true],['▤','Parcours virtuels','Scores des simulateurs','slVirtualHome()',true],['◉','Putting','Précision par distance','puttTrackerHome()',true]]));
}
function slxProgressLine(g){
 const current=slxGoalValue(g),base=slxNum(g.start),target=slxNum(g.target);
 const pct=base!==null&&target!==null&&current!==null&&target!==base?Math.max(0,Math.min(100,Math.round((current-base)/(target-base)*100))):0;
 return '<div style="margin:12px 0"><b>'+safe(g.name)+'</b><div class="muted">'+(current===null?'Aucune donnée':safe(current))+' / objectif '+safe(g.target)+'</div><div class="bar"><i style="width:'+pct+'%"></i></div></div>';
}
function slxGoalValue(g){
 if(g.source==="index"){const a=slxCompsGet().filter(x=>slxNum(x.index)!==null).sort((a,b)=>a.date.localeCompare(b.date));return a.length?slxNum(a.at(-1).index):null}
 if(g.source==="manual")return slxNum(g.current);
 return null;
}
function slxGoals(){
 const y=new Date().getFullYear(),a=slxRead("swiinglab_goals_v1",[]).filter(x=>x.year===y);
 realUI(slxTop("Mes objectifs "+y,"slxData()","Centre de données")+
 (a.length?a.map(g=>'<div class="info">'+slxProgressLine(g)+'<button class="secondary" onclick="slxGoalForm(\''+g.id+'\')">Modifier</button><button class="secondary" onclick="slxGoalDelete(\''+g.id+'\')">Supprimer</button></div>').join(''):slxEmpty)+
 (a.length<3?'<button class="primary" onclick="slxGoalForm()">＋ Ajouter un objectif</button>':'<p class="muted">Maximum : 3 objectifs pour cette année.</p>'));
}
function slxGoalForm(id){
 const a=slxRead("swiinglab_goals_v1",[]),g=a.find(x=>x.id===id)||{};
 realUI(slxTop("Objectif annuel","slxGoals()","Mes objectifs")+'<form id="slxGoalForm" class="info" onsubmit="slxGoalSave(event,\''+(id||"")+'\')">'+
 '<div class="field"><label>Intitulé</label><input name="name" required value="'+safe(g.name||"")+'"></div>'+
 '<div class="field"><label>Source</label><select name="source"><option value="manual" '+(g.source!=="index"?"selected":"")+'>Saisie manuelle</option><option value="index" '+(g.source==="index"?"selected":"")+'>Index des compétitions</option></select></div>'+
 [['start','Valeur de départ'],['current','Valeur actuelle si manuelle'],['target','Objectif']].map(([k,t])=>'<div class="field"><label>'+t+'</label><input type="number" step="0.1" name="'+k+'" value="'+safe(g[k]??"")+'"></div>').join('')+
 '<button class="primary" type="submit">Enregistrer</button></form>');
}
function slxGoalSave(ev,id){
 ev.preventDefault();const f=Object.fromEntries(new FormData(ev.target)),a=slxRead("swiinglab_goals_v1",[]),year=new Date().getFullYear(),i=a.findIndex(x=>x.id===id);
 if(i<0&&a.filter(x=>x.year===year).length>=3)return alert("Maximum trois objectifs.");
 const g={...f,id:id||slxId(),year};if(i>=0)a[i]=g;else a.push(g);
 if(slxWrite("swiinglab_goals_v1",a))slxGoals();
}
function slxGoalDelete(id){if(!confirm("Supprimer cet objectif ?"))return;slxWrite("swiinglab_goals_v1",slxRead("swiinglab_goals_v1",[]).filter(x=>x.id!==id));slxGoals()}
function slxRecords(){
 const comps=slxCompsGet(),real=realGet().rounds||[],virt=slVirtualData(),putts=ptSessions();
 const nums=a=>a.filter(x=>x!==null&&Number.isFinite(x));
 const min=a=>a.length?Math.min(...a):null;
 const ix=min(nums(comps.map(x=>slxNum(x.index))));
 const gross=min(nums(comps.map(x=>slxNum(x.gross))));
 const real18=min(nums(real.filter(x=>(Number(x.count)||x.holes?.length)===18).map(x=>Array.isArray(x.holes)&&x.holes.length===18?x.holes.reduce((v,h)=>v+(slxNum(h.shots)??0),0):null)));
 const virt18=min(nums(virt.filter(x=>Number(x.holeCount)===18).map(x=>slxNum(x.totalScore))));
 const streak=Math.max(0,...putts.map(x=>slxNum(x.maxStreak)||0));
 const records=slxRead("swiinglab_records_v1",[]);
 const info=[["Meilleur index compétition",ix],["Meilleur brut compétition",gross],["Meilleur score réel · 18 trous",real18],["Meilleur score simulateur · 18 trous",virt18],["Plus longue série de putts réussis",streak||null]];
 realUI(slxTop("Mon Hall of Fame","slxData()","Centre de données")+
 '<div class="statsGrid">'+info.map(([name,v])=>'<div class="stat">'+safe(name)+'<strong>'+(v===null?"—":safe(v))+'</strong></div>').join('')+'</div>'+
 '<p class="muted">Records séparés par source. Les cartes 9 trous ne sont pas comparées aux cartes 18 trous. Aucune mesure manquante n’est estimée.</p>'+
 
 '');
}
function slxRecordAdd(){const name=prompt("Exploit personnel (eagle, trou en un…)");if(!name||!name.trim())return;const a=slxRead("swiinglab_records_v1",[]);a.push({id:slxId(),name:name.trim(),date:new Date().toISOString().slice(0,10)});slxWrite("swiinglab_records_v1",a);slxRecords()}
function slxBagHome(){slxNav("Mon sac","slHome()",[['◉','Mes clubs','Fiches individuelles et carry','slxClubs()',true],['▥','Mes distances','Mémo du carry en mètres','slxDistances()',true],['▤','Carnet d’entretien','Interventions et réglages','slxMaintenance()',true]])}
const slxClubsGet=()=>{
 const existing=slxRead("swiinglab_clubs_v1",[]);
 if(Array.isArray(existing)&&existing.length)return existing;
 if(localStorage.getItem("swiinglab_clubs_migrated_v1"))return [];
 const legacy=loadBag(),out=Object.entries(legacy).filter(([k,v])=>v&&v.checked).map(([type,v])=>({
  id:slxId(),type,brand:"",model:"",shaft:"",flex:"",loft:"",lie:"",grip:"",
  // Ne jamais considérer automatiquement une distance totale comme un carry.
  carry:v.basis==="Total"?"":(slxNum(v.distance)??"")
 }));
 if(out.length&&!slxWrite("swiinglab_clubs_v1",out))return out;
 try{localStorage.setItem("swiinglab_clubs_migrated_v1","1")}catch(e){}
 return out;
};
function slxClubs(){
 const a=slxClubsGet();
 realUI(slxTop("Mes clubs","slxBagHome()","Mon sac")+'<button class="primary" onclick="slxClubForm()">＋ Ajouter un club</button>'+
 (a.length?a.map(x=>'<div class="menuCard" onclick="slxClubForm(\''+x.id+'\')"><b>'+safe(x.type)+'</b><span class="muted">'+safe([x.brand,x.model].filter(Boolean).join(" "))+' · Carry '+safe(x.carry||"—")+' m</span></div>').join(''):slxEmpty)+
 '<p class="muted">Le carry est une référence personnelle, jamais remplacée par une séance TrackMan. Les anciens réglages de ton sac sont conservés.</p>');
}
function slxClubForm(id){
 const c=slxClubsGet().find(x=>x.id===id)||{},types=['Driver','Bois 3','Bois 5','Bois 7','Hybride 3','Hybride 4','Hybride 5','Fer 2','Fer 3','Fer 4','Fer 5','Fer 6','Fer 7','Fer 8','Fer 9','PW','50°','52°','54°','56°','58°','60°','Putter'];
 realUI(slxTop("Fiche de club","slxClubs()","Mes clubs")+'<form class="info" onsubmit="slxClubSave(event,\''+(id||"")+'\')">'+
 '<div class="field"><label>Club</label><select name="type">'+types.map(t=>'<option '+(c.type===t?"selected":"")+'>'+t+'</option>').join('')+'</select></div>'+
 [['brand','Marque'],['model','Modèle'],['shaft','Shaft'],['flex','Flex'],['loft','Loft'],['lie','Lie'],['grip','Grip'],['carry','Carry de référence (m)']].map(([k,l])=>'<div class="field"><label>'+l+'</label><input name="'+k+'" '+(k==="carry"?'type="number" min="0" step="0.1"':'')+' value="'+safe(c[k]||"")+'"></div>').join('')+
 '<button class="primary" type="submit">Enregistrer</button></form>'+
 (id?'<button class="secondary" onclick="slxClubDelete(\''+id+'\')">Supprimer ce club</button>':''));
}
function slxClubSave(ev,id){
 ev.preventDefault();const d=Object.fromEntries(new FormData(ev.target)),a=slxClubsGet(),i=a.findIndex(x=>x.id===id);d.id=id||slxId();
 if(i>=0)a[i]=d;else a.push(d);
 if(slxWrite("swiinglab_clubs_v1",a)){const bag=loadBag(),c=d.type;if(!bag[c])bag[c]={};bag[c].checked=true;bag[c].distance=d.carry===""?"":Number(d.carry);bag[c].basis="Carry";saveBag(bag);slxClubs()}
}
function slxClubDelete(id){if(!confirm("Supprimer cette fiche ?"))return;slxWrite("swiinglab_clubs_v1",slxClubsGet().filter(x=>x.id!==id));slxClubs()}
function slxDistances(){
 const a=slxClubsGet();
 realUI(slxTop("Mes distances","slxBagHome()","Mon sac")+'<div class="info"><h3>Mémo Carry</h3>'+
 (a.length?'<table style="width:100%"><thead><tr><th>Club</th><th>Carry</th></tr></thead><tbody>'+a.map(x=>'<tr><td>'+safe(x.type)+'</td><td style="text-align:right">'+safe(x.carry||"—")+' m</td></tr>').join('')+'</tbody></table>':slxEmpty)+
 '<p class="muted">Pour modifier une valeur, ouvre la fiche du club dans « Mes clubs ».</p></div>');
}
const slxMaintGet=()=>slxRead("swiinglab_maintenance_v1",[]);
function slxMaintenance(){
 const a=slxMaintGet();
 realUI(slxTop("Carnet d’entretien","slxBagHome()","Mon sac")+'<button class="primary" onclick="slxMaintForm()">＋ Ajouter une intervention</button>'+
 (a.length?a.slice().reverse().map(x=>'<div class="menuCard" onclick="slxMaintForm(\''+x.id+'\')"><b>'+safe(x.club)+' · '+safe(x.action)+'</b><span class="muted">'+safe(x.date)+'</span></div>').join(''):slxEmpty));
}
function slxMaintForm(id){const x=slxMaintGet().find(v=>v.id===id)||{},a=slxClubsGet();
 realUI(slxTop("Intervention","slxMaintenance()","Entretien")+'<form class="info" onsubmit="slxMaintSave(event,\''+(id||"")+'\')">'+
 '<div class="field"><label>Club</label><select name="club">'+a.map(v=>'<option '+(x.club===v.type?"selected":"")+'>'+safe(v.type)+'</option>').join('')+'</select></div>'+
 [['date','Date','date'],['action','Intervention','text'],['notes','Notes','text'],['cost','Coût facultatif (€)','number']].map(([k,l,t])=>'<div class="field"><label>'+l+'</label><input name="'+k+'" type="'+t+'" '+(t==="number"?'min="0" step="0.01"':'')+' value="'+safe(x[k]||"")+'"></div>').join('')+
 '<button class="primary" type="submit">Enregistrer</button></form>');
}
function slxMaintSave(ev,id){ev.preventDefault();const r=Object.fromEntries(new FormData(ev.target)),a=slxMaintGet(),i=a.findIndex(x=>x.id===id);r.id=id||slxId();if(i>=0)a[i]=r;else a.push(r);if(slxWrite("swiinglab_maintenance_v1",a))slxMaintenance()}
function slxCourses(){
 const db=realGet(),rounds=db.rounds||[],additional=slxRead("swiinglab_courses_v1",[]),names=[...new Set([...rounds.map(r=>String(r.golf||r.course||"").trim()),...additional.map(x=>x.name)].filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
 realUI(slxTop("Mes parcours","slHome()")+'<button class="primary" onclick="slxCourseAdd()">＋ Ajouter un golf joué</button>'+
 (names.length?names.map(n=>'<div class="menuCard" onclick="slxCourseView(decodeURIComponent(\''+encodeURIComponent(n)+'\'))"><b>'+safe(n)+'</b><span class="muted">'+rounds.filter(r=>(r.golf||r.course)===n).length+' carte(s) réelle(s)</span></div>').join(''):slxEmpty)+
 '<button class="secondary" onclick="slRealHome()">Mes cartes de parties réelles</button>');
}
function slxCourseAdd(){const name=prompt("Nom du golf joué");if(!name||!name.trim())return;const a=slxRead("swiinglab_courses_v1",[]);if(!a.some(x=>x.name.toLowerCase()===name.trim().toLowerCase()))a.push({name:name.trim(),date:new Date().toISOString().slice(0,10)});slxWrite("swiinglab_courses_v1",a);slxCourses()}
function slxCourseView(name){const x=slxRead("swiinglab_courses_meta_v1",{}),m=x[name]||{};
 realUI(slxTop(name,"slxCourses()","Mes parcours")+'<div class="info"><div class="field"><label>Pays / localisation</label><input id="slxCourseCountry" value="'+safe(m.country||"")+'"></div><div class="field"><label>Note personnelle sur 10</label><input id="slxCourseRating" type="number" min="0" max="10" value="'+safe(m.rating||"")+'"></div><div class="field"><label>Commentaires</label><textarea id="slxCourseNotes">'+safe(m.notes||"")+'</textarea></div><button class="primary" onclick="slxCourseSave(decodeURIComponent(\''+encodeURIComponent(name)+'\'))">Enregistrer</button></div>')}
function slxCourseSave(name){const d=slxRead("swiinglab_courses_meta_v1",{});d[name]={country:document.getElementById("slxCourseCountry").value,rating:document.getElementById("slxCourseRating").value,notes:document.getElementById("slxCourseNotes").value};if(slxWrite("swiinglab_courses_meta_v1",d))slxCourses()}
profile=function(){slxNav("Mon profil","slHome()",[['◯','Profil','Nom et index','slxPlayer()',true],['↥','TrackMan','Importer / exporter JSON','slxImport()',true],['▣','Sauvegarde','Sauvegarde complète et restauration','slxBackup()',true],['◉','Mon passeport golf','Pays et parcours découverts','slxPassport()',true],['★','Mes années golf','Archives Golf Wrapped','slxYears()',true],['◎','Ma collection de balles','Balles logotées et doubles','slxCollection()',true],['↗','Partager','SMS, WhatsApp…','shareApp()',true]]);const el=document.getElementById('screen');if(el)el.insertAdjacentHTML('afterbegin','<p class="muted" style="text-align:center;margin:4px 0 14px">Version '+slxAppVersion+' · '+slxAppVersionDate+'</p>')};
function slxPlayer(){const p=loadProfile();
 realUI(slxTop("Profil du joueur","profile()","Mon profil")+'<p class="muted">SwiingLab · '+slxAppVersion+' · Mise à jour du '+slxAppVersionDate+'</p>'+'<form class="info" onsubmit="slxSavePlayer(event)"><div class="field"><label>Nom</label><input name="name" value="'+safe(p.name||"")+'"></div><div class="field"><label>Index de golf</label><input name="index" value="'+safe(p.index||"")+'"></div><button class="primary" type="submit">Sauvegarder</button></form>');
}
function slxSavePlayer(ev){ev.preventDefault();if(slxWrite("mag_profile",Object.fromEntries(new FormData(ev.target)))){alert("Profil sauvegardé.");profile()}}
function slxImport(){realUI(slxTop("TrackMan — Importation JSON","profile()","Mon profil")+'<div class="info"><h3>Importer des données</h3><input type="file" accept=".json,application/json" onchange="tmImport(this)"><p class="muted">'+tmData().reduce((a,x)=>a+(x.shots||[]).length,0)+' coups TrackMan enregistrés.</p><button class="secondary" onclick="tmExport()">Exporter mes données TrackMan</button></div>')}
function slxBackup(){realUI(slxTop("Sauvegarde complète","profile()","Mon profil")+'<div class="info"><button class="primary" onclick="tmBackup()">Télécharger / partager ma sauvegarde</button><div class="field"><label>Restaurer une sauvegarde</label><input type="file" accept=".json,application/json" onchange="tmRestore(this)"></div></div>')}
function slxPassport(){
 const names=[...new Set([...(realGet().rounds||[]).map(x=>x.golf||x.course),...slxRead("swiinglab_courses_v1",[]).map(x=>x.name)].filter(Boolean))],meta=slxRead("swiinglab_courses_meta_v1",{}),countries=[...new Set(names.map(n=>meta[n]?.country).filter(Boolean))];
 realUI(slxTop("Mon passeport golf","profile()","Mon profil")+'<div class="statsGrid"><div class="stat">Parcours découverts<strong>'+names.length+'</strong></div><div class="stat">Pays renseignés<strong>'+countries.length+'</strong></div></div>'+
 (names.length?names.map(n=>'<div class="histItem"><b>'+safe(meta[n]?.displayName||n)+'</b><span>'+safe(meta[n]?.country||"Pays à préciser")+' <button class="secondary" onclick="slxPassportEdit(decodeURIComponent(\''+encodeURIComponent(n)+'\'))">Modifier</button></span></div>').join(''):slxEmpty));
}
function slxPassportEdit(name){
 const meta=slxRead("swiinglab_courses_meta_v1",{}),m=meta[name]||{};
 realUI(slxTop("Modifier le parcours","slxPassport()","Mon passeport golf")+'<form class="info" onsubmit="slxPassportSave(event,decodeURIComponent(\''+encodeURIComponent(name)+'\'))"><div class="field"><label>Nom du golf</label><input name="displayName" required value="'+safe(m.displayName||name)+'"></div><div class="field"><label>Pays</label><input name="country" value="'+safe(m.country||"")+'"></div><button class="primary" type="submit">Enregistrer</button></form>');
}
function slxPassportSave(ev,name){
 ev.preventDefault();const f=new FormData(ev.target),d=slxRead("swiinglab_courses_meta_v1",{});
 d[name]={...(d[name]||{}),displayName:String(f.get("displayName")||"").trim(),country:String(f.get("country")||"").trim()};
 if(slxWrite("swiinglab_courses_meta_v1",d))slxPassport();
}
function slxYears(){
 const a=slxRead("swiinglab_wrapped_v1",[]);
 realUI(slxTop("Mes années golf","profile()","Mon profil")+
 (a.length?a.slice().reverse().map(x=>'<div class="menuCard" onclick="slxYearView('+x.year+')"><b>Golf Wrapped '+x.year+'</b><span class="muted">Bilan archivé</span></div>').join(''):slxEmpty));
}
function slxYearView(year){const d=slxRead("swiinglab_wrapped_v1",[]).find(x=>x.year===year);if(!d)return;
 realUI(slxTop("Golf Wrapped "+year,"slxYears()","Mes années golf")+'<div class="statsGrid"><div class="stat">Parties réelles<strong>'+d.real+'</strong></div><div class="stat">Parcours virtuels<strong>'+d.virtual+'</strong></div><div class="stat">Compétitions<strong>'+d.comps+'</strong></div><div class="stat">Parcours différents<strong>'+d.courses+'</strong></div></div>');
}
function slxWrappedCheck(){
 const now=new Date(),year=now.getFullYear(),date=now.getMonth()===11&&now.getDate()===31&&now.getHours()>=17;
 if(!date)return;const a=slxRead("swiinglab_wrapped_v1",[]);if(a.some(x=>x.year===year))return;
 const real=(realGet().rounds||[]).filter(x=>String(x.date||"").startsWith(year)),virt=slVirtualData().filter(x=>String(x.date||"").startsWith(year)),comps=slxCompsGet().filter(x=>String(x.date||"").startsWith(year));
 a.push({year,real:real.length,virtual:virt.length,comps:comps.length,courses:new Set(real.map(x=>x.golf||x.course).filter(Boolean)).size});
 if(slxWrite("swiinglab_wrapped_v1",a))setTimeout(()=>{if(confirm("Ton Golf Wrapped "+year+" est prêt ! Le consulter ?"))slxYearView(year)},150);
}
const slxCollectionGet=()=>{slxSeedBalls();return slxRead("swiinglab_ball_collection_v1",[])};
function slxCollection(){
 const a=slxCollectionGet().slice().sort((x,y)=>x.name.localeCompare(y.name,"fr"));
 realUI(slxTop("Ma collection de balles","profile()","Mon profil")+'<button class="primary" onclick="slxBallAdd()">＋ Ajouter une balle logotée</button>'+
 (a.length?a.map(x=>'<button class="histItem" style="width:100%;text-align:left;background:transparent;color:inherit;border:0;cursor:pointer;display:flex;align-items:center" onclick="slxBallSheet(decodeURIComponent(\''+encodeURIComponent(x.id)+'\'))"><b>'+safe(x.name)+'</b><span>'+("★".repeat(Math.min(30,Number(x.extra)||0))||"—")+'</span></button>').join(''):slxEmpty)+
 '<p class="muted">Une étoile = une balle supplémentaire disponible pour échange.</p>');
}
function slxBallAdd(){
 const name=prompt("Nom du golf ou logo");if(!name||!name.trim())return;
 const extra=prompt("Nombre d’exemplaires en supplément (0 si aucun)","0");if(extra===null||!Number.isInteger(Number(extra))||Number(extra)<0)return alert("Nombre invalide");
 const a=slxCollectionGet(),id=slxId();a.push({id,name:name.trim(),extra:Number(extra),country:""});
 if(slxWrite("swiinglab_ball_collection_v1",a))slxBallSheet(id);
}
function slxBallSheet(id){
 const x=slxCollectionGet().find(v=>v.id===id);if(!x)return;
 const ident=encodeURIComponent(id);
 realUI(slxTop("Fiche de balle","slxCollection()","Collection")+
 '<form class="info" onsubmit="slxBallSave(event,decodeURIComponent(\''+ident+'\'))">'+
 (x.photo?'<img src="'+safe(x.photo)+'" alt="Photo de la balle" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;margin-bottom:12px">':'<p class="muted">Aucune photo enregistrée.</p>')+
 '<div class="field"><label>Prendre une photo</label><input type="file" accept="image/*" capture="environment" onchange="slxBallCapture(this,decodeURIComponent(\''+ident+'\'))"></div>'+
 '<div class="field"><label>Nom</label><input name="name" required value="'+safe(x.name)+'"></div>'+
 '<div class="field"><label>Pays</label><input name="country" value="'+safe(x.country||"")+'"></div>'+
 '<div class="field"><label>Balles supplémentaires (étoiles)</label><input name="extra" type="number" min="0" step="1" value="'+Number(x.extra||0)+'"></div>'+
 '<button class="primary" type="submit">Enregistrer</button></form>');
}
function slxBallCapture(input,id){
 const file=input.files&&input.files[0];if(!file)return;
 const img=new Image(),url=URL.createObjectURL(file);
 img.onload=()=>{
  const canvas=document.createElement("canvas"),scale=Math.min(1,850/Math.max(img.width,img.height));
  canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
  const photo=canvas.toDataURL("image/jpeg",0.6),a=slxCollectionGet(),ball=a.find(x=>x.id===id);
  if(ball){ball.photo=photo;if(slxWrite("swiinglab_ball_collection_v1",a))slxBallSheet(id)}
 };
 img.onerror=()=>{URL.revokeObjectURL(url);alert("Impossible de lire cette photo.")};img.src=url;
}
function slxBallSave(ev,id){
 ev.preventDefault();const f=new FormData(ev.target),a=slxCollectionGet(),ball=a.find(x=>x.id===id);
 if(!ball)return;const extra=Number(f.get("extra"));if(!Number.isInteger(extra)||extra<0)return alert("Nombre de balles invalide.");
 ball.name=String(f.get("name")||"").trim();ball.country=String(f.get("country")||"").trim();ball.extra=extra;
 if(!ball.name)return alert("Nom requis.");if(slxWrite("swiinglab_ball_collection_v1",a))slxBallSheet(id);
}
/* Putt Tracker : graphe par distance et septième exercice libre, sans altérer les six précédents. */
let slxPuttRange="max";
function slxPuttingRows(){
 const now=Date.now(),cut=slxPuttRange==="max"?0:now-(slxPuttRange==="3m"?90:30)*86400000;
 const rows=[];
 for(const x of ptSessions()){
  const time=Date.parse(x.date||"");
  if(!Number.isFinite(time)||time<cut)continue;
  const d=slxNum(x.distance),a=slxNum(x.attempts),m=slxNum(x.made);
  if(d>0&&Number.isInteger(a)&&a>0&&Number.isInteger(m)&&m>=0&&m<=a){rows.push({distance:d,attempts:a,made:m});continue}
  if(!Array.isArray(x.results)||!x.results.every(v=>typeof v==="boolean"))continue;
  const distances=x.exerciseId==="circle"?x.results.map(()=>1):x.exerciseId==="pressure"?x.results.map(()=>1.5):x.exerciseId==="369"?x.results.map((_,i)=>[3,6,9][Math.floor((i%9)/3)]):[];
  distances.forEach((distance,i)=>rows.push({distance,attempts:1,made:x.results[i]?1:0}));
 }
 return rows;
}
function slxPuttGraph(){
 const rows=slxPuttingRows(),distances=[...new Set([1,2,3,5,8,...rows.map(x=>x.distance)])].sort((a,b)=>a-b),buttons=[["max","Max"],["3m","3 mois"],["1m","1 mois"]].map(([value,label])=>'<button class="secondary" style="'+(slxPuttRange===value?'border-color:var(--gold);':'')+'" onclick="slxPuttRange=\''+value+'\';puttTrackerHome()">'+label+'</button>').join('');
 return '<div class="info"><h3>Précision au putting</h3><div style="display:flex;gap:8px;margin-bottom:16px">'+buttons+'</div>'+
 distances.map(d=>{const v=rows.filter(x=>Number(x.distance)===d),a=v.reduce((n,x)=>n+Number(x.attempts),0),m=v.reduce((n,x)=>n+Number(x.made),0),pct=a?Math.round(100*m/a):null;return '<div style="margin:12px 0"><div style="display:flex;justify-content:space-between"><b>'+d+' m</b><span>'+(pct===null?'Aucune donnée':pct+' %')+'</span></div><div class="bar"><i style="width:'+(pct||0)+'%"></i></div></div>'}).join('')+
 '<p class="muted">Uniquement les séries où distance, nombre tenté et réussite sont connus.</p></div>';
}
puttTrackerHome=function(){
 realUI(slxTop("Putt Tracker","slxTraining()","Entraînement")+slxPuttGraph()+
 slxMenu([['◎','Mes entraînements','7 exercices disponibles','ptList()',true],['▤','Historique','Séances enregistrées','ptHistory()',true],['↗','Progression','Statistiques des exercices','ptStats()',true]]));
};
function slxPuttFree(){
 realUI(slxTop("Entraînement libre","puttTrackerHome()","Putt Tracker")+'<form class="info" onsubmit="slxPuttFreeSave(event)">'+
 '<div class="field"><label>Distance (m)</label><input name="distance" type="number" min="0.1" step="0.1" value="1" required></div>'+
 '<div class="field"><label>Nombre de balles jouées</label><input name="attempts" type="number" min="1" step="1" value="5" required></div>'+
 '<div class="field"><label>Putts réussis à la fin de la série</label><input name="made" type="number" min="0" step="1" value="0" required></div>'+
 '<button class="primary" type="submit">Valider le résultat</button></form>');
}
function slxPuttFreeSave(ev){
 ev.preventDefault();const x=Object.fromEntries(new FormData(ev.target)),attempts=Number(x.attempts),made=Number(x.made),distance=Number(x.distance);
 if(!Number.isInteger(attempts)||attempts<1||!Number.isInteger(made)||made<0||made>attempts||!Number.isFinite(distance)||distance<=0)return alert("Vérifie le nombre de putts et la distance.");
 const a=ptSessions();a.push({id:slxId(),date:new Date().toISOString(),exerciseId:"free",exercise:"Entraînement libre",distance,attempts,made,maxStreak:0});
 if(slxWrite(PT_STORE,a)){alert(made+" putts réussis sur "+attempts+" à "+distance+" m.");slxPuttFree()}
}

/* L'entraînement libre est la septième tuile au-dessous des six précédentes. */
const slxOriginalPtList=ptList;
ptList=function(){
 slxOriginalPtList();
 const area=document.querySelector("#screen .slTiles");
 if(area)area.insertAdjacentHTML("afterbegin",slCard("＋","Entraînement libre","Distance et nombre de balles au choix","slxPuttFree()",true));
};
let slxFreeDraft=null;
slxPuttFree=function(){
 slxFreeDraft=null;
 realUI(slxTop("Entraînement libre","ptList()","Mes entraînements")+
 '<form class="info" onsubmit="slxPuttFreeStart(event)">'+
 '<div class="field"><label>Distance (m)</label><input name="distance" type="number" min="0.1" step="0.1" value="1" required></div>'+
 '<div class="field"><label>Nombre de balles</label><input name="attempts" type="number" min="1" step="1" value="5" required></div>'+
 '<button class="primary" type="submit">Commencer</button></form>');
};
function slxPuttFreeStart(ev){
 ev.preventDefault();const f=new FormData(ev.target),distance=Number(f.get("distance")),attempts=Number(f.get("attempts"));
 if(!Number.isFinite(distance)||distance<=0||!Number.isInteger(attempts)||attempts<1)return alert("Distance ou nombre de balles incorrect.");
 slxFreeDraft={distance,attempts};
 realUI(slxTop("Résultat de la série","slxPuttFree()","Entraînement libre")+
 '<div class="info"><p>'+attempts+' balles à '+distance+' m.</p><form onsubmit="slxPuttFreeSave(event)">'+
 '<div class="field"><label>Combien de putts réussis ?</label><input name="made" type="number" min="0" max="'+attempts+'" step="1" required></div>'+
 '<button class="primary" type="submit">Valider la série</button></form></div>');
}
slxPuttFreeSave=function(ev){
 ev.preventDefault();if(!slxFreeDraft)return slxPuttFree();
 const {distance,attempts}=slxFreeDraft,made=Number(new FormData(ev.target).get("made"));
 if(!Number.isInteger(made)||made<0||made>attempts)return alert("Nombre de putts incorrect.");
 const a=ptSessions();a.push({id:slxId(),date:new Date().toISOString(),exerciseId:"free",exercise:"Entraînement libre",distance,attempts,made,maxStreak:0});
 if(slxWrite(PT_STORE,a)){slxFreeDraft=null;alert(made+" putts réussis sur "+attempts+" à "+distance+" m.");puttTrackerHome()}
};

/* Compléments : évolution mensuelle des scores et archivage annuel différé. */
function slxMonthlyScoreChart(){
 const games=slVirtualData().filter(x=>/^\d{4}-\d{2}/.test(String(x.date||""))&&slxNum(x.totalScore)!==null);
 const grouped=new Map();
 games.forEach(x=>{const k=String(x.date).slice(0,7),a=grouped.get(k)||[];a.push(slxNum(x.totalScore));grouped.set(k,a)});
 const points=[...grouped].sort((a,b)=>a[0].localeCompare(b[0])).slice(-12).map(([k,a])=>({k,y:a.reduce((u,v)=>u+v,0)/a.length,n:a.length}));
 if(!points.length)return '<p class="muted">Le graphique apparaîtra après l\'importation d\'une partie TrackMan avec un score.</p>';
 const low=Math.floor(Math.min(...points.map(x=>x.y))-2),high=Math.ceil(Math.max(...points.map(x=>x.y))+2),span=Math.max(1,high-low);
 return '<div class="info"><h3>Évolution du score moyen — simulateur</h3><div style="overflow-x:auto"><svg viewBox="0 0 330 180" role="img" aria-label="Courbe des scores moyens par mois" style="width:100%;min-width:260px;max-width:650px">'+
 '<line x1="35" y1="15" x2="35" y2="145" stroke="currentColor" opacity=".4"/><line x1="35" y1="145" x2="320" y2="145" stroke="currentColor" opacity=".4"/>'+
 '<text x="5" y="20" font-size="11" fill="currentColor">'+high+'</text><text x="5" y="145" font-size="11" fill="currentColor">'+low+'</text>'+
 '<polyline fill="none" stroke="#1ca478" stroke-width="3" points="'+points.map((p,i)=>(35+i*285/Math.max(1,points.length-1))+','+(145-125*(p.y-low)/span)).join(' ')+'"/>'+
 points.map((p,i)=>{const x=35+i*285/Math.max(1,points.length-1),y=145-125*(p.y-low)/span;return '<circle cx="'+x+'" cy="'+y+'" r="4" fill="#1ca478"><title>'+safe(p.k)+' : '+p.y.toFixed(1)+' coups ('+p.n+' partie(s))</title></circle>'+(i===0||i===points.length-1?'<text x="'+x+'" y="166" font-size="10" text-anchor="middle" fill="currentColor">'+safe(p.k.slice(2))+'</text>':'')}).join('')+
 '</svg></div><p class="muted">Moyennes mensuelles calculées uniquement à partir des scores enregistrés sur simulateur.</p></div>';
}
const slxOldStats=slxStats;
slxStats=function(){
 slxOldStats();
 document.querySelector("#screen")?.insertAdjacentHTML("beforeend",slxMonthlyScoreChart());
};
slxWrappedCheck=function(){
 const now=new Date(),year=now.getFullYear();
 const due=now.getMonth()===11&&now.getDate()===31&&now.getHours()>=17;
 const years=new Set();
 for(const x of (realGet().rounds||[]).concat(slVirtualData(),slxCompsGet())){
  const d=String(x.date||"");if(/^\d{4}/.test(d))years.add(Number(d.slice(0,4)));
 }
 if(due)years.add(year);
 const a=slxRead("swiinglab_wrapped_v1",[]);
 let changed=false,currentCreated=false;
 [...years].sort((x,y)=>x-y).forEach(y=>{
  if(y>year||(y===year&&!due)||a.some(x=>x.year===y))return;
  const real=(realGet().rounds||[]).filter(x=>String(x.date||"").startsWith(y));
  const virt=slVirtualData().filter(x=>String(x.date||"").startsWith(y));
  const comps=slxCompsGet().filter(x=>String(x.date||"").startsWith(y));
  a.push({year:y,real:real.length,virtual:virt.length,comps:comps.length,courses:new Set(real.map(x=>x.golf||x.course).filter(Boolean)).size});
  changed=true;if(y===year)currentCreated=true;
 });
 if(changed&&slxWrite("swiinglab_wrapped_v1",a)&&currentCreated){
  setTimeout(()=>{if(confirm("Ton Golf Wrapped "+year+" est prêt ! Le consulter ?"))slxYearView(year)},150);
 }
};

/* SwiingLab V1.0.0 — 12/11/2026. Catalogue de départ : n'écrase jamais la collection locale existante. */
const slxAppVersion="V1.2.0";
const slxAppVersionDate="12/11/2026";
const slxInitialBalls=[["Bassin Bleu Golf — La Réunion",1],["Bussy-Saint-Georges",3],["Castillo de Gorraiz Golf Club",0],["Dinard Golf",0],["Disneyland Paris — édition 1",0],["Disneyland Paris — édition 2",0],["Domont Montmorency",0],["Eurodisney",0],["Golf de Disneyland",0],["Golf de Saint-Cast — Centenaire",0],["Golf de Saint-Cast — Classique",0],["Golf de Sainte-Maxime",0],["Golf de Seignosse",0],["Golf de Saly",0],["Golf des Gets",0],["Golf du Gouverneur",0],["Golf du Pic Saint-Loup",0],["Golf de Villacoublay",0],["Golf Club de Hossegor La Ferrière",0],["Golf Club Lyon-Salvagny",0],["Golf de Saint-Donat",0],["Hua Hin Golf Club",2],["Koh Samui Golf Club",2],["Les Ormes Golf & Resort",0],["Loch Palm Golf Club",2],["Malaisie",2],["Niagara Falls",0],["Old Course Cannes Golf Links — blanc",0],["Old Course Cannes Golf Links — orange",0],["Old Course Cannes Golf Links — rose",0],["Old Course Cannes Golf Links — rouge",0],["Old Course Cannes Golf Links — vert",0],["Oliva Nova Golf Club",1],["Pérou",0],["PGA Riviera Maya",0],["Red Mountain Golf Club",2],["Ryder Cup 2023 — Marco Simone",0],["Saint Andrews",0],["Saint-Malo Golf Resort",0],["Southwood G.C.",0],["TaylorMade TP5 — Halloween",0],["TaylorMade TP5 — Piment",0],["TaylorMade TP5 — Cornichon",0],["TaylorMade TP5 — Tacos",0],["TaylorMade TP5 — Dés de casino",0],["TaylorMade TP5 — Fléchettes",0],["TaylorMade TP5 — Pêches",0],["TaylorMade TP5 — Tête de dragon",0]];
function slxSeedBalls(){
 const key="swiinglab_ball_collection_v1",stored=localStorage.getItem(key);
 const a=slxRead(key,[]);if(!Array.isArray(a))return;
 const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 let changed=stored===null;
 for(const [name,extra] of slxInitialBalls){
  if(a.some(x=>norm(x.name)===norm(name)))continue;
  a.push({id:"initial-ball-"+String(a.length+1).padStart(2,"0"),name,extra});changed=true;
 }
 if(changed)slxWrite(key,a);
}
slxSeedBalls();


/* Données initiales du 12 novembre 2026 : aucune partie existante n'est remplacée. */
const slxInitialComps2026=[["Coupe du Directeur","2026-10-04","La Jonchère","Blancs",93],["Départ Florence – Coupe du perso","2022-09-03","La Jonchère","Blancs",95],["Heritage World Cup","2022-04-03","La Jonchère","Blancs",84],["Coupe du Président","2021-06-26","La Jonchère","Blancs",82],["Grand Trophée LIONS","2021-05-30","La Jonchère","Jaunes",81],["Championnat du club","2021-05-09","La Jonchère","Jaunes",87],["Classement Galette des Rois","2019-01-06","Les Cerfs","Jaunes",99],["Classement dimanche 04 novembre 2018","2018-11-04","Hyverneaux-Corbuches","Jaunes",94],["Coupe USCL","2013-10-27","Hyverneaux-Corbuches","Jaunes",85]];
function slxSeedComps2026(){
 try{
  const key="swiinglab_competitions_v1",rows=slxCompsGet();if(!Array.isArray(rows))return;
  let changed=false;
  const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
  for(const [name,date,course,tees,sba] of slxInitialComps2026){
   if(rows.some(x=>x.date===date&&norm(x.name)===norm(name)))continue;
   rows.push({id:"ffgolf-"+date+"-"+norm(name),name,date,course,format:"Stableford · "+tees,gross:"",net:"",place:"",players:"",index:"",sba,source:"Capture FFGolf"});
   changed=true;
  }
  if(changed)slxWrite(key,rows);
 }catch(e){console.warn("Compétitions non importées",e)}
}
const slxInitialFreeRounds2026=[["Lyon Salvagny Golf Club","Les Étangs","2026-09-14",[4,4,5,4,3,5,3,4,4,5,4,4,4,3,5,4,3,4],[6,5,5,4,6,6,3,5,4,5,5,5,7,4,6,4,4,4],[11,7,17,1,15,5,13,3,9,10,4,14,2,8,16,18,6,12]],["Golf de Saint-Cast Côte d'Émeraude","Links 1926","2026-08-17",[5,3,4,3,4,4,4,4,4,3,4,3,4,4,5,4,4,3],[7,3,4,4,4,4,4,4,4,4,4,5,4,5,5,4,5,3],[10,16,4,18,2,14,8,6,12,17,13,15,11,1,3,5,7,9]]];
function slxSeedFreeRounds2026(){
 try{
  const db=realGet();if(!Array.isArray(db.rounds)||!Array.isArray(db.courses))return;
  const seen=new Set(db.rounds.map(realRoundFingerprint));let changed=false;
  for(const [golf,name,date,pars,scores,hcps] of slxInitialFreeRounds2026){
   const round=realParseRound({golf,name,date,holes:pars.map((par,i)=>({par,shots:scores[i],hcp:hcps[i]}))});
   const fp=realRoundFingerprint(round);
   if(seen.has(fp))continue;
   db.rounds.push(round);seen.add(fp);changed=true;
   if(!db.courses.some(c=>c.golf===golf&&c.name===name&&c.count===round.count))db.courses.push({golf,name,count:round.count,pars:pars.slice()});
  }
  if(changed)realSave(db);
 }catch(e){console.warn("Parties libres non importées",e)}
}
window.addEventListener("load",()=>{slxSeedComps2026();slxSeedFreeRounds2026()});

/* Bouton Retour contextuel à côté du bouton Accueil. */
function slxGoBack(){
 const target=document.querySelector("#screen .slBack, #screen .back");
 if(target){target.click();return}slHome();
}
function slxReturnNav(){
 const nav=document.querySelector("nav.nav");if(!nav)return;
 if(!document.getElementById("slxNavReturn"))nav.insertAdjacentHTML("beforeend",'<button id="slxNavReturn" type="button" onclick="slxGoBack()"><span class="navIcon">‹</span><span>Retour</span></button>');
 const btn=document.getElementById("slxNavReturn");if(btn)btn.style.display=document.querySelector("#screen .slBack, #screen .back")?"":"none";
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",slxReturnNav);else slxReturnNav();
const slxScreen=document.getElementById("screen");
if(slxScreen)new MutationObserver(slxReturnNav).observe(slxScreen,{childList:true,subtree:false});
const slxStyle=document.createElement("style");
slxStyle.textContent="#screen .slPageTop>.slBack{display:none}nav.nav{grid-template-columns:repeat(2,minmax(0,1fr));justify-items:stretch;gap:8px}nav.nav:has(#slxNavReturn[style*=\"display: none\"]){grid-template-columns:minmax(0,1fr);justify-items:center}nav.nav button{width:100%;max-width:none;box-sizing:border-box}#slxNavReturn{min-width:0}";
document.head.appendChild(slxStyle);
