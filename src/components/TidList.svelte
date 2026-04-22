<script>
  
  import { authApps } from "../aqtstore.js";
  import { onMount } from "svelte";
  import { getLvlnm } from "../lib/Common.svelte";
  import Trtable from "./Trtable.svelte";
  // import Modal,{getModal} from '../lib/Modal.svelte';
  import Modal from '../lib/Modal2.svelte';
  
  /** @type {{vdisp?: boolean, tcode: any }} */
  let { vdisp = true, tcode = $bindable() } = $props();
  let conds = $state({
    tcode: "",
    rcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    task: "",
    apps: "",
  });
  let showModal = $state(false);
  let sv_row;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
    tcode=row.tcode;
  }

  // let promise = [Promise.resolve([])];
  let rows = $state([]);
  async function getdata() {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
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
  
  $effect(() => {
    getdata();
  });
</script>

<!-- <div class="w-full overflow-y-auto box-border"> -->
  <table class="w-[98%]">
    <thead>
      <tr>
        <th id='tcode' class='cursor-pointer' onclick={sortdata}>테스트ID</th>
        <th id='desc1' class='cursor-pointer' onclick={sortdata}>테스트명</th>
        <th id='tdate' class='cursor-pointer' onclick={sortdata}>테스트일자</th>
        <th>단계</th>
        <th id='thost' class='cursor-pointer' onclick={sortdata}>대상호스트</th>
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
          <tr onclick={(e)=>clickRow(e,row)}
              ondblclick={()=> { if (!vdisp) return; conds.tcode=row.tcode;conds.page=0; showModal = true; }} >
            <td>{row.tcode}</td>
            <td align="left">{row.desc1}</td>
            <td>{row.tdate}</td>
            <td>{getLvlnm(row.lvl)}</td>
            <td>{row.thost}</td>
            <td align="right">{row.svc_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.data_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
            <td align="right" ondblclick={()=> { conds.tcode=row.tcode;conds.cond = "sflag='2'"; showModal = true; }} >
                {row.fcnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.fsvc_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.spct.toFixed(2)}</td>
            <td align="right">{(row.data_cnt - row.scnt - row.fcnt).toLocaleString("ko-KR")}</td>
          </tr>
        {/each}
      <!-- {:catch error}
        <p style="color: red">{error.message}</p>
      {/await} -->
    </tbody>
  </table>
<!-- </div> -->
{#if vdisp }
  <Modal bind:showModal>
    <Trtable bind:conds/>
  </Modal>
{/if}
