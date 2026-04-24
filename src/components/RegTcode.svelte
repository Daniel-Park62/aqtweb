<script>
  import { onMount } from "svelte";
  import { gtcode,userid } from "../aqtstore";
  import {
    getLvlnm,
    getLvls,
    getPros,
    getProNm,
    getAppid,
  } from "../lib/Common.svelte";
  import Modal from "../lib/Modal2.svelte";
  import CopyTr from "../lib/CopyTr.svelte";
  let rdata = $state(Promise.resolve([]));
  let tcode;
  let jobnm = $state("등록");
  let copytr = $state("copytr");
  let curRow = $state({});
  let encv = $state(false);

  let showModal = $state(false);
  let showModal2 = $state(false);

  function updTcode() {
    fetch("/tmaster", {
      method: jobnm === "등록" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tcode: curRow.tcode.toUpperCase(),
        lvl: curRow.lvl,
        appid: curRow.appid,
        desc1: curRow.desc1,
        tdate: curRow.tdate,
        endDate: curRow.endDate,
        thost: curRow.thost ?? "",
        tport: curRow.tport ?? 0,
        encval: encv ? "euc-kr" : "",
        tdir: curRow.tdir ?? "",
        pro: curRow.pro ?? "0",
        tuser: curRow.tuser ?? "",
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

  function eraseTr() {
    let codes = rdata.filter((r) => r.chk).map((r) => r.tcode);

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
    const delcodes = rdata.filter((r) => r.chk).map((r) => r.tcode);

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
<main class="h-full w-full box-border">
<div class="flex justify-start gap-2 m-2 p-2 shadow">
  <button
    onclick={() => {
      (jobnm = "등록"),
        (curRow.tcode = ""),
        (curRow.type = "1"),
        (curRow.lvl = "1"),
        (curRow.endDate = null),
        (curRow.tdate = new Date().toISOString().slice(0, 10));
        showModal = true;
    }}>신규등록</button
  >
  <button class="btn-delete" onclick={delTcode}>선택삭제</button>
  <button
    onclick={() => {
      gtcode.update((v) => curRow.tcode);
      showModal2 = true;
    }}>전문생성</button
  >
  <button class="btn-delete" onclick={eraseTr}>전문삭제</button>
</div>

<div class="h-[calc(100%-40px)] w-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
  <table>
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>테스트Id</th>
        <th>테스트명</th>
        <th>APPID</th> 
        <th>단계  </th>
        <th>테스트시작일</th>
        <th>종료일</th>
        <th>대상서버</th>
        <th>대상Port</th>
        <th>전문구분</th>
        <th>encode</th>
        <th>데이터건수</th>
      </tr>
    </thead>
    <tbody>
      {#await rdata}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row (row.tcode)}
          <tr
            onclick={(e) => curRow = row}
            ondblclick={() => {
              // copyRow(row) ;
              curRow = row;
              encv = curRow.encval === "euc-kr";
              jobnm = "수정";
              showModal = true;
            }}
          >
            <td><input type="checkbox" bind:checked={row.chk} /></td>
            <td class="tcode"><strong>{row.tcode}</strong></td>
            <td class="desc1" style="width:10rem">{row.desc1}</td>
            <td class="appid">{row.appid}</td>
            <td class="lvl">{getLvlnm(row.lvl)}</td>
            <td class="tdate">{row.tdate}</td>
            <td class="endDate">{row.endDate === null ? "" : row.endDate}</td>
            <td class="thost">{row.thost}</td>
            <td class="tport">{row.tport}</td>
            <td class="pro">{getProNm(row.pro)}</td>
            <td class="encval">{row.encval}</td>
            <td class="cnt" style="text-align:right"
              >{row.data_cnt.toLocaleString("ko-KR")}</td
            >
          </tr>
        {/each}
      {:catch err}
        <p style="color: red">{err.message}</p>
      {/await}
    </tbody>
  </table>
</div>
</main>
<Modal bind:showModal showcls={false} wd="530px" hd="460px">
  <div class="hero from-amber-100 via-sky-300 to-sky-500 bg-gradient-to-br">
    <h2 class="mx-auto my-5 text-center sm:text-4xl text-3xl text-blue-800 font-bold">{curRow.tcode} 테스트코드 {jobnm}</h2>
    <hr />
    <div class="items p-5">
      <div class="item in_label">테스트코드:</div>
      <div class="text-left">
        <input
          class="item in_value"
          pattern="[A-Z0-9]{3, 6}"
          bind:value={curRow.tcode}
        />
      </div>
      <div class="item in_label">테스트명:</div>
      <div class="text-left"><input class="item in_value" bind:value={curRow.desc1} /></div>
      <div class="item in_label">APPID:</div>
      <div class="text-left">    <select     class="item in_value"     bind:value={curRow.appid}>
        {#each getAppid() as r}
            <option value={r.value}>
              {r.name}
            </option>
          {/each}
               </select>
      </div>
      <div class="item in_label">단계:</div>
      <div class="text-left">
        <select class="item in_value" bind:value={curRow.lvl}>
          {#each Object.entries(getLvls()) as [key, value], index (key)}
            <option value={key}>{value}</option>
          {/each}
        </select>
      </div>
      <div class="item in_label">테스트시작일:</div>
      <div class="text-left">
        <input class="item in_value" type="date" bind:value={curRow.tdate} />
      </div>
      <div class="item in_label">대상서버:</div>
      <div class="text-left"><input class="item in_value" bind:value={curRow.thost} /></div>
      <div class="item in_label">대상Port:</div>
      <div class="text-left">
        <input
          class="item in_value"
          type="number"
          min="2"
          max="65535"
          bind:value={curRow.tport}
        />
      </div>
      <div class="item in_label">전문구분:</div>
      <div class="text-left">
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
    <div class='p-2 gap-2 flex justify-center'>
      <button type="button"  onclick={updTcode}>저장</button>
      <button type="button"  onclick={() => showModal = false}>닫기</button>
    </div>
  </div>
</Modal>
<CopyTr bind:showCopyTr={showModal2} tlist={rdata} />

<style>
  .items {
    display: grid;
    grid-template-columns: 8rem auto;
    gap: 10px 20px;
    /* align-content: start;
    justify-content: stretch; */
  }

  .item {
    vertical-align: text-bottom;
  }
/*   h2 {
    font-size: 18px;
    font-weight: bold;
    color: darkblue;
  } */
  .in_value {
    border: 1px solid silver;
    border-radius: 5px;
    font-size: 14px;
    /* width: 100%; */
  }
  .in_label {
    text-align: end;
  }

</style>
