<script>
  import { authApps } from "../aqtstore.js";
  import { onMount } from "svelte";
  import { getLvlnm } from "./Common.svelte";
  import Trtable from "./Trtable.svelte";
  import Modal,{getModal} from './Modal.svelte';
  /* trtable 사용여부 기능 추가, byTcode 에서 중복되는문제 해결을 위함*/
  export let vdisp = true ;
  export let tcode ;
  export let tick ;
  let conds = {
    tcode: "",
    rcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    task: "",
    apps: "",
  };
  $: getdata(tick);
  let sv_row;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
    tcode=row.code;
  }

  // let promise = [Promise.resolve([])];
  let rows = [];
  async function getdata(x) {
      const res = await fetch( "/dashboard/list/"+$authApps);
      rows = await res.json();
//      console.log(" call dashboard end", promise) ;
  }

  onMount(getdata);
  
  const sortBy = { col: "", direction: -1 };

  function sortdata(e) {

    if (sortBy.col == e.target.id) {
      sortBy.direction = sortBy.direction * -1;
    } else {
      sortBy.col = e.target.id;
      sortBy.direction = 1;
      if (sortBy.old) sortBy.old.textContent = sortBy.old.textContent.replace(/ [△▽]/,'') ;
    }
    e.target.textContent = e.target.textContent.replace(/ [△▽]/,'') ;
    e.target.textContent += sortBy.direction == 1 ? ' △': ' ▽' ;
    sortBy.old = e.target ;
    let usort = (a, b) =>
      a[e.target.id] < b[e.target.id] 
        ? -1 * sortBy.direction
        : a[e.target.id] > b[e.target.id]
        ? 1 * sortBy.direction
        : 0;
    rows = [...rows].sort(usort);
  };
  
</script>

<div class="container">
  <table class="tcode-status">
    <thead>
      <tr>
        <th id='code' class='cursor-pointer' on:click={sortdata}>테스트ID</th>
        <th id='desc1' class='cursor-pointer' on:click={sortdata}>테스트명</th>
        <th id='tdate' class='cursor-pointer' on:click={sortdata}>테스트일자</th>
        <th>단계</th>
        <th id='thost' class='cursor-pointer' on:click={sortdata}>대상호스트</th>
        <th>서비스수</th>
        <th>패킷건수</th>
        <th>성공건수</th>
        <th>실패건수</th>
        <th>실패서비스</th>
        <th>성공율(%)</th>
        <th>미수행건수</th>
      </tr>
    </thead>
    <tbody>
      <!-- {#await promise}
        <p>...waiting</p>
      {:then rows} -->
        {#each rows as row}
          <tr on:click={(e)=>clickRow(e,row)}
              on:dblclick={()=> { if (!vdisp) return; conds.tcode=row.code;conds.page=0; getModal().open()}} >
            <td>{row.code}</td>
            <td align="left">{row.desc1}</td>
            <td>{row.tdate}</td>
            <td>{getLvlnm(row.lvl)}</td>
            <td>{row.thost}</td>
            <td align="right">{row.svc_cnt}</td>
            <td align="right">{row.data_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
            <td align="right" on:dblclick={()=> { conds.tcode=row.code;conds.cond = "sflag='2'"; getModal().open()}} >
                {row.fcnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.fsvc_cnt}</td>
            <td align="right">{row.spct.toFixed(2)}</td>
            <td align="right">{(row.data_cnt - row.scnt - row.fcnt).toLocaleString("ko-KR")}</td>
          </tr>
        {/each}
      <!-- {:catch error}
        <p style="color: red">{error.message}</p>
      {/await} -->
    </tbody>
  </table>
</div>
{#if vdisp }
<Modal>
	<Trtable bind:conds/>
</Modal>
{/if}

<style>
  .tcode-status {
    font-family: "맑은 고딕", "Lato", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    overflow-y: auto;
  }

</style>
