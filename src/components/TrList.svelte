<script>
  import { onMount } from "svelte";
  import { userid,authApps } from "../aqtstore.js";
  import Trtable from "./Trtable.svelte";

  let vid = $state('none');
  let mycond = $state({
    rcode: '',
    cond: "",
    uri: ""
  });
  
  let conds = $state({
    tcode: "",
    rcode: '',
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    apps:"",
  });

  let tcodelist = $state([]);
  let selected = $state() ;
  
  let tcntx =  $state('') ;
  async function getTRlistm() {
    // [conds.cond, conds.rcode, conds.uri] = [mycond.cond, mycond.rcode, mycond.uri] ;
    Object.assign(conds,mycond);
    conds.tcode = selected.tcode ;
    tcntx = '조회중' ;
    const res = await fetch("/trlist/tcnt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      const rdata = await res.json();
      const tcnt = rdata[0].tcnt ;
      tcntx = Number(tcnt).toLocaleString() +' 건';
      // conds.page = Math.min( Math.trunc(Number(tcnt) / conds.psize), conds.page ) ;
    } else {
      // rdata = Promise.resolve([]);
      tcntx = '';
      throw new Error(res.statusText);
    }
  }

  onMount(async () => {
    const res = await fetch( "/tmaster/tsellist/"+$userid ) ;
    tcodelist = await res.json(); 
    tcodelist.push({code:'%',name:'ALL'});
    selected = tcodelist[0];
//    conds.tcode = selected.code ;
    // promise = Promise.resolve(tcodelist) ;
  });
  
  function enterkey(e) {
    if (e.keyCode == 13) {
        getTRlistm();
      }
  }
</script>

<div class="main" onmouseenter={() => vid = 'none'}>
  <div class="cond fitem" onkeyup={enterkey} >
    <p>* 테스트ID : </p> 
    <select bind:value={selected} onchange={()=> {conds.tcode = ''; conds.page=0}} >
        
      {#each tcodelist as tc}
      <option value={tc}>
        {tc.tcode + ' : ' + tc.name}
      </option>
      {/each}
    </select>
    <span>URI : <input type="text" bind:value={mycond.uri} /></span>
    <span class="number-in">응답코드 : <input  type="number" bind:value={mycond.rcode} /></span>
    <span>기타 : <input style="width: 20rem;" type="text" bind:value={mycond.cond} /></span>
    <button  onclick={getTRlistm}>조회</button>
    <span>{tcntx}</span>

  </div>
  <div class="fitem">
    <Trtable bind:conds/>
  </div>
</div>

<style>
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .cond {
    display:flex ;
    align-items: baseline ;
    
  }
  .cond * {
    margin: 2px 4px;
    padding: 0 3px;
    height: 1.8em;
  }
  .cond span {
    margin: 2px 8px;
  }  
  .cond button {
    width: 4em;
    border-radius: 6px;
  }
  .number-in input{
    max-width: 70px;
    text-align: right;
  }

</style>
