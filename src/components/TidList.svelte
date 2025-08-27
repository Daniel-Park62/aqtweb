<script>
  import { authApps } from "../aqtstore.js";
  import { onMount } from "svelte";
  import { getLvlnm } from "./Common.svelte";
  import Trtable from "./Trtable.svelte";
  import Modal,{getModal} from './Modal.svelte';
  /* trtable 사용여부 기능 추가, byTcode 에서 중복되는문제 해결을 위함*/
  export let vdisp = true ;
  export let tcode ;
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
  let sv_row;
  // let promise = [Promise.resolve([])];
  let rows = [];
  async function getdata() {
      const res = await fetch( "/dashboard/list/"+$authApps);
      rows = await res.json();
//      console.log(" call dashboard end", promise) ;
  }

  onMount(getdata);
  
</script>

<div class="container">
  <table class="tcode-status">
    <thead>
      <tr>
        <th>테스트ID</th>
        <th>테스트명</th>
        <th style="width:6em">테스트일자</th>
        <th>단계</th>
        <th>대상호스트</th>
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
          <tr on:click={() => {
            if (sv_row) sv_row.classList.remove("row-selected");
            sv_row = event.target.parentElement.cells[0];
            sv_row.classList.toggle("row-selected");
            tcode=row.code;
            }}
              on:dblclick={()=> { conds.tcode=row.code;conds.page=0; getModal().open()}} >
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
