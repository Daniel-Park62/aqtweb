<!-- 모의서버 관리 tmocksvr 테이블 등록 -->
<script>
  import { tick } from "svelte";
  const statusnm = { 0: "준비", 1: "실행중", 2: "오류"};
  let selkind=0;
  let rcnt = 0 ;
  const cols = {
    chk: true,
    pkey: 0,
    svrnm: "",
    svrkind: 0,
    status: 0,
    portno: 9988,
    allowip: "",
    srcnm: "tcpsvr",
  };
  let rdata = [{...cols}];
  let newRow = { ...cols };
  const columns = [
    " ",
    "APID ",
    "서비스(URI)",
    "서비스명(한글)",
    "서비스명(영문)",
    "업무명",
    "담당자",
    "서비스종류",
  ];
  const conds = {
    appid: "",
    svcid: "",
  };

  let sv_row;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
//    curRow = row;
  }

  function updService() {
    const upds = rdata
      .filter((r) => r.chk && r.pkey != 0)
      .map((r) => {
        delete r.chk;
        return r;
      });
    const inss = rdata
      .filter((r) => r.chk && r.pkey == 0)
      .map((r) => {
        delete r.chk;
        delete r.pkey;
        return r;
      });
    // console.log(inss)     ;
    fetch("/tservice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upd: upds,
        ins: inss,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
        if (res.status < 300) {
          getdata();
        }
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  function delService() {
    const delcodes = rdata
      .filter((r) => r.chk && r.pkey > 0)
      .map((r) => r.pkey);

    if (delcodes.length == 0) return;
    // console.log("del code:", delcodes) ;
    fetch("/tservice", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkeys: delcodes,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        if (res.status < 400) {
          alert("정상 삭제되었습니다");
          getdata();
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  async function getdata() {
    //    const res = await fetch("/tservice");
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    const res = await fetch("/tservice/part", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.status === 200) {
      const rows = await res.json();
      rcnt = rows.length ;
      rdata = rows.map((r) => {
        r.chk = 0;
        return r;
      });
    } else {
      throw new Error(res.statusText);
    }
  }

  let tblbody ;
  async function addRow() {
      cols.portno++ ;
      rdata = [...rdata,{...cols} ] ;
      await tick() ;
      if (sv_row) sv_row.classList.remove("bg-teal-100");
      if (tblbody) {
        const lastRow = tblbody.lastElementChild;

        await lastRow.click() ;
        lastRow.focus();
        // 필요 시 스크롤 이동
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }

</script>

<div id="btns" class="flex">
  <button
    on:click={addRow}>추가</button >
  <button on:click={delService}>선택삭제</button>
  <button on:click={updService}>적용</button>
  <button class="mr-auto" on:click={getdata}>적용취소</button>
  <button on:click={getdata}>조회</button>
  <span>{rcnt > 0 ? rcnt.toLocaleString('ko-KR') + ' 건' : ' '}</span>
</div>
<hr />
<div class="tList">
  <table class="border-collapse">
    <thead>
      <tr>
          <th></th>
          <th>서버명</th>
          <th>종류</th>
          <th>Port</th>
          <th>허용ip</th>
          <th>연관소스</th>
          <th>상태</th>
          <th></th>
      </tr>
    </thead>
    <tbody bind:this={tblbody}>
      {#await rdata}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row, ix}
          <tr >
            <td><input type="checkbox" bind:checked={row.chk} /></td>
            <td tabindex="0"
              contenteditable="true"
              class="svcnm w-[25%]"
              bind:textContent={row.svrnm}
            />
            <td class="flex gap-4 items-center">
              <label class="m-0 p-0"><input type="radio" name={ix.toString()} bind:group={row.svrkind} value={0} /> TCP</label>
              <label class="m-0 p-0"><input type="radio" name={ix.toString()} bind:group={row.svrkind} value={1} /> HTTP</label>
            </td>
            <td class="p-0 w-[4em]"><input class="my-0 bg-transparent border-none" type=number bind:value={row.portno} max=65535></td>
            <td
              contenteditable="true"
              class="allowip w-[25%]"
              bind:textContent={row.allowip}
            />
            <td
              contenteditable="false"
              class="srcnm"
              bind:textContent={row.srcnm}
            />
            <td>{statusnm[row.status]}  </td>
            <td>
              <button on:click={() => row.status=1 } class="px-4 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition">
              {row.status ? '중지' : '시작'}
              </button> 
            </td>
          </tr>
        {/each}
      {:catch err}
        <p style="color: red">{err.message}</p>
      {/await}
    </tbody>
  </table>
</div>

<style>
  .tList {
    max-height: 80vh;
    overflow: auto;
  }

  #btns * {
    margin: 2px 4px;
    padding: 0 8px;
    height: 1.8em;
  }

  button {
    width: 6em;
  }

</style>
