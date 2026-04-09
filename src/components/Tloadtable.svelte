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
  let vid = $state("none");
  let pid = $state(0);
  let parr = $state([]);
  let pidx = $state(0);
  /** @type {{tcode?: string}} */
  let { tcode = "" } = $props();
  let conds = $state({
    tcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
  });

  let sv_row ;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
  }

  //  let rdata = Promise.resolve([]);
  let rdata = $state([]);

  let pg = $derived(conds.page + 1);


  let selectedRowIds = [];

  function handleRowClick(event) {
    const rowId = event.detail.row.pkey;
    if (selectedRowIds.includes(rowId)) {
      selectedRowIds = selectedRowIds.filter((id) => id !== rowId);
    } else {
      selectedRowIds = [rowId, ...selectedRowIds].slice(0, 2);
    }
  }
  let loading = false;
  async function getTRlist() {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    if (conds.tcode !== tcode) conds.page = 0;
    conds.tcode = tcode;
    if (conds.tcode == undefined) return [];
    if (loading) return ;
    loading = true ;
    // pg = conds.page + 1;
    rdata=[];
    // await tick() ;
    try {
      document.body.style.cursor = "wait";
      const res = await fetch("/tloaddata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conds),
      });
      if (res.ok) {
        rdata = await res.json();
      } else {
        throw new Error(res.statusText);
      }
    } catch(err) {
      alert("데이터 조회 중 오류가 발생했습니다: " + err.message);
    } finally {
      loading = false ;
      document.body.style.cursor = "default";
    }

  }

  $effect(() => { if (pg) getTRlist() } );

</script>

<div class="container">
  <div class="fitem pgset">
    <span class="number-in">
      Page :<input
        type="number"
        min="1"
        style="text-align:center;"
        bind:value={pg}
        onchange={() => {
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
      onclick={() => {
        conds.page++;
      }}
    >
      Next &gt;</button
    >
    {#if pg > 1}
      <button
        onclick={() => {
          conds.page--;
        }}
      >
        &lt; Prev

      </button>
    {/if}
  </div>
  <div class="fitem tbl h-full">
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
        {#await rdata}
          <template>...조회중</template>
        {:then rows} 
        {#each rows as row, i (row.pkey)}
          <tr
            class={row.sflag}
            ondblclick={(e) => {
              pid = row.pkey;
              parr = rows.map(e => e.pkey) ;
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

        {/await} 
      </tbody>
    </table>
  </div>

</div>
<DetailTR bind:vid pid={pid} parr={parr} pidx={pidx} origin="org"/>

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
