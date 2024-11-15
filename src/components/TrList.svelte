<script>
  import { onMount } from "svelte";
  import { userid,authApps } from "../aqtstore.js";
//   import { getComparator, formatDate, formatDateTime } from "../helpers.js";
// import { bind } from "svelte/internal";
// import DetailTr from "./DetailTR.svelte";
import Trtable from "./Trtable.svelte";

  let vid = 'none';
  let pid ;
  let mycond = {
    rcode: '',
    cond: "",
    uri: ""
  };
  
  let conds = {
    tcode: "",
    rcode: '',
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    apps:""
  };

  let tcodelist = [];
  let selected ;
  let tcnt = '';

  async function getTRlistm() {
    [conds.cond, conds.rcode, conds.uri] = [mycond.cond, mycond.rcode, mycond.uri] ;
    conds.tcode = selected.code ;
    const res = await fetch("/trlist/tcnt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      const rdata = await res.json();
      tcnt = rdata[0].tcnt ;
      console.log("trlist tcnt", rdata) ;
    } else {
      // rdata = Promise.resolve([]);
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
  
</script>

<div class="main" on:mouseenter={() => vid = 'none' }>
  <div class="cond fitem">
    <p>* 테스트ID : </p> 
    <select bind:value={selected} on:change={()=> {conds.tcode = ''; conds.page=0}} >
        
      {#each tcodelist as tc}
      <option value={tc}>
        {tc.code + ' : ' + tc.name}
      </option>
      {/each}
    </select>
    <span>URI : <input type="text" bind:value={mycond.uri} /></span>
    <span class="number-in">응답코드 : <input  type="number" bind:value={mycond.rcode} /></span>
    <span>기타 : <input style="width: 20rem;" type="text" bind:value={mycond.cond} /></span>
    <button on:click={getTRlistm}>조회</button>
    <span>{tcnt}</span>

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
