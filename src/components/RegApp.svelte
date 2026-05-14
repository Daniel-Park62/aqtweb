<!-- @migration-task Error while migrating Svelte code: `<tr>` is invalid inside `<table>` -->
<script>
  import { onMount } from "svelte";
  import tapphost from "../model/tapphost.js";
  import { getFirst } from "../lib/Common.svelte";

  let columns = [0, "", "", ""];
  let columns_dtl = [0,"", "Host IP 입력", "0"];
  let data = $state([]) ;
  let datadtl = $state([]);
  let deldata = [];
  let deldata_dtl = [];
  let newRow = $state([...columns]);
  let newRow_dtl = $state([...columns_dtl]);

  let appid = "" ;

  function addRow() {
    newRow[0] = 1 ;
    data = [...data, [...newRow]];

  }
  function addRow_dtl() {
    columns_dtl[1] = appid;
    newRow_dtl[1] = appid;
    datadtl = [...datadtl, [...newRow_dtl]];
//    newRow_dtl = [...columns_dtl];
//    console.log(appid,datadtl);
  }

  /**
     * @param {any[]} rowToBeDeleted
     */
  function deleteRow(rowToBeDeleted) {
    deldata.push(rowToBeDeleted[1]);
    data = data.filter((row) => row != rowToBeDeleted);
  }
  /**
     * @param {any[]} rowToBeDeleted
     */
  function deleteRow_dtl(rowToBeDeleted) {
    deldata_dtl.push(rowToBeDeleted[0]);
    datadtl = datadtl.filter((row) => row != rowToBeDeleted);
  }

  /**
     * @param {string} appid
     */
  async function getApphost (appid) {
    if (appid > "") {
      datadtl = await tapphost.getApphost(appid);
      deldata_dtl = [];
    } else {
      datadtl = [];
    }
    columns_dtl[1] = appid ;
    newRow_dtl = [...columns_dtl];
//    return datadtl;
  }

  // $: promise = data;
  // $effect (() => { getApphost(appid); });
  //$: promise_dtl = datadtl;

  async function getData() {
   data = await tapphost.getData();
    newRow = [...columns];
    deldata = [];
    deldata_dtl = [];
    // if (data.length > 0) appid = data[0][1] ;
    getApphost(appid) ;
  }

  async function updApp() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;
    let dcnt = "" , ucnt = "" ;
    await updAppHost();
    if (deldata.length) {
      const rmsg = await tapphost.delApp(deldata).then( res => res.json() );
      console.log("삭제",rmsg,"result") ;
      if (rmsg.affectedRows) dcnt = ` ${rmsg.affectedRows} 건 삭제\n`;
    }
    const udata = data.filter(r => r[0] ).map(r => {r.shift(); return r} ) ;
    if ( udata.length ) {
      const rmsg = await tapphost.updApp(udata).then(res => res.json());
      if (rmsg.affectedRows)ucnt = ` ${rmsg.affectedRows} 건 수정`;
      getData();
      getFirst();
    }
    console.log("적용",dcnt, ucnt) ;
    if (dcnt>"" || ucnt>"") alert(`적용완료: ${dcnt}  ${ucnt} `);
  }

  async function updAppHost() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;
    if (deldata_dtl.length) await tapphost.delAppHost(deldata_dtl);
    if (datadtl.length === 0) return ;
    await tapphost.updAppHost(datadtl)
      .then(async res => {
        const rmsg = await res.json() ;
        alert(rmsg) ;
      }).catch((err) => {
        alert("error:" + err.message);
      });
  }

  onMount( getData );
</script>
<main class="h-full w-full">
<div class="headpan">
  <button onclick={updApp}>적용</button>
  <button onclick={getData}>적용취소</button>
</div>

<div class="flex-[1_1_0] flex items-start gap-4 w-full max-h-[calc(100%-50px)] overflow-auto">
  <table class="app-tbl w-3/5 overflow-auto ">
    <thead>
      <tr>
        <th class="w-10">수정</th>
        <th>업무ID</th>
        <th>업무명</th>
        <th>담당자</th>
        <th class="w-20">삭제</th>
      </tr>
    </thead>
    <!-- {#await promise}
      <p>...waiting</p>
    {:then rows} -->
    <tbody>
      {#each data as row}
        <tr onclick={() => {appid = row[1]; getApphost(appid) }} >
          <td><input type="checkbox" bind:checked={row[0]} /></td>
          <td contenteditable="false" bind:textContent={row[1]}></td>
          <td contenteditable="true" bind:textContent={row[2]}></td>
          <td contenteditable="true" bind:textContent={row[3]}></td>
          <td><button class="btn-delete" onclick={() => deleteRow(row)}>X</button></td>
        </tr>
      {/each}
    <!-- {/await} -->
    <tr>
      {#each newRow as col, i}
        {#if i == 0 }
          <td><input type="checkbox" bind:checked={newRow[i]} ></td>
        {:else}
          <td contenteditable="true" bind:textContent={newRow[i]}></td>
        {/if}
      {/each}
      <td><button onclick={addRow}>add</button></td>
    </tr>
    </tbody>
    <!-- <pre style="background: #eee">{JSON.stringify(data, null, 2)}</pre> -->
  </table>
  <table class="apphost w-2/5 overflow-x-auto">
    <thead>
      <tr>
        <th>APP ID</th>
        <th>Host IP</th>
        <th>Port</th>
        <th class="w-20">삭제</th>
      </tr>
    </thead>
    <!-- {#await promise_dtl}
      <p>searching...</p>
    {:then rows} -->
    <tbody>
      {#each datadtl as row}
        <tr>
          <td contenteditable="false" bind:textContent={row[1]}></td>
          <td contenteditable="true" bind:textContent={row[2]}></td>
          <td contenteditable="true" bind:textContent={row[3]}></td>
          <td><button class="btn-delete" onclick={() => deleteRow_dtl(row)}>X</button></td>
        </tr>
      {/each}
    <!-- {:catch error}
      <p>{error.message}</p>
    {/await} -->
    <tr >
      <td contenteditable="false" bind:textContent={newRow_dtl[1]}></td>
      <td contenteditable="true" bind:textContent={newRow_dtl[2]}></td>
      <td contenteditable="true" bind:textContent={newRow_dtl[3]}></td>
      <td><button onclick={addRow_dtl}>add</button></td>
    </tr>
    </tbody>
  </table>
</div>
</main>
<style>

  tr td:focus {
    background: #eee;
  }
  td button {
    @apply h-[90%] text-[90%] py-0
  }
</style>
