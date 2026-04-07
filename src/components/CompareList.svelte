<script>
  import { onMount } from "svelte";
  import { userid,authApps } from "../aqtstore.js";
//   import { getComparator, formatDate, formatDateTime } from "../helpers.js";
// import { bind } from "svelte/internal";
// import DetailTr from "./DetailTR.svelte";
import CompareTr from "./CompareTr.svelte";

  let vid = $state('none');
  let pid ;
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
    valchk: false,
    valiance: 0,
    apps:""
  });

  let tcodelist = $state([]);
  let selected = $state() ;
  let tcntx = $state('');

  async function getTRlistm() {
    conds.tcode = selected.tcode ;
    tcntx='조회중';
    const res = await fetch("/tloaddata/compareTcnt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      Object.assign(conds, mycond) ; 
      const rdata = await res.json();
      const tcnt = rdata.tcnt ;
      tcntx = Number(tcnt).toLocaleString() +' 건';
      // console.log("trlist tcnt", rdata) ;
    } else {
      // rdata = Promise.resolve([]);
      tcntx = '';
      throw new Error(res.statusText);
    }
  }
  function enterkey(e) {
    if (e.keyCode == 13) {
        getTRlistm();
      }
  }

  onMount(async () => {
    const res = await fetch( "/tmaster/tsellist/"+$userid ) ;
    tcodelist = await res.json(); 
    tcodelist.push({tcode:'%',name:'ALL'});
    selected = tcodelist[0];
//    conds.tcode = selected.code ;
    // promise = Promise.resolve(tcodelist) ;
  });
  
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="main" role="button" onmouseenter={() => vid = 'none'}>
  <div class="cond fitem" role="button"  onkeyup={enterkey}>
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
    <span>기타 : <input style="width: 20rem;" type="text" bind:value={mycond.cond} placeholder=" tobe:a.* , 원본:b.*"/></span>
    <button onclick={getTRlistm}>조회</button>
    <span>{tcntx}</span>

  </div>

  <div class="fitem">
    <CompareTr bind:conds />
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
    height: 1.7em;
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
