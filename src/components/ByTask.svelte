<script>
  import { getLvlnm } from "./Common.svelte";
  import TaskList from "./TaskList.svelte";
  import Trtable from "./Trtable.svelte";
  import Modal,{getModal} from "./Modal.svelte";

  let conds = {
    tcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    task:""
  };

  let task, lvl ,ischg = 0;
  let dtls = [];
  let promise = Promise.resolve([]);

  let sortBy = { col: "svcid", ascending: true };

  $: if(ischg) promise = getDetail(task,lvl);

  $: sort = (column) => {
    if (sortBy.col == column) {
      sortBy.ascending = !sortBy.ascending;
    } else {
      sortBy.col = column;
      sortBy.ascending = true;
    }

    // Modifier to sorting function for ascending or descending
    let sortModifier = sortBy.ascending ? 1 : -1;

    let sort = (a, b) =>
      a[column] < b[column]
        ? -1 * sortModifier
        : a[column] > b[column]
        ? 1 * sortModifier
        : 0;

    dtls = dtls.sort(sort);
    promise = Promise.resolve(dtls);
  };
  // onMount(async () => {
  //   promise = getDatas() ;
  //  }) ;
  async function getDetail(t,l) {
    if (t == '') t = 'EMPTY'
    const res = await fetch("/bytask/" + t + '/' + l);
    if (res.ok)
      return await res.json();
    else
      throw new Error(res.statusText);
  }
</script>

<div class="main">
  <div class="dashboard">
    <TaskList bind:task bind:lvl bind:ischg />
  </div>
  <div class="sub-tit">
    서비스별 현황({task != '' ? task + ' : ' :''} {getLvlnm(lvl)})
  </div>
  <div class="bottom">
    <table class="tbl-svc">
      <thead>
        <tr>
          <th on:click={sort("svcid")}>서비스ID</th>
          <th on:click={sort("svckor")}>서비스명</th>
          <th on:click={sort("cumcnt")}>누적건수</th>
          <th on:click={sort("tcnt")}>패킷건수</th>
          <th on:click={sort("avgt")}>평균시간</th>
          <th on:click={sort("scnt")}>성공건수</th>
          <th on:click={sort("fcnt")}>실패건수</th>
          <th on:click={sort("tcode")}>테스트ID</th>
        </tr>
      </thead>
      <tbody>
        {#await promise}
          <p>...waiting</p>
        {:then rows}
          {#each rows as row}
            <tr on:dblclick={()=> { conds.tcode=row.tcode; conds.uri=row.svcid;conds.task=task; getModal().open() }}>
              <td style="max-width:30%">{row.svcid}</td>
              <td>{row.svckor}</td>
              <td align="right">{row.cumcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.tcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.avgt}</td>
              <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.fcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.tcode}</td>
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
	<Trtable bind:conds/>
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
</style>
