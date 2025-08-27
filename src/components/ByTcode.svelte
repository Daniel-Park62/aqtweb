<script>
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
  let dtls = [];
  let tcode = "";
  // let promise = Promise.resolve([]);
  
  let sortBy = { col: "svcid", ascending: true };

  $:  getDetail(tcode);

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
    // promise = Promise.resolve(dtls);
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

    if (res.ok)
      dtls = await res.json();
    else
      throw new Error(res.statusText);
  }
</script>

<div class="main">
  <div class="tlist">
    <TidList bind:tcode vdisp={false}/>
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
        <!-- {#await promise}
          <p>...waiting</p>
        {:then rows} -->
          {#each dtls as row}
            <tr on:dblclick={() => {conds.tcode=tcode;conds.page=0; conds.uri=row.svcid; getModal().open() }}>
              <td style="max-width:30%">{row.svcid}</td>
              <td>{row.svckor}</td>
              <td align="right">{row.cumcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.tcnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.avgt}</td>
              <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
              <td align="right">{row.fcnt.toLocaleString("ko-KR")}</td>
            </tr>
          {/each}
        <!-- {:catch error}
          <p style="color: red">{error.message}</p>
        {/await} -->
      </tbody>
    </table>
  </div>
  <div class="fff">
    <Modal>
      <Trtable bind:conds />
    </Modal>
  </div>
</div>
<style>
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .tlist {
    height: 30%;
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
</style>
