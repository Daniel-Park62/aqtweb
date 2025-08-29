<script>
  import DetailTR from "./DetailTR.svelte";

  const columns = [
    {
      key: "id",
      title: "ID",
    },
    {
      key: "stime",
      title: "송신시간",
    },
    {
      key: "elapsed",
      title: "시간",
    },
    {
      key: "method",
      title: "Method",
    },
    {
      key: "uri",
      title: "URI",
    },
    {
      key: "rlen",
      title: "Len",
    },
    {
      key: "rdata",
      title: "수신데이터",
    },
    {
      key: "port",
      title: "Port",
    },
  ];
  let vid = "none";
  let pid;
  let parr = [];
  let pidx = 0;
  let origin = 'org';
  export let tcode = "";
  let conds = {
    tcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
  };

  let sv_row ;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
  }

  //  let rdata = Promise.resolve([]);
  let rdata = [];

  let pg = conds.page + 1;

  $: if (tcode ) {
    conds.page = 0 ;
    getTRlist();
  }
  $: if (conds ) {
    getTRlist();
  }

  let selectedRowIds = [];

  function handleRowClick(event) {
    const rowId = event.detail.row.pkey;
    if (selectedRowIds.includes(rowId)) {
      selectedRowIds = selectedRowIds.filter((id) => id !== rowId);
    } else {
      selectedRowIds = [rowId, ...selectedRowIds].slice(0, 2);
    }
  }
  async function getTRlist() {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    conds.tcode = tcode;
    if (conds.tcode == undefined) return [];
    pg = conds.page + 1;

    const res = await fetch("/tloaddata", {
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

</script>

<div class="container">

  <div class="fitem tbl">
    <table>
      <thead>
        <tr>
          {#each columns as column}
            <th>
              {column.title}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <!-- {#await rdata}
          <p>...waiting</p>
        {:then rows} -->
        {#each rdata as row, i (row.pkey)}
          <tr
            class={row.sflag}
            on:dblclick={(e) => {
              pid = row.pkey;
              parr = rdata.map(e => e.pkey) ;
              pidx = i ;
              vid = "block";
              clickRow(e,row);
            }}
          >
            <td class="id"><strong><em>{row.pkey}</em></strong></td>
            <td class="stime">{row.stime}</td>
            <td style="text-align:right" class="elapsed">{row.elapsed}</td>
            <td class="method">{row.method === null ? "" : row.method}</td>
            <td class="uri">{row.uri}</td>
            <td style="text-align:right" class="rlen"
              >{row.rlen.toLocaleString("ko-KR")}</td
            >
            <td class="rdata">{row.수신데이터 === null ? "" : row.rdata}</td>
            <td class="dstport">{row.dstport}</td>

          </tr>
        {/each}
        <!-- {:catch err}
          <p style="color: red">{err.message}</p>
        {/await} -->
      </tbody>
    </table>
  </div>
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
  </div>

</div>
<DetailTR bind:vid bind:pid bind:parr bind:pidx bind:origin />

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: hidden;
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
    flex: 1;
    width: auto ;
  }
  thead {
    background-color: rgb(209, 165, 69);
  }
</style>
