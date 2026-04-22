<script>
  import { run } from 'svelte/legacy';

  import { authApps, userid } from "../aqtstore.js";
  import DetailTR from "../lib/DetailTR.svelte";

  let vid = $state("none");
  let pid = $state(0);
  let parr = $state([]) ;
  let pidx = $state(0);
  /** @type {{conds?: any}} */
  let { conds = $bindable({
    tcode: "",
    rcode: "",
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    valchk: false,
    valiance: 0,
    apps: "",
  }) } = $props();

  //  let rdata = Promise.resolve([]);
  let rdata = $state([]);

  let sortColumn = null;
  let sortDirection = null;
  let pg = $state(conds.page + 1);


  async function reSend() {
    const datas = rdata
      .filter((r) => r.chk)
      .map((r) => {
        return [r.pkey, r.id, conds.tcode, $userid];
      });
    // console.log(datas) ;
    fetch("/trequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ insdata: datas }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  async function getTRlist() {
    // console.log("entr ...", conds) ;
    if (conds.tcode == undefined) return Promise.resolve([]);
    pg = conds.page + 1;
    conds.apps = $authApps;
    const res = await fetch("/tloaddata/compareData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      rdata=[];
      rdata = await res.json();
      //  console.log("trlist end", rdata) ;
    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res.statusText);
    }
  }

  async function getDownLoad() {
    conds.apps = $authApps;
    const res = await fetch("/tresult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      //      rdata = await res.json();
      const file = await res.blob();
      const downloadUrl = window.URL.createObjectURL(file); // 해당 file을 가리키는 url 생성

      const anchorElement = document.createElement("a");
      document.body.appendChild(anchorElement);
      anchorElement.download = conds.tcode; // a tag에 download 속성을 줘서 클릭할 때 다운로드가 일어날 수 있도록 하기
      anchorElement.href = downloadUrl; // href에 url 달아주기

      anchorElement.click(); // 코드 상으로 클릭을 해줘서 다운로드를 트리거

      document.body.removeChild(anchorElement); // cleanup - 쓰임을 다한 a 태그 삭제
      window.URL.revokeObjectURL(downloadUrl); // cleanup - 쓰임을 다한 url 객체 삭제
    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res.statusText);
    }
  }
  
  $effect( () => {
     if (conds.tcode > " ") {
      getTRlist();
     }

  });
</script>
<main class="h-full w-full flex flex-col overflow-hidden">
<div class="flex-none flex mx-2 p-1 gap-1 shadow">
  <span class="number-in">
    Page <input
      type="number"
      min="1"
      style="text-align:center;"
      bind:value={pg}
      onchange={() => {
        conds.page = pg - 1;
      }}
    />&nbsp;
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
  &nbsp;&nbsp;
    * 소요시간증감값 조건 :<input
      type="checkbox" class="size-[1em] mt-1" 
      bind:checked={conds.valchk}
    />
    <input class="number-in"
      type="number"
      style="text-align:center;"
      bind:value={conds.valiance}
    />이상
  <div style="margin-left: auto">
    <button onclick={reSend}>재전송</button>
    <button class="btn-excel" onclick={getDownLoad}>CSV</button>
  </div>
</div>
<div class="flex-[1_1_0]  w-full overflow-y-auto [scrollbar-gutter:stable] p-2 shadow ">
  <table class="max-w-[98%]">
    <thead>
      <tr>
        <th><input type="checkbox" onchange={
          (e) => {
            for(let i=0; i < rdata.length; ++i) {
                rdata[i].chk = e.target.checked ;
            }
          }
        }></th>
        <th class="w-[5em]">ID</th>
        <th >송신시간</th>
        <th class="class">소요시간</th>
        <th class="class">소요시간(원)</th>
        <th >증감</th>
        <th class="class">응답크기</th>
        <th class="class">응답데이터</th>
        <th class="class">응답데이터(원)</th>
        <th class="w-[10em]">URI</th>
        <th class="class">응답코드</th>
      </tr>
    </thead>
    <tbody>
      <!-- {#await rdata}
        <p>...waiting</p>
      {:then rows} -->
      {#each rdata as row , i (row.pkey)}
        <tr
          ondblclick={() => {
            pid = row.pkey;
            vid = "block";
            pidx = i ;
            parr = rdata.map( k => k.pkey ) ;
          }}
        >

          <td><input type="checkbox" bind:checked={row.chk} /></td>

          <td ><strong>{row.pkey}</strong></td>
          <td class="w-[19ch] wrap-break-word ">{row.송신시간}</td>
          <td class="elapsed text-right">{row.소요시간}</td>
          <td class="elapsed text-right">{row.원소요시간}</td>
          <td class={"w-[5em] " + (row.소요시간 > row.원소요시간 ? " text-red-700" : "text-blue-700")}>{(row.소요시간 - row.원소요시간).toFixed(3)}</td>
          <td class="rlen text-right">{row.수신크기.toLocaleString("ko-KR")}</td>
          <td class={"text-left d"+row.diff} title={row.diff ? "원본의결과와 다름":""}>{row.수신 === null ? "" : row.수신  }</td>
          <td class="text-left">{row.원수신 === null ? "" : row.원수신 }</td>
          <td class="w-[10em] text-left">{row.uri}</td>
          <td class="rcode">{row.rcode}</td>
        </tr>
      {/each}
      <!-- {:catch err}
        <p style="color: red">{err.message}</p>
      {/await} -->
    </tbody>
  </table>
</div>
</main>
<DetailTR bind:vid pid={pid} parr={parr} bind:pidx />

<style>

  .number-in input {
    max-width: 60px;
    text-align: center;
  }

  .d1 {
    background-color: rgb(244,230,230)
  }

  
</style>
