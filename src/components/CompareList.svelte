<script>
  import { onMount } from "svelte";
  import { userid } from "../aqtstore.js";
  import CompareTr from "./CompareTr.svelte";

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
<main class="flex flex-col h-full" role="none" onmouseenter={() => vid = 'none'}>
  <div class="flex-none headpan mb-0" role="none" onkeyup={enterkey}>
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
    <span>기타 : <input class="w-[20rem]" type="text" bind:value={mycond.cond} placeholder=" tobe:a.* , 원본:b.*"/></span>
    <button onclick={getTRlistm}>조회</button>
    <span>{tcntx}</span>

  </div>

  <div class="h-full">
    <CompareTr bind:conds />
  </div>
</main>
