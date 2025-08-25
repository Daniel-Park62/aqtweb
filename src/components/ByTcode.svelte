<script>
  import { onMount, getContext } from "svelte";
  import TidList from "./TidList.svelte";
  import Trtable from "./Trtable.svelte";
  import Modal,{getModal} from "./Modal.svelte";

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

  let tcode = "";
  let dtls = [];
  let promise = Promise.resolve([]);
  
  let sortBy = { col: "svcid", ascending: true };

  $: tcode, promise = getDetail(tcode);

  $: sort = (column) => {
    if (sortBy.col == column) {
      sortBy.ascending = !sortBy.ascending;
    } else {
      sortBy.col = column;
      sortBy.ascending = true;
    }

    // Modifier to sorting function for ascending or descending
    let sortModifier = sortBy.ascending ? 1 : -1;

    let usort = (a, b) =>
      a[column] < b[column]
        ? -1 * sortModifier
        : a[column] > b[column]
        ? 1 * sortModifier
        : 0;

    dtls = dtls.sort(usort);
    promise = Promise.resolve(dtls);
  };
  // onMount(async () => {
  //   promise = getDatas() ;
  //  }) ;
  async function getDetail(c) {
    // const res = await fetch("/bytcode?tcode=" + c);
    const res = await fetch("/byservice" ,
      { method : 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify({tcode: c})
     }
    );

    dtls = await res.json();
    return dtls;
  }
</script>

<div class="main">
  <div class="dashboard">
    <TidList bind:tcode />
  </div>
  <div class="sub-tit">
    서비스별 현황({tcode})
  </div>
  <div class="bottom">
    <table class="tbl-svc">
      <thead>
        <tr >
          <th on:click={() => sort("svcid")}>서비스ID</th>
          <th on:click={() => sort("svckor")}>서비스명</th>
          <th on:click={() => sort("cumcnt")}>누적건수</th>
          <th on:click={() => sort("tcnt")}>패킷건수</th>
          <th on:click={() => sort("avgt")}>평균시간</th>
          <th on:click={() => sort("scnt")}>성공건수</th>
          <th on:click={() => sort("fcnt")}>실패건수</th>
        </tr>
      </thead>
      <tbody>
        {#await promise}
          <p>...waiting</p>
        {:then rows}
          {#each rows as row}
            <tr on:dblclick={()=> { conds.tcode=tcode;conds.page=0; conds.uri=row.svcid; getModal().open() }}        >
              <td style="max-width:30%">{row.svcid}</td>
              <td>{row.svckor}</td>
              <td align="right">{row.cumcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.tcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.avgt}</td>
              <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.fcnt.toLocaleString("ko-KR")}</td>
            </tr>
          {/each}
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      </tbody>
    </table>
  </div>
</div>
<Modal>
	<Trtable bind:conds />
</Modal>

<style>
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .dashboard {
    height: 30vh;
    overflow-y: auto;
  }
  .sub-tit {
    text-align: justify;
    background-color: rgb(235, 241, 243);
    margin-top: 25px;
    color: darkblue;
    font-size: 1.5rem;
    height: 40px;
  }

  .bottom {
    flex: 1 1 0;
    overflow: auto;
  }

  /*
  .tbl-svc {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    height: auto;
  }
  
  .tbl-svc td,
  .tbl-svc th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
    max-width: 20%;
  }

  .tbl-svc th {
    position: sticky;
    top: 0px;
    text-align: center;
  }

  .tbl-svc thead {
    height: 1.2em;
  }
  .tbl-svc tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .tbl-svc tr:hover {
    background-color: #ddd;
  }
    */
</style>
