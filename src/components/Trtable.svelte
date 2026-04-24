<script lang="ts">
  import { authApps, userid } from "../aqtstore.js";
  import DetailTR from "../lib/DetailTR.svelte";
  import { onMount, tick } from "svelte";

  const columns = [
    "ID",
    "송신시간",
    "소요시간",
    "Method",
    "URI",
    "Status",
    "수신크기",
    "수신데이터",
    "Port",
    "APID",
    "",
    "",
  ];
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
    task: "",
    apps: ""
  }) } = $props();

  let sortby = $state("")
  let rdata = $state([]);
  let pg = $derived(conds.page + 1);

  async function reSend() {
    const datas = rdata
      .filter((r) => r.chk)
      .map((r) => {
        return [r.pkey, r.id, r.tid, $userid];
      });
      if (datas.length === 0) {
        alert("선택된 자료가 없습니다.") ;
        return ;
      }
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

  onMount( () => {
    fetch("/trlist/config")
    .then( res =>  res.json())
    .then( r => {
      if (r.col1) columns[10] = r.col1;
      if (r.col2) columns[11] = r.col2;
      // console.log(r, columns);
    }) 
    .catch( err => console.error(err)) ;
    // promise = Promise.resolve(tcodelist) ;
  });
  let loading = false;

  async function getTRlist() {
    if (loading) return ;
    loading = true ;

    // pg = conds.page + 1;
    conds.apps = $authApps;
    conds.sortby = sortby ?? '';
    document.body.style.cursor = "wait";
    rdata=[];
    await tick() ;
    try {
      const res = await fetch("/trlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conds),
      });
      if (res.ok) {
        rdata = await res.json();
        // console.log("trlist end", rdata) ;
      } else {
        throw new Error(res.statusText);
      }
    } catch(err) {
      alert("데이터 조회 중 오류가 발생했습니다: " + err.message);
    } finally {
      document.body.style.cursor = "default";
      loading = false ;
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
  
  $effect(() => {
  
    if (conds.tcode > " ") {
      getTRlist();
    }
  });

</script>
<main class="flex flex-col h-full w-full border-0">
<div class="flex-none bg-slate-200 pgset">
  <span class="number-in">
    Page :<input
      type="number"
      min="1"
      style="text-align:center;"
      bind:value={pg}
      onchange={() => {
        conds.page = pg - 1;
        conds = { ...conds } ;
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
      conds = { ...conds } ;
    }}
  >
    Next &gt;</button
  >
  {#if pg > 1}
    <button
      onclick={() => {
        conds.page--;
        conds = { ...conds } ;
      }}
    >
      &lt; Prev
    </button>
  {/if}
  <span> 정렬 : <input onkeyup={(e) => {if(e.key == 'Enter') getTRlist()}} placeholder="o_stime" class="w-[20rem]" type="text" bind:value={sortby} /></span>
  <div style="margin-left: auto">
    <button onclick={reSend}>재전송</button>
    <button class="btn-excel" onclick={getDownLoad}>CSV</button>
  </div>
</div>
<div class="flex-[1_1_0] h-full w-full overflow-y-auto [scrollbar-gutter:stable] p-2 ">
  <table class="max-w-[98%]">
    <thead>
      <tr>
        <th class="w-10"><input type="checkbox" onchange={
          (e) => {
            for(let i=0; i < rdata.length; ++i) {
                rdata[i].chk = e.target.checked ;
            }
          }
        }></th>
      <th>ID</th>
      <th>송신시간</th>
      <th>소요시간</th>
      <th>Method</th>
      <th>URI</th>
      <th>Status</th>
      <th>응답크기</th>
      <th>응답데이터</th>
      <th>port</th>
      <th>APID</th>
      <th></th>
      </tr>
    </thead>
    <tbody>
      {#await rdata}
      <tr><td>Waiting... </td></tr>
      {:then rows}  
      {#each rows as row , i (row.pkey)}
        <tr tabindex="0"
          class={row.sflag}
          onclick={(e)=>{pidx = i ; pid = row.pkey ;} }
          ondblclick={(e) => {
            vid = "block";
            pidx = i ;
            parr = rows.map( k => k.pkey ) ;
            pid = row.pkey ;
          }}
        >

          <td class="text-center "><input class="chkb" type="checkbox" bind:checked={row.chk} /></td>
          <td class="cmpid"><strong><em>{row.pkey}</em></strong></td>
          <td class="stime">{row.송신시간}</td>
          <td style="text-align:right" class="elapsed">{row.소요시간}</td>
          <td class="method">{row.method === null ? "" : row.method}</td>
          <td class="w-[10em]">{row.uri}</td>
          <td class="rcode">{row.status}</td>
          <td style="text-align:right" class="rlen"
            >{row.수신크기.toLocaleString("ko-KR")}</td
          >
          <td class="rhead">{row.수신데이터 === null ? "" : row.수신데이터}</td>
          <td class="dstport">{row.dstport}</td>
          <td class="appid">{row.appid}</td>
          {#if row.col1}<td class="w-16">{row.col1}</td>{/if}
        </tr>
      {/each}
      {:catch err}
          <template style="color: red">{err.message}</template>
      {/await}
    </tbody>
  </table>
</div>
</main>
<DetailTR bind:vid pid={pid} parr={parr} bind:pidx />

<style>
  .elapsed,
  .rlen,
  .rcode,
  .method,
  .dstport,
  .appid {
    width: 5em;
  }
  .cmpid {
    width: 6em;
  }
  .stime {
    width: 14em;
  }
  .rhead,
  .uri {
    text-align: left;
  }

  .pgset {
    @apply flex items-baseline justify-start rounded
  }
  .pgset * {
    margin: 2px 4px;
    padding: 2px 3px;
    /* height: 1.7rem; */
  }

  .number-in input {
    max-width: 60px;
    text-align: center;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

</style>
