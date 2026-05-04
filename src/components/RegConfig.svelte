<script>
  import { onMount } from "svelte";
  import * as tconfig from "../model/tconfig"
  
  let curRow = $state({});

  onMount(async () => {
    curRow = await tconfig.getdata();
  });
</script>

<div class="main h-auto m-3 p-10">
  <div class="items">
    <div class="item in_label">프로젝트명:</div>
    <input class="item in_value"  bind:value={curRow.pjtnm} />
    <div class="item in_label">기본 Encoding:</div>
    <input class="item in_value"  bind:value={curRow.encval} />
    <div title='결과값은 char(1)만 유효합니다.' class="item in_label">실패조건:</div>
    <textarea rows="2"  bind:value={curRow.sflagc}></textarea>
    <div class="item in_label">원본차이조건:</div>
    <textarea rows="2"  bind:value={curRow.diffc}></textarea>
  </div>
  <div class="m-2">
    <button onclick={() => tconfig.updateConfig(curRow)}>저장</button>
  </div>
  <hr />
  <div class="items">
    <div class="item in_label "> 가상칼럼1: </div>
    <div class="item grp" >
      <input class="item in_value" style="float:left" bind:value={curRow.col1} />
      <input class="item in_value"  bind:value={curRow.col1type} />
      <input class="item in_value"  bind:value={curRow.expr1} />
      <button class="item" onclick={() => tconfig.altercol1(curRow)}>적용</button>
    </div>
    <div class="item in_label "> 가상칼럼2: </div>
    <div class="item grp" >
      <input class="item in_value" style="float:left" bind:value={curRow.col2} />
      <input class="item in_value"  bind:value={curRow.col2type} />
      <input class="item in_value"  bind:value={curRow.expr2} />
      <button class="item" onclick={() => tconfig.altercol2(curRow)}>적용</button>
    </div>
  </div>
  <hr />

</div>

<style>
  .main {
    max-height: 100%;
    overflow: auto;
    border: 1px solid silver;
    box-shadow: 0px 0px 5px #888;
  }

  .items {
    display: grid;
    grid-template-columns:  9rem 1fr ;
    gap: 3px 10px;
    align-content: start;
    justify-content: baseline;

    align-items: center;
    margin: 10px;
  }

  .item {
    vertical-align: text-bottom;
  }

  .in_value:not(textarea) {
    border: 1px solid silver;
    border-radius: 5px;
    height: 2.2em;
  }
  .in_label {
    
    text-align: end;
    font-weight: bold;
    vertical-align: text-bottom;
  }
  .grp {
    /* border: 1px solid rgb(235, 233, 233); */
    grid-template-columns:  10rem auto auto 6rem;
    margin: 10px ;
    display: grid;
    column-gap: 10px;
    height:2.2em;
    width : 100%;
  }

  /* textarea {
    height: 50px;
    font-size: 0.8em;
  }
 */
</style>
