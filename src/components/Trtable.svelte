<script>
    import { query_selector_all } from "svelte/internal";
  import { authApps, userid } from "../aqtstore.js";
  import DetailTR from "./DetailTR.svelte";
  import { onMount } from "svelte";

  const columns = [
    "ID",
    "송신시간",
    "소요시간",
    "Method",
    "URI",
    "Status",
    "수신크기",
    "수신데이터",
    "Port",
    "APID",
    "",
    "",
  ];
  let vid = "none";
  let pid;
  let parr ;
  let pidx = 0;
  export let conds = {
    tcode: "",
    rcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    task: "",
    apps: "",
  };

  //  let rdata = Promise.resolve([]);
  let rdata = [];
  let achk = '□';
  let sortColumn = null;
  let sortDirection = null;
  let pg = conds.page + 1;

  $: if (conds.tcode > " ") {
    getTRlist();
  }

  async function reSend() {
    const datas = rdata
      .filter((r) => r.chk)
      .map((r) => {
        return [r.pkey, r.id, r.tid, $userid];
      });
      if (datas.length === 0) {
        alert("선택된 자료가 없습니다.") ;
        return ;
      }
    // console.log(datas) ;
    fetch("/trequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ insdata: datas }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  onMount( () => {
    fetch("/trlist/config")
    .then( res =>  res.json())
    .then( r => {
      if (r.col1) columns[10] = r.col1;
      if (r.col2) columns[11] = r.col2;
      // console.log(r, columns);
    }) 
    .catch( err => console.error(err)) ;
    // promise = Promise.resolve(tcodelist) ;
  });
  async function getTRlist() {
    // console.log("entr ...", conds) ;
    if (conds.tcode == undefined) return Promise.resolve([]);
    pg = conds.page + 1;
    conds.apps = $authApps;
    const res = await fetch("/trlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      rdata = await res.json();
      //  console.log("trlist end", rdata) ;
    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res.statusText);
    }
  }

  async function getDownLoad() {
    conds.apps = $authApps;
    const res = await fetch("/tresult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      //      rdata = await res.json();
      const file = await res.blob();
      const downloadUrl = window.URL.createObjectURL(file); // 해당 file을 가리키는 url 생성

      const anchorElement = document.createElement("a");
      document.body.appendChild(anchorElement);
      anchorElement.download = conds.tcode; // a tag에 download 속성을 줘서 클릭할 때 다운로드가 일어날 수 있도록 하기
      anchorElement.href = downloadUrl; // href에 url 달아주기

      anchorElement.click(); // 코드 상으로 클릭을 해줘서 다운로드를 트리거

      document.body.removeChild(anchorElement); // cleanup - 쓰임을 다한 a 태그 삭제
      window.URL.revokeObjectURL(downloadUrl); // cleanup - 쓰임을 다한 url 객체 삭제
    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res.statusText);
    }
  }

  function sortBy(column) {
    const sameColumn = column === sortColumn;
    const currentlyAscending = sortDirection === "ASC";
    const unsetSort = sameColumn && !currentlyAscending;

    sortColumn = unsetSort ? null : column;
    sortDirection = unsetSort
      ? null
      : sameColumn && currentlyAscending
        ? "DESC"
        : "ASC";
  }

  //  $: display = sortColumn && sortDirection ? sortData() : [...data];
  //  $: conds.page = pg - 1 ;
</script>

<div class="fitem pgset">
  <span class="number-in">
    Page :<input
      type="number"
      min="1"
      style="text-align:center;"
      bind:value={pg}
      on:change={() => {
        conds.page = pg - 1;
      }}
    />
    Page크기 :<input
      type="number"
      min="1"
      style="text-align:center;"
      bind:value={conds.psize}
    />
  </span>

  <button
    on:click={() => {
      conds.page++;
    }}
  >
    Next &gt;</button
  >
  {#if pg > 1}
    <button
      on:click={() => {
        conds.page--;
      }}
    >
      &lt; Prev
    </button>
  {/if}
  <div style="margin-left: auto">
    <button on:click={reSend}>재전송</button>
    <button on:click={getDownLoad}>CSV</button>
  </div>
</div>
<div class="fitem tbl">
  <table>
    <thead>
      <tr>
        <th  on:click={() => {
          const clist = document.querySelectorAll(".chkb");
          const chk = achk === '□' ;
          for(let i=0; i<clist.length; i++) {
              clist[i].checked =  chk;
              rdata[i].chk = chk ;
          }
          if (chk) achk = '▣' ; else achk = '□' ;
        }}>{achk}</th>
        {#each columns as column }
          <th>
            <!--        <Button {sortBy} {column} {sortColumn} {sortDirection} />  -->
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- {#await rdata}
        <p>...waiting</p>
      {:then rows} -->
      {#each rdata as row , i (row.pkey)}
        <tr
          class={row.sflag}
          on:dblclick={() => {
            pid = row.pkey;
            vid = "block";
            pidx = i ;
            parr = rdata.map( k => k.pkey ) ;
          }}
        >

          <td><input class="chkb" type="checkbox" bind:checked={row.chk} /></td>

          <td class="cmpid"><strong><em>{row.id}</em></strong></td>
          <td class="stime">{row.송신시간}</td>
          <td style="text-align:right" class="elapsed">{row.소요시간}</td>
          <td class="method">{row.method === null ? "" : row.method}</td>
          <td class="uri">{row.uri}</td>
          <td class="rcode">{row.status}</td>
          <td style="text-align:right" class="rlen"
            >{row.수신크기.toLocaleString("ko-KR")}</td
          >
          <td class="rhead">{row.수신데이터 === null ? "" : row.수신데이터}</td>
          <td class="dstport">{row.dstport}</td>
          <td class="appid">{row.appid}</td>
          {#if row.col1}<td class="col1">{row.col1}</td>{/if}
        </tr>
      {/each}
      <!-- {:catch err}
        <p style="color: red">{err.message}</p>
      {/await} -->
    </tbody>
  </table>
</div>
<DetailTR bind:vid bind:pid bind:parr />

<style>
  .elapsed,
  .rlen,
  .rcode,
  .method,
  .dstport,
  .appid {
    width: 5em;
  }
  .cmpid {
    width: 6em;
  }
  .stime {
    width: 14em;
  }
  .rhead,
  .uri {
    text-align: left;
  }

  .pgset {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
  }
  .pgset * {
    margin: 2px 4px;
    padding: 2px 3px;
    height: 1.7rem;
  }
  button {
    border-radius: 6px;
  }
  .pgset button {
    width: 4em;
  }
  .number-in input {
    max-width: 60px;
    text-align: center;
  }

  .tbl {
    overflow: auto;
    height: 78vh;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  /*
  thead {
    max-height: 1.2em;
    position: sticky;
    top: 0px;
  }
  th {
    max-width: 20%;
    padding-left: 5px;
    text-align: center;
    border-right: 1px solid #f0f2fa;
  }

  td {
    max-width: 20%;
    margin: 0;
    padding: 0.5rem;
    vertical-align: top;
    text-align: center;
    font-size: 0.9rem;
    background-color: #ffffff;
    border-right: 1px solid #f0f2fa;
  }

  td, th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
  }

  tbody tr:nth-child(odd) td {
    background-color: #fafbff;
  }

  thead th:first-child {
    border-top-left-radius: 5px;
  }

  thead th:last-child {
    border-top-right-radius: 5px;
  }

  tbody tr:last-child td:first-child {
    border-bottom-left-radius: 5px;
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: 5px;
  }

  tbody tr:hover td{
    background-color: #ddd;
  } */
</style>
