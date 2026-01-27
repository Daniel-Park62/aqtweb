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
  let sv_row ;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
  }
    
  $:  getDetail(tcode);
  
  const sortBy = { col: "", ascending: 1 };

  function sortdata(e) {
      if (sortBy.col == e.target.id) {
        sortBy.direction = sortBy.direction * -1;
      } else {
        sortBy.col = e.target.id;
        sortBy.direction = 1;
        if (sortBy.old) sortBy.old.textContent = sortBy.old.textContent.replace(/ [△▽]/,'') ;
      }
      e.target.textContent = e.target.textContent.replace(/ [△▽]/,'') ;
      e.target.textContent += sortBy.direction == 1 ? ' △': ' ▽' ;
      sortBy.old = e.target ;
      let usort = (a, b) =>
        a[e.target.id] < b[e.target.id] 
          ? -1 * sortBy.direction
          : a[e.target.id] > b[e.target.id]
          ? 1 * sortBy.direction
          : 0;
      dtls = dtls.sort(usort);
    };
  
  async function getDetail(c) {
    // const res = await fetch("/bytcode?tcode=" + c);
    if (sv_row) sv_row.classList.remove("bg-teal-100");
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
        <tr>
          <th rowspan="2" class="cursor-pointer" id="svcid" on:click={sortdata}>서비스ID</th>
          <th rowspan="2" class="cursor-pointer" id="svckor" on:click={sortdata}>서비스명</th>
          <th rowspan="2" class="cursor-pointer" id="cumcnt" on:click={sortdata}>누적건수</th>
          <th rowspan="2" class="cursor-pointer" id="tcnt" on:click={sortdata}>패킷건수</th>
          <th colspan="4" >TOBE</th>
          <th colspan="2" >ASIS</th>
          <th colspan="2" >차이비교</th>
        </tr>
        <tr >
          <th>성공건수</th>
          <th>실패건수</th>
          <th>평균시간</th>
          <th>표준편차</th>
          <th>평균시간</th>
          <th>표준편차</th>
          <th>평균차이</th>
          <th>편차차이</th>
        </tr>
      </thead>
      <tbody>
        <!-- {#await promise}
          <p>...waiting</p>
        {:then rows} -->
          {#each dtls as row}
            <tr on:click={(e)=>clickRow(e,row)} on:dblclick={() => {conds.tcode=tcode;conds.page=0; conds.uri=row.svcid; getModal().open() }}>
              <td style="text-align:left; max-width:30%">{row.svcid}</td>
              <td style="text-align:left">{row.svckor}</td>
              <td>{row.cumcnt.toLocaleString("ko-KR")}</td>
              <td>{row.tcnt.toLocaleString("ko-KR")}</td>
              <td>{row.scnt.toLocaleString("ko-KR")}</td>
              <td>{row.fcnt.toLocaleString("ko-KR")}</td>
              <td>{row.avgt}</td>
              <td>{row.stdv}</td>
              <td class="bg-gray-100">{row.o_avgt}</td>
              <td class="bg-gray-100">{row.o_stdv}</td>
              <td class={row.avgt > row.o_avgt ? "text-red-800": "text-blue-800"}>{(row.avgt - row.o_avgt).toLocaleString("ko-KR") }</td>
              <td>{row.stdv - row.o_stdv }</td>
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
  tbody td {
    text-align: right;
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
