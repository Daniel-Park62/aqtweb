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

  let promise = [];
  let promise_dtl = [];
  let appid = "";

  function addRow() {
    data = [...data, [...newRow]];
    newRow = [...columns];
  }
  function addRow_dtl() {
    newRow_dtl[1] = appid;
    datadtl = [...datadtl, ...newRow_dtl];
    newRow_dtl = [...columns_dtl];
  }

  function deleteRow(rowToBeDeleted) {
    deldata.push(rowToBeDeleted[1]);
    data = data.filter((row) => row != rowToBeDeleted);
  }
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
    } else {
      datadtl = [];
    }
    newRow_dtl = [...columns_dtl];
    return datadtl;
  }

  $: promise = data;
  $: promise_dtl = getApphost(appid);
  //$: promise_dtl = datadtl;

  async function getData() {
   const res = await fetch("/regapp");
   const rows = await res.json();
   data = rows.map(r => { r.unshift(0); return r} ) ;

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
    }).catch((err) => {
      throw err;
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
        values: datadtl ,
      }),
    }).catch((err) => {
      throw err;
    });
  }

  onMount( getData );
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
  <button on:click={updApp}>적용</button>
  <button on:click={getData}>적용취소</button>
</div>
<hr />

<div class="container">
  <table class="app-tbl item">
    <thead>
      <tr>
        <th>수정</th>
        <th>APP id</th>
        <th>APP 명</th>
        <th>담당자</th>
        <th style="width:4rem">삭제</th>
      </tr>
    </thead>
    {#await promise}
      <p>...waiting</p>
    {:then rows}
      {#each rows as row}
        <tr on:click={() => (appid = row[1])}>
          <td><input type="checkbox" bind:checked={row[0]} /></td>
          <td contenteditable="false" bind:textContent={row[1]} />
          <td contenteditable="true" bind:textContent={row[2]} />
          <td contenteditable="true" bind:textContent={row[3]} />
          <td><button on:click={() => deleteRow(row)}>X</button></td>
        </tr>
      {/each}
    {/await}
    <tr style="color: grey">
      {#each newRow as col, i}
        {#if i == 0 }
          <td><input type="checkbox" bind:checked={col} /></td>
        {:else}
          <td contenteditable="true" bind:textContent={col} />
        {/if}
      {/each}
      <td><button on:click={addRow}>add</button></td>
    </tr>
    <!-- <pre style="background: #eee">{JSON.stringify(data, null, 2)}</pre> -->
  </table>
  <table class="apphost item">
    <thead>
      <tr>
        <th>APP ID</th>
        <th>Host IP</th>
        <th>Port</th>
        <th style="width:4rem">삭제</th>
      </tr>
    </thead>
    {#await promise_dtl}
      <p>searching...</p>
    {:then rows}
      {#each rows as row}
        <tr>
          <td contenteditable="false" bind:textContent={row[1]} />
          <td contenteditable="true" bind:textContent={row[2]} />
          <td contenteditable="true" bind:textContent={row[3]} />
          <td><button on:click={() => deleteRow_dtl(row)}>X</button></td>
        </tr>
      {/each}
    {:catch error}
      <p>{error.message}</p>
    {/await}
    <tr style="color: grey">
      <td contenteditable="false" bind:textContent={newRow_dtl[1]} />
      <td contenteditable="true" bind:textContent={newRow_dtl[2]} />
      <td contenteditable="true" bind:textContent={newRow_dtl[3]} />
      <td><button on:click={addRow_dtl}>add</button></td>
    </tr>
  </table>
</div>

<style>
  .container {
    max-height: 85vh;
    overflow: auto;
    display: flex;
  }
  .app-tbl {
    flex: 1 1 0;
  }
  .apphost {
    flex: 1 1 0;
    margin: 0 0 auto 5px;
  }
  .app-tbl,
  .apphost {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
  }

  .item {
    border-collapse: collapse;
    height: auto;
  }

  td,
  th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
  }

  th {
    padding: 8px;
    text-align: center;
    position: sticky;
    top: 0;
  }
  td button {
    font-size: 0.7em;
  }
  /* app-tbl tr:nth-child(even) {
    background-color: #f2f2f2;
  } */

  /* tr:hover {
    background-color: #ddd;
  } */

  tr td:focus {
    background: #eee;
  }

  [contenteditable] {
    outline-style: none;
  }
</style>
