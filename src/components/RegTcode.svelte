<script>
  import { onMount } from "svelte";
  import { gtcode,userid } from "../aqtstore";
  import {
    getLvlnm,
    getLvls,
    getTypenm,
    getTypes,
    getPros,
    getProNm,
    getAppid
  } from "./Common.svelte";
  import Modal, { getModal } from "./Modal.svelte";
  import CopyTr from "./CopyTr.svelte";
  const appids = [] ;
  let rdata = Promise.resolve([]);
  let tcode;
  let jobnm = "등록";
  let copytr = "copytr";
  let curRow = {};
  let encv = false;
  let lvl,
    ttype,
    desc1,
    cmpCode = "",
    tdate,
    endDate,
    tdir = null,
    tuser = null,
    thost,
    tport,
    tenv = "",
    pro = "0";
  const columns = [
    " ",
    "테스트Id",
    "테스트명",
    "APPID",
    "단계",
    "테스트시작일",
    "종료일",
    "대상서버",
    "대상Port",
    "전문구분",
    "encode",
    "데이터건수",
  ];


  function updTcode() {
    fetch("/tmaster", {
      method: jobnm === "등록" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: curRow.code.toUpperCase(),
        lvl: curRow.lvl,
        appid: curRow.appid,
        desc1: curRow.desc1,
        cmpCode: curRow.cmpCode,
        tdate: curRow.tdate,
        endDate: curRow.endDate,
        thost: curRow.thost ?? "",
        tport: curRow.tport ?? 0,
        tenv: encv ? "euc-kr" : "",
        tdir: curRow.tdir ?? "",
        pro: curRow.pro ?? "0",
        tuser: curRow.tuser ?? "",
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
        if (res.status < 300) {
          getModal().close();
          getdata();
        }
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  function eraseTr() {
    let codes = rdata.filter((r) => r.chk).map((r) => r.code);

    if (codes.length == 0) return;
    if ( ! confirm( codes + " 전문삭제 진행할까요? ") ) return ;
    fetch("/tmaster/erasetr", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codes: codes,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        if (res.status < 400) {
          alert("정상 삭제되었습니다 \n" + Object.entries(rmsg));
          getdata();
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  function delTcode() {
    const delcodes = rdata.filter((r) => r.chk).map((r) => r.code);

    if (delcodes.length == 0) return;
    if (! confirm( delcodes + " 삭제하시겠습니까?") ) return ;
    // console.log("del code:", delcodes) ;
    fetch("/tmaster", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codes: delcodes,
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
    const res = await fetch("/tmaster");
    if (res.status <= 300) {
      rdata = await res.json();
    } else {
      throw new Error(res.statusText);
    }
  }

  onMount( getdata );
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
  <button
    on:click={() => {
      (jobnm = "등록"),
        (curRow.code = ""),
        (curRow.type = "1"),
        (curRow.lvl = "1"),
        (curRow.endDate = null),
        (curRow.cmpCode = null),
        (curRow.tdate = new Date().toISOString().slice(0, 10));
      getModal().open(undefined, "50", "70");
    }}>신규등록</button
  >
  <button on:click={delTcode}>선택삭제</button>
  <button
    on:click={() => {
      gtcode.update((v) => curRow.code);
      getModal(copytr).open(null, "60", "60");
    }}>전문생성</button
  >
  <button on:click={eraseTr}>전문삭제</button>
</div>
<hr />
<div class="tmasterList">
  <table>
    <thead>
      <tr>
        {#each columns as column}
          <th>
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#await rdata}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row (row.code)}
          <tr
            class={row.type}
            on:click={() => (curRow = row)}
            on:dblclick={() => {
              // copyRow(row) ;
              curRow = row;
              encv = curRow.tenv === "euc-kr";
              jobnm = "수정";
              getModal().open({}, "50", "70");
            }}
          >
            <td><input type="checkbox" bind:checked={row.chk} /></td>
            <td class="tcode"><strong>{row.code}</strong></td>
            <td class="desc1" style="width:10rem">{row.desc1}</td>
            <td class="appid">{row.appid}</td>
            <td class="lvl">{getLvlnm(row.lvl)}</td>
            <td class="tdate">{row.tdate}</td>
            <td class="endDate">{row.endDate === null ? "" : row.endDate}</td>
            <td class="thost">{row.thost}</td>
            <td class="tport">{row.tport}</td>
            <td class="pro">{getProNm(row.pro)}</td>
            <td class="tenv">{row.tenv}</td>
            <td class="cnt" style="text-align:right"
              >{row.data_cnt.toLocaleString("ko-KR")}</td
            >
            {#if curRow === row}
              <td>◀</td>
            {/if}
          </tr>
        {/each}
      {:catch err}
        <p style="color: red">{err.message}</p>
      {/await}
    </tbody>
  </table>
</div>
<Modal>
  <h2>{jobnm != "등록" ? curRow.code : ""} 테스트코드 {jobnm}</h2>
  <div class="items">
    <div class="item in_label">테스트코드:</div>
    <div>
      <input
        class="item in_value"
        pattern="[A-Z0-9]{(3, 6)}"
        bind:value={curRow.code}
      />
    </div>
    <div class="item in_label">테스트명:</div>
    <div><input class="item in_value" bind:value={curRow.desc1} /></div>
    <div class="item in_label">APPID:</div>
    <div>    <select     class="item in_value"     bind:value={curRow.appid}>
      {#each getAppid() as r}
          <option value={r.value}>
            {r.name}
          </option>
        {/each}
             </select>
    </div>
    <div class="item in_label">단계:</div>
    <div>
      <select class="item in_value" bind:value={curRow.lvl}>
        {#each Object.entries(getLvls()) as [key, value], index (key)}
          <option value={key}>{value}</option>
        {/each}
      </select>
    </div>
    <div class="item in_label">테스트시작일:</div>
    <div>
      <input class="item in_value" type="date" bind:value={curRow.tdate} />
    </div>
    <div class="item in_label">대상서버:</div>
    <div><input class="item in_value" bind:value={curRow.thost} /></div>
    <div class="item in_label">대상Port:</div>
    <div>
      <input
        class="item in_value"
        type="number"
        min="2"
        max="65535"
        bind:value={curRow.tport}
      />
    </div>
    <div class="item in_label">전문구분:</div>
    <div>
      <select class="item in_value" bind:value={curRow.pro}>
        {#each Object.entries(getPros()) as [key, value], index (key)}
          <option value={key}>{value}</option>
        {/each}
      </select>
    </div>
    <label class="item in_label">
      <input type="checkbox" bind:checked={encv} />
      EUC-KR
    </label>
  </div>
  <hr />
  <div>
    <button on:click={updTcode}>저장</button>
    <button on:click={() => getModal().close()}>닫기</button>
  </div>
</Modal>
<Modal bind:id={copytr}>
  <CopyTr tlist={rdata} on:click={() => getModal(copytr).close()} />
</Modal>

<style>
  .items {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: 10px 20px;
    align-content: start;
  }

  .item {
    vertical-align: text-bottom;
  }

  .in_value {
    border: 1px solid silver;
    border-radius: 5px;
  }
  .in_label {
    text-align: end;
  }

  .tmasterList {
    max-height: 80vh;
    overflow-y: auto;
  }
</style>
