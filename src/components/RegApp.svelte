<!-- @migration-task Error while migrating Svelte code: `<tr>` is invalid inside `<table>` -->
<script>
  import { onMount } from "svelte";

  let columns = [1, "APPID", "APP명", "담당자"];
  let columns_dtl = [0,"APPID", "Host IP", "0"];
  let data = [];
  let deldata = [];
  let deldata_dtl = [];
  let datadtl = [];
  let newRow = [...columns];
  let newRow_dtl = [...columns_dtl];

  let appid = "";

  function addRow() {
    data = [...data, [...newRow]];
//    newRow = [...columns];
  }
  function addRow_dtl() {
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
      const res = await fetch("/regapp/host/" + appid);
      datadtl = await res.json();
      deldata_dtl = [];
    } else {
      datadtl = [];
    }
    columns_dtl[1] = appid ;
    newRow_dtl = [...columns_dtl];
//    return datadtl;
  }

  // $: promise = data;
  $: { getApphost(appid); }
  //$: promise_dtl = datadtl;

  async function getData() {
   const res = await fetch("/regapp");
   const rows = await res.json();
   data = rows.map((r) => { r.unshift(0); return r} ) ;

    deldata = [];
    deldata_dtl = [];
    if (data.length > 0) appid = data[0][1] ;
  }
  function delApp() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;

    fetch("/regapp", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: deldata,
      }),
    }).then(res => {
      if ( res.ok ) deldata_dtl = [] ;
    }).catch((err) => {
      alert( err.message ) ;
    });
  }
  function delAppHost() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;

    fetch("/regapp/host", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: deldata_dtl,
      }),
    }).catch((err) => {
      throw err;
    });
  }

  function updApp() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;
    updAppHost();
    if (deldata.length) delApp();
    const udata = data.filter(r => r[0] ).map(r => {r.shift(); return r} ) ;
    if ( udata.length == 0 ) return ;
    fetch("/regapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: udata,
      }),
    })
      .then(async (res) => {
        // getFirst() ;
        let rmsg = await res.json();
        alert(rmsg.message);
        if (res.status < 300) {
          getData();
//          await setAppid();
        }
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
      
  }

  function updAppHost() {
    // let udata = [];
    // data.forEach(r => { console.log(r) ; udata.push(r) } ) ;
    if (deldata_dtl.length) delAppHost();
    if (datadtl.length === 0) return ;
    fetch("/regapp/host", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ins: datadtl.filter(r => r[0] == 0).map(r => {r.shift() ; return r ;}) ,
        upd: datadtl.filter(r => r[0] > 0) ,
      }),
    }).then(async res => {
      const rmsg = await res.json() ;
      console.log(rmsg) ;
    }).catch((err) => {
      alert("error:" + err.message);
    });
  }

  onMount( getData );
</script>
<main class="h-full w-full">
<div class="flex justify-start gap-2 m-2">
  <button on:click={updApp}>적용</button>
  <button on:click={getData}>적용취소</button>
</div>
<hr />

<div class="flex items-start gap-4 w-full">
  <table class="app-tbl flex-1 min-w-0 overflow-x-auto">
    <thead>
      <tr>
        <th>수정</th>
        <th>APP id</th>
        <th>APP 명</th>
        <th>담당자</th>
        <th style="width:4rem">삭제</th>
      </tr>
    </thead>
    <!-- {#await promise}
      <p>...waiting</p>
    {:then rows} -->
    <tbody>
      {#each data as row}
        <tr on:click={() => (appid = row[1])}>
          <td><input type="checkbox" bind:checked={row[0]} /></td>
          <td contenteditable="false" bind:textContent={row[1]} />
          <td contenteditable="true" bind:textContent={row[2]} />
          <td contenteditable="true" bind:textContent={row[3]} />
          <td><button on:click={() => deleteRow(row)}>X</button></td>
        </tr>
      {/each}
    <!-- {/await} -->
    <tr>
      {#each newRow as col, i}
        {#if i == 0 }
          <td><input type="checkbox" bind:checked={col} /></td>
        {:else}
          <td contenteditable="true" bind:textContent={col} />
        {/if}
      {/each}
      <td><button on:click={addRow}>add</button></td>
    </tr>
    </tbody>
    <!-- <pre style="background: #eee">{JSON.stringify(data, null, 2)}</pre> -->
  </table>
  <table class="apphost flex-1 min-w-0 overflow-x-auto">
    <thead>
      <tr>
        <th>APP ID</th>
        <th>Host IP</th>
        <th>Port</th>
        <th style="width:4rem">삭제</th>
      </tr>
    </thead>
    <!-- {#await promise_dtl}
      <p>searching...</p>
    {:then rows} -->
    <tbody>
      {#each datadtl as row}
        <tr>
          <td contenteditable="false" bind:textContent={row[1]} />
          <td contenteditable="true" bind:textContent={row[2]} />
          <td contenteditable="true" bind:textContent={row[3]} />
          <td><button on:click={() => deleteRow_dtl(row)}>X</button></td>
        </tr>
      {/each}
    <!-- {:catch error}
      <p>{error.message}</p>
    {/await} -->
    <tr >
      <td contenteditable="false" bind:textContent={newRow_dtl[1]} />
      <td contenteditable="true" bind:textContent={newRow_dtl[2]} />
      <td contenteditable="true" bind:textContent={newRow_dtl[3]} />
      <td><button on:click={addRow_dtl}>add</button></td>
    </tr>
    </tbody>
  </table>
</div>
</main>
<style>

  td button {
    font-size: 0.7em;
  }

  tr td:focus {
    background: #eee;
  }

  [contenteditable] {
    outline-style: none;
  }
</style>
