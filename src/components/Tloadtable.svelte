<script>

  import DetailTR from "../lib/DetailTR.svelte";

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
  <div class="flex items-center gap-2 m-2 p-2 shadow ">
    <span class="number-in">
      Page <input
        type="number"
        min="1"
        style="text-align:center;"
        bind:value={pg}
        onchange={() => {
          conds.page = pg - 1;
        }}
      />
      Page크기 <input
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
  <div class="h-[85vh] w-full overflow-y-auto [scrollbar-gutter:stable]">
    <table class="w-[98%] table-fixed">
      <thead>
        <tr>
          <th class="w-24">ID</th>
          <th class="w-36 ">송신시간</th>
          <th class="w-16">소요시간</th>
          <th class="w-16">Method</th>
          <th>URI</th>
          <th class="w-14">크기</th>
          <th class="w-[40%]">응답데이터</th>
          <th class="w-14">Port</th>
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
            <td class="break-all">{row.stime}</td>
            <td class="text-right">{row.elapsed}</td>
            <td class="method">{row.method === null ? "" : row.method}</td>
            <td class="uri">{row.uri}</td>
            <td class="text-right"
              >{row.rlen.toLocaleString("ko-KR")}</td
            >
            <td class="rdata text-left">{row.수신데이터 === null ? "" : row.rdata}</td>
            <td>{row.dstport}</td>

          </tr>
        {/each}

        {/await} 
      </tbody>
    </table>
  </div>

</div>
<DetailTR bind:vid pid={pid} parr={parr} bind:pidx origin="org"/>

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
