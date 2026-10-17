/*
 * 獨立陰盤時盤研究引擎 v0.1 (not derived from the private Hearto source).
 * Taiwan UTC+8 clock-time convention, Zi at 23:00, common lunar-number Yinpan method.
 * Traditional reference: https://qimen.yi958.com/qmfp/13402
 * General numeric rules: https://m.gx0.cn/yinpan
 * v0.3: observed Hearto UI fixtures; coverage and limitations in VALIDATION.md.
 */
(function(root, factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  if(root)root.QimenYin=api;
})(typeof globalThis !== 'undefined' ? globalThis : this,function(){
  'use strict';
  const STEMS=[...'甲乙丙丁戊己庚辛壬癸'];
  const BRANCHES=[...'子丑寅卯辰巳午未申酉戌亥'];
  const PALACE_RING=[1,8,3,4,9,2,7,6];
  const ORIGINAL={
    1:{star:'天蓬',door:'休門'},8:{star:'天任',door:'生門'},
    3:{star:'天沖',door:'傷門'},4:{star:'天輔',door:'杜門'},
    9:{star:'天英',door:'景門'},2:{star:'天芮',door:'死門'},
    7:{star:'天柱',door:'驚門'},6:{star:'天心',door:'開門'},
    5:{star:'天禽',door:''}
  };
  const DEITIES=['值符','騰蛇','太陰','六合','白虎','玄武','九地','九天'];
  const ORDER=[...'戊己庚辛壬癸丁丙乙'];
  const B2P=[1,8,8,3,4,4,9,2,2,7,6,6];
  const ELEMENTS={1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
  const DOOR_EL={'休門':'水','生門':'土','傷門':'木','杜門':'木','景門':'火','死門':'土','驚門':'金','開門':'金'};
  const CONTROL={木:'土',土:'水',水:'火',火:'金',金:'木'};
  const mod=(a,n)=>((a%n)+n)%n;
  const degree=(x)=>mod(x,360);
  const dsin=(d)=>Math.sin(d*Math.PI/180);
  function solarLongitude(utcDate){
    // Low-cost solar ephemeris approximation. For precise term boundaries, use a verified term table.
    const JD=utcDate.getTime()/86400000+2440587.5;
    const T=(JD-2451545.0)/36525;
    const L0=degree(280.46646+36000.76983*T+0.0003032*T*T);
    const M=degree(357.52911+35999.05029*T-0.0001537*T*T);
    const C=(1.914602-0.004817*T-0.000014*T*T)*dsin(M)+(0.019993-0.000101*T)*dsin(2*M)+0.000289*dsin(3*M);
    const omega=125.04-1934.136*T;
    return degree(L0+C-0.00569-0.00478*dsin(omega));
  }
  function lunarForTaiwan(utcDate){
    const parts=Intl.DateTimeFormat('en-u-ca-chinese',{timeZone:'Asia/Taipei',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(utcDate);
    const fields=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return {year:+fields.relatedYear,month:parseInt(fields.month,10),day:parseInt(fields.day,10),leap:/bis/i.test(fields.month)};
  }
  function cyc(i){return STEMS[mod(i,10)]+BRANCHES[mod(i,12)];}
  function cycleIndex(stem,branch){for(let i=0;i<60;i++)if(i%10===stem && i%12===branch)return i;throw Error('干支不在六十甲子內')}
  function parseTaiwanDate(local){
    const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(local);
    if(!m)throw Error('請輸入有效西元時間');
    const [y,mon,day,h,min]=m.slice(1).map(Number);
    if(y<1900||y>2100||mon<1||mon>12||day<1||day>31||h>23||min>59)throw Error('時間超出此研究版範圍');
    const utc=new Date(Date.UTC(y,mon-1,day,h-8,min));
    const d=new Date(Date.UTC(y,mon-1,day));
    if(d.getUTCFullYear()!==y||d.getUTCMonth()!==mon-1||d.getUTCDate()!==day)throw Error('日期無效');
    return {y,mon,day,h,min,utc};
  }
  function calculate(input, mode="shi"){
    if(!["shi","ke"].includes(mode))throw Error("不支援的盤別");
    const {y,mon,day,h,min,utc}=parseTaiwanDate(input);
    const terms=typeof module==='object'&&module.exports?require('./solar-terms.cjs'):globalThis.QimenTerms;
    if(!terms)throw Error('節氣資料未載入，請保留 solar-terms.js');
    const currentKey=input;
    // The original advances the solar-calendar day at 23:00; this can advance a late-night term.
    const effectiveKey=h===23?new Date(Date.UTC(y,mon-1,day+1,0,min)).toISOString().slice(0,16):input;
    let currentTerm=null;
    for(const item of terms.records){
      // Site-verified 23:00 records already encode its Zi-hour behavior.
      const key=item[2]==='site-minute-verified'?currentKey:effectiveKey;
      if(item[0]<=key)currentTerm=item;else if(item[0]>effectiveKey&&item[0]>currentKey)break;
    }
    const degreeNow=mod(285+currentTerm[1]*15,360)+0.000001;
    const termIndex=currentTerm[1],termName=terms.names[termIndex],nextTerm=terms.names[(termIndex+1)%24];
    const lichun=terms.records.find(r=>r[0].startsWith(y+'-')&&r[1]===2);
    const yearAtLichun=(lichun[2]==='site-minute-verified'?currentKey:effectiveKey)<lichun[0]?y-1:y;
    const lunar=lunarForTaiwan(utc);
    const calculationLunar=lunarForTaiwan(h>=23 ? new Date(utc.getTime()+86400000) : utc);
    // The local calendar year changes at solar longitude 315° (Lichun), not lunar New Year.
    // Robust for January/February where longitude wraps through 360°.

    const yi=mod(yearAtLichun-1984,60);
    const monthIndex=Math.floor(degree(degreeNow-315)/30)%12;
    const miStem=mod(2+2*(yi%10%5)+monthIndex,10),miBranch=(monthIndex+2)%12;
    const dateCount=Math.round((Date.UTC(y,mon-1,day)-Date.UTC(2000,0,1))/86400000)+(h>=23?1:0);
    const di=mod(54+dateCount,60);
    const timeBranch=Math.floor((h+1)/2)%12;
    const timeStem=(2*((di%10)%5)+timeBranch)%10;
    const hourCycle=cycleIndex(timeStem,timeBranch);
    const keBranch=Math.floor(((h%2===0?60:0)+min)/10);
    const keStem=mod(2*(timeStem%5)+keBranch,10);
    const hi=mode==='ke'?cycleIndex(keStem,keBranch):hourCycle;
    const activeBranch=mode==='ke'?keBranch:timeBranch;
    const activeStem=mode==='ke'?keStem:timeStem;
    const sign=degreeNow>=90 && degreeNow<270 ? -1 : 1; // [夏至90°,冬至270°) = 陰遁
    const sum=(mod(calculationLunar.year-1984,12)+1)+calculationLunar.month+calculationLunar.day+(timeBranch+1)+(mode==="ke"?keBranch+1:0);
    const ju=mod(sum-1,9)+1;
    const plates={};
    const stemAt={};
    for(let i=0;i<9;i++){
      const pos=mod(ju-1+sign*i,9)+1;
      const gan=ORDER[i];stemAt[pos]=gan;
      plates[pos]={star:'',door:'',deity:'',tian:'',di:gan,extra:'',memo:'',flags:[]};
    }
    const xunNo=Math.floor(hi/10);
    const xunBranches=[0,10,8,6,4,2],headBranch=xunBranches[xunNo];
    const xunName='甲'+BRANCHES[headBranch],headStem=[...'戊己庚辛壬癸'][xunNo];
    const xunPalace=Number(Object.keys(stemAt).find(i=>stemAt[i]===headStem));
    const timeGan=STEMS[activeStem];
    const targetStem=(timeGan==='甲')?headStem:timeGan;
    const timePalace=Number(Object.keys(stemAt).find(i=>stemAt[i]===targetStem));
    const starSrc=(xunPalace===5)?2:xunPalace;
    const starDst=(timePalace===5)?2:timePalace;
    const offset=mod(PALACE_RING.indexOf(starDst)-PALACE_RING.indexOf(starSrc),8);
    for(let i=0;i<8;i++){
      const src=PALACE_RING[i],dst=PALACE_RING[(i+offset)%8];
      plates[dst].star=ORIGINAL[src].star;
      plates[dst].tian=stemAt[src]+(src===2?stemAt[5]:'');
      if(src===2){
        plates[dst].star='天芮';
        plates[dst].extra=`天禽寄坤：中五原地盤${stemAt[5]}`;
      }
    }
    const step=hi%10;
    const doorIndex=mod(xunPalace-1+sign*step,9)+1;
    const doorDest=doorIndex===5?2:doorIndex;
    const doorSrc=xunPalace===5?2:xunPalace;
    const doorOffset=mod(PALACE_RING.indexOf(doorDest)-PALACE_RING.indexOf(doorSrc),8);
    for(let i=0;i<8;i++){
      const src=PALACE_RING[i],dst=PALACE_RING[(i+doorOffset)%8];
      plates[dst].door=ORIGINAL[src].door;
    }
    plates[2].di+=stemAt[5];
    plates[5].di="";
    const start=PALACE_RING.indexOf(starDst);
    for(let i=0;i<8;i++)plates[PALACE_RING[mod(start+sign*i,8)]].deity=DEITIES[i];
    // Display-only conventional aids. Exact Hearto special-rule markers are UNVERIFIED.
    const empties=[mod(headBranch+10,12),mod(headBranch+11,12)];
    for(const b of empties){const p=plates[B2P[b]];if(!p.flags.includes('空亡'))p.flags.push('空亡')}
    const horseMap={'子':8,'辰':8,'申':8,'寅':2,'午':2,'戌':2,'巳':6,'酉':6,'丑':6,'亥':4,'卯':4,'未':4};
    const horseBranch={子:'寅',辰:'寅',申:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}[BRANCHES[activeBranch]];
    plates[horseMap[BRANCHES[activeBranch]]].flags.push('馬星');
    for(const n of PALACE_RING)if(CONTROL[DOOR_EL[plates[n].door]]===ELEMENTS[n])plates[n].flags.push('門迫');
    const seasonLabel=sign===1?'陽遁':'陰遁';
    const data={year:cyc(yi),month:STEMS[miStem]+BRANCHES[miBranch],day:cyc(di),hour:cyc(hourCycle),ke:mode==='ke'?cyc(hi):null,mode,
      pillars:mode==='ke'?[STEMS[miStem]+BRANCHES[miBranch],cyc(di),cyc(hourCycle),cyc(hi)]:[cyc(yi),STEMS[miStem]+BRANCHES[miBranch],cyc(di),cyc(hourCycle)],
      lunar,longitude:solarLongitude(utc),ruleLongitude:degreeNow,method:'農曆年支＋月日＋時支（刻盤再加刻支），除九取餘',
      note:currentTerm[2]==='site-minute-verified'?'目前節氣已核對原站分鐘；其他已測規則見驗證報告。':currentTerm[2]==='date-mode-inferred'?'依原站跨年代樣本採按日交節；此年份全節氣尚未逐項核對。':'此交節分鐘使用公開曆表候選值，尚未核對原站，可能相差分鐘。',
      term:termName,nextTerm,termBoundary:currentTerm[0],calendarStatus:currentTerm[2],monthGeneral:BRANCHES[mod(1-Math.floor((termIndex+1)/2),12)],centerStem:stemAt[5],season:seasonLabel,ju,score:sum,xun:xunName,headStem,headPalace:xunPalace,
      star:ORIGINAL[xunPalace].star,door:ORIGINAL[doorSrc].door,starPalace:timePalace,doorPalace:doorIndex,starDisplayPalace:starDst,doorDisplayPalace:doorDest,
      empty:empties.map(i=>BRANCHES[i]),horse:horseBranch,horsePalace:horseMap[BRANCHES[activeBranch]],palaces:plates};
    data.palaces=annotate(plates,headStem);
    data.darkStems=darkPlate(stemAt,targetStem,doorDest,sign);
    return data;
  }
  const TOMB={4:'辛壬',2:'癸',8:'丁己庚',6:'乙丙戊'};
  const PUNISH={3:'戊',2:'己',8:'庚',9:'辛',4:'壬癸'};
  function harms(palace,plate,headStem){
    const result=[];
    if(CONTROL[DOOR_EL[plate.door]]===ELEMENTS[palace])result.push({kind:'門迫',layer:'door',stem:plate.door});
    for(const layer of ['tian','di'])for(const stem of plate[layer]||''){
      if((PUNISH[palace]||'').includes(stem))result.push({kind:'擊刑',layer,stem});
      if((TOMB[palace]||'').includes(stem)||(palace===2&&(stem==='甲'||stem===headStem)))result.push({kind:'入墓',layer,stem,hiddenJia:palace===2&&stem===headStem});
    }
    if(plate.flags.includes('空亡'))result.push({kind:'空亡',layer:'palace',stem:''});
    return result;
  }
  function annotate(plates,headStem){
    for(const p of PALACE_RING){
      plates[p].flags=plates[p].flags.filter(f=>!['門迫','擊刑','入墓'].includes(f));
      plates[p].harms=harms(p,plates[p],headStem);
      for(const h of plates[p].harms)if(!plates[p].flags.includes(h.kind))plates[p].flags.push(h.kind);
    }
    return plates;
  }
  function darkPlate(earth,target,doorDest,sign){
    let position=Number(Object.keys(earth).find(p=>earth[p]===target));
    const source=position===5?2:position;
    const dark={};
    if(source===doorDest){
      // Dark-stem repetition: active stem goes to central 5, then flies by Lo Shu number.
      const ju=mod(4-sign*ORDER.indexOf(target),9)+1;
      const raw={};for(let i=0;i<9;i++)raw[mod(ju-1+sign*i,9)+1]=ORDER[i];
      for(const p of PALACE_RING)dark[p]=raw[p]+(p===2?raw[5]:'');
    }else{
      const shift=mod(PALACE_RING.indexOf(doorDest)-PALACE_RING.indexOf(source),8);
      for(let i=0;i<8;i++){const p=PALACE_RING[i];dark[PALACE_RING[(i+shift)%8]]=earth[p]+(p===2?earth[5]:'');}
    }
    return dark;
  }
  function rotate(chart,steps){
    if(!Number.isInteger(steps))throw Error('轉宮步數須為整數');
    const k=mod(steps,8),out=JSON.parse(JSON.stringify(chart)),p={};
    p[5]=JSON.parse(JSON.stringify(chart.palaces[5]));out.darkStems={};
    for(let i=0;i<8;i++){
      const src=PALACE_RING[i],dst=PALACE_RING[(i+k)%8];
      p[dst]=JSON.parse(JSON.stringify(chart.palaces[src]));
      p[dst].flags=chart.palaces[dst].flags.filter(f=>['空亡','馬星'].includes(f));
      out.darkStems[dst]=chart.darkStems[src];
    }
    out.palaces=annotate(p,chart.headStem);out.rotation=mod((chart.rotation||0)+k,8);
    // Header values describe the original chart. Rotated placements are separate.
    out.rotatedStarPalace=PALACE_RING[(PALACE_RING.indexOf(chart.starDisplayPalace)+out.rotation)%8];
    out.rotatedDoorPalace=PALACE_RING[(PALACE_RING.indexOf(chart.doorDisplayPalace)+out.rotation)%8];
    return out;
  }
  function longLife(stem){
    const start={甲:11,乙:6,丙:2,丁:9,戊:2,己:9,庚:5,辛:0,壬:8,癸:3};
    if(!(stem in start))throw Error('請選擇天干');
    const phases=['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
    const sign=STEMS.indexOf(stem)%2===0?1:-1;
    return Object.fromEntries(BRANCHES.map((b,i)=>[b,phases[mod((i-start[stem])*sign,12)]]));
  }
  return {calculate,rotate,longLife,harms,solarLongitude,lunarForTaiwan,parseTaiwanDate};
});
