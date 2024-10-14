
<script>
  import { onMount,onDestroy, afterUpdate } from "svelte";
  import { gtcode, userid } from "../aqtstore" ;
  
  let tlist_org = [];
  export let tlist ;
  let conds = {
    srccode: "",
    dstcode: "",
    uri: "",
    cnt: 0,
    cond: ""
  };
  let rdata = Promise.resolve([]);
  let rmsg="↓ 데이터생성 버튼을 누르면 작업이 시작됩니다."
  let ltcode ;
  const unsubs = gtcode.subscribe((data) => {
    ltcode = data;
    conds.srccode = ltcode ;
    conds.dstcode = ltcode ;
    // console.log(ltcode);
  });
  
  onDestroy(unsubs) ;

  async function createTr() {
    rmsg = ">>> 작업중..." + JSON.stringify(conds) ;
    const res = await fetch("/tmaster/copyTr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      rdata = await res.json();
      rmsg = rdata[0].v_msg ;
          //  console.log("createTR end", rdata) ;
    } else {
      rdata = Promise.resolve([]);
      rmsg = res ;
      throw new Error(res);
    }

  }

  onMount(async () => {
  //   if (tlist.length == 0) {
  //   const res = await fetch( "/tmaster/tsellist/"+$userid ) ;
  //   tlist = await res.json(); 
  //   }
  //  conds.dstcode =  tlist[0].code ;
    const reso = await fetch( "/tmaster/torglist" ) ;
    tlist_org = await reso.json(); 
    tlist_org.push({tcode:'%',sdate:'ALL'});
    conds.srccode = tlist_org[0].tcode;

  });

</script>
  
<h2>테스트데이터 생성</h2>
<div class="items">
  <span class="in_label">원본:</span><span>
    <select  class="in_value" bind:value={conds.srccode} >
      {#each tlist_org as torg }
        <option value={torg.tcode}>{torg.tcode + ' : ' + torg.sdate}</option>
      {/each}
    </select>
  </span>
  <span class="in_label">대상:</span><span>
    <select  class="in_value" bind:value={conds.dstcode} >
      {#each tlist as t }
        <option value={t.code}>{t.code + ' : ' + t.name}</option>
      {/each}
    </select>
  </span>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="item in_label">URI or 서비스:</label><input class="item in_value" bind:value={conds.uri}/>
  <div class="item in_label">서비스별 건수:</div><input class="item in_value" type="number" bind:value={conds.cnt}/>
  <div class="item in_label">기타조건:</div><textarea rows="3" class="item in_value" style="grid-column: 2 / span 2;" bind:value={conds.cond}/>
</div>
<p>** 작업정보 **</p>
<p> {rmsg}</p>
<hr>
<div>
  <button on:click={createTr}>데이터생성</button>
  <button on:click>닫기</button>
</div>

<style>
  .items {
    display:grid;
    grid-template-columns: 8rem 1fr 8rem 1fr;
    gap: 10px 20px;
    align-content: start; 
    background-color:rgb(160, 185, 187);
    padding: 0.5em;
    min-height: auto;
  }

  .item {
    vertical-align: text-bottom ;
  }

  .in_value {
    border: 1px solid silver;
    border-radius: 5px;
  }
  .in_label {
    text-align: end;
  }
</style>
