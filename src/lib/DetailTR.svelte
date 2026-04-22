<!-- @migration-task Error while migrating Svelte code: `<tr>` is invalid inside `<table>` -->
<script lang="ts">
  import { isLogged, userid } from "../aqtstore.js";
  import ParamInput from "./ParamInput.svelte";

  let { vid = $bindable('none'), pidx = $bindable(0), parr = [], pid = 0, 
       origin = "" } = $props() ;
  let modal;
  let cdata = $state([]);
  let odata = $state({ ok: false, display: "none" });

  $effect(() => {
    if (modal) modal.style.display = vid;
  });

  $effect(() => {
    if (pid) getDetail(pid);
  });

  async function reSend(row) {
    fetch("/trequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        insdata: [[row.pkey, row.cmpid, row.tcode, $userid]],
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  async function getDetail(pid) {
    //    const array = new Uint32Array(1);
    // console.log("isLogged:", $isLogged);
    //    const nnn = window.crypto.getRandomValues(array)[0] ;
    let urlv = "/trlist/" + pid; //+ `?v=${nnn}`;
    if (origin) urlv = "/tloaddata/" + pid; // + `?v=${nnn}`

    const res = await fetch(urlv);
    cdata = await res.json();
    odata.ok = false;
    if (document.getElementById("odata")?.style.display == "block")
      getOrig(cdata[0]);
  }

  async function getNext() {
    if (pidx >= parr.length - 1) {
      window.alert("다음자료가 없습니다.");
      return;
    }
    pid = parr[++pidx];
    // await getDetail(parr[++pidx]);
    /* 
    const res = await fetch("/trlist/" + parr[++pidx]);
    if (res.ok) cdata = await res.json();
    else {
      const err = await res.json();
      window.alert(err.message);
    }
    odata.ok = false;
    if (document.getElementById("odata").style.display == "block")
    getOrig(cdata[0]);
    */
  }

  async function getPrev() {
    if (pidx < 1) {
      window.alert("이전자료가 없습니다.");
      return;
    }
    // await getDetail(parr[--pidx]);
    pid = parr[--pidx];

    /*     const res = await fetch("/trlist/" + parr[--pidx]);
    if (res.ok) cdata = await res.json();
    else {
      const err = await res.json();
      window.alert(err.message);
    }
    odata.ok = false;
    if (document.getElementById("odata").style.display == "block")
    getOrig(cdata[0]);
    */
  }

  function closedtl() {
    vid = "none";
    // modal = null ;
  }

  async function viewOrig(row) {
    if (odata.display == "none") {
      odata.display = "block";
      odata.ok = false;
      await getOrig(row);
    } else {
      odata.display = "none";
    }
    const odiv = document.getElementById("odata");
    odiv.style.display = odata.display;
    console.log("viewOrig", odiv.style.display, odata );
  }

  async function getOrig(qdata) {
    let cdata;
    if (!odata.ok) {
      const res = await fetch("/trlist/orig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: qdata.cmpid,
          tcode: qdata.tcode,
          userid: $userid,
        }),
      });

      if (res.ok) cdata = await res.json();
      else {
        const err = await res.json();
        window.alert(err.message);
        return;
      }
      odata.ok = true;
      odata.row = cdata[0];
      
    }
  }

  window.onclick = function (event) {
    // modal = document.getElementById("myModal");
    if (event.target == modal) {
      vid = "none";
    }
  };
 
  function trChange(row) {
    fetch("/trlist/change", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: row.pkey,
        sdata: row.sdata,
        gubun: "sdata",
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }
  function handleReload() {
    window.location.reload(); // Reloads page from server
    getDetail(pid);
  }
  function trRedo(row) {
    fetch("/trlist/redo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: row.pkey,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        await getDetail(pid);
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }
  
  let title=$state("파라미터");
  let params = $state([]) ;
  let showParam = $state(false);
  
  function applyqstr() {
    let pdata = "";
    let gubun:string = "params";
    if (title === "파라미터") { 
      const pp = new URLSearchParams(params) ;
      cdata[0].params = pp.toString() ;
      pdata = pp.toString() ;
    } else {
      gubun = "headers";
      pdata = params.map(([k,v]) => `${k}:${v}`).join("\r\n") ;
      cdata[0].headers = pdata ;
    }

    fetch("/trlist/change", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: pid,
        params: pdata,
        gubun: gubun,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });

  }
  function openHeaders() {
    if (cdata[0] ) {
      title = "헤더";
      if (cdata[0].headers !== null) 
        params = cdata[0].headers.split("\n").filter(l => l.includes(':')).map( l => l.trim().match(/(.*?):(.*)/).slice(1,3) ) || [] ;
      else
        params = [];
      showParam = true;
    } else {
      alert("선택된 행의 헤더 정보가 없습니다.");
    }
  }
  function openParams() {
    if (cdata[0] ) {
      title = "파라미터";
      const pp = new URLSearchParams(cdata[0].params ) || [] ;
      params = Array.from(pp.entries()) ;
      showParam = true;
    } else {
      alert("선택된 행의 파라미터 정보가 없습니다.");
    }
  }
</script>
<ParamInput bind:showModal={showParam} bind:items={params} title={title} pkey={pid} onApply={applyqstr} />

<!-- The Modal -->
<div id="myModal" bind:this={modal} >
  <!-- Modal content -->
  <div class="modal-content">
    {#if cdata.length > 0}
      <div class="ny1">
        <span class="text-[1.2rem] font-bold text-blue-700">{` 전문ID : ${cdata[0].pkey} ( ${cdata[0].cmpid} )`} </span>
        <nav>
          {#if !origin}
            <button onclick={async () => reSend(cdata[0])}>재전송</button>
          {/if}
          <button onclick={async () => getDetail(cdata[0].pkey)}
            >새로고침</button
          >
          <button onclick={async () => getNext()}>다음</button>
          <button onclick={async () => getPrev()}>이전</button>
          {#if !origin}
            <button
              onclick={async () => {
                viewOrig(cdata[0]);
              }}>원본보기</button
            >
          {/if}
          <button class="btn-close" onclick={closedtl}>Close</button>
        </nav>
      </div>

      <div class="data">
        <div class="cdata">
          <table class="m-0 p-0">
            <tbody>
              <tr>
                <td class="lbl">테스트ID</td><td>{cdata[0].tcode}</td>
                <td class="lbl">URI(SvcID)</td><td>{`${cdata[0].method || ''} ${cdata[0].uri}`}</td>
                <td class="lbl">Source</td><td
                  >{cdata[0].srcip + ":" + cdata[0].srcport}</td
                >
              </tr>
              <tr>
                <td class="lbl">송수신</td><td
                  >{cdata[0].stime + " ~ " + cdata[0].rtime.substring(11)}</td
                >
                <td class="lbl">소요시간</td><td>{cdata[0].svctime}</td>
                <td class="lbl">Destination</td>
                <td>{cdata[0].dstip + ":" + cdata[0].dstport}</td>
              </tr>
            </tbody>
          </table>
         {#if cdata[0].method >''}
          <div class="ny3">
            <span>요청헤더</span> <br />
            <textarea spellcheck="false" readonly rows="4">{cdata[0].headers}</textarea>
          </div>
          {/if}
          <div class="ny3">
            <dev class="my-1 flex gap-2 h-[30px] items-center">
              <span>{"요청데이터 : " + cdata[0].slen.toLocaleString("ko-KR")}
              </span>
              {#if $isLogged == 2}
                <button onclick={() => trChange(cdata[0])}>송신저장</button>
                <button onclick={() => trRedo(cdata[0])}>송신원복</button>
                <button onclick={openParams}>파라미터</button>
                <button onclick={openHeaders}>헤더</button>
              {/if}
            </dev>
            <textarea spellcheck="false" rows={cdata[0].method >'' ? 6 : 10} cols="120" bind:value={cdata[0].sdata}></textarea>
          </div>
          {#if cdata[0].method >''}
          <div class="ny3">
            <span>응답헤더</span> <br />
            <textarea readonly rows="4">{cdata[0].rhead}</textarea>
          </div>
          {/if}
          <div class="ny3">
            <span
              >{"응답데이터 : " + cdata[0].rlen.toLocaleString("ko-KR")}</span
            ><br />
            <div class="rdata">
              {cdata[0].rdata.toString()}
            </div>
          </div>
        </div>
        <div id="odata">
          {#if odata.ok}
            <table class="m-0 p-0">
              <tbody>
                <tr>
                  <td class="lbl">테스트ID</td><td>{odata.row.tcode}</td>
                  <td class="lbl">URI(SvcID)</td><td>{`${odata.row.method || ''} ${odata.row.uri}`}</td>
                  <td class="lbl">Source</td><td
                    >{odata.row.srcip + ":" + odata.row.srcport}</td
                  >
                </tr>
                <tr>
                  <td class="lbl">송수신</td><td
                    >{odata.row.stime +
                      " ~ " +
                      odata.row.rtime.substring(11)}</td
                  >
                  <td class="lbl">소요시간</td><td>{odata.row.svctime}</td>
                  <td class="lbl">Destination</td><td
                    >{odata.row.dstip + ":" + odata.row.dstport}
                  </td>
                </tr>
                </tbody>
              </table>
          {#if odata.row.method >''}
            <div class="ny3">
              <span>요청헤더</span> <br />
              <textarea readonly rows="4">{odata.row.headers}</textarea>
            </div>
            {/if}
            <div class="ny3">
              <dev class="my-1 h-[30px] flex items-center">
                <span>{"요청데이터 : " + odata.row.slen.toLocaleString("ko-KR")}</span>
              </dev>
              <textarea readonly rows={odata.row.method >'' ? 6 : 10}  cols="120" value={odata.row.sdata}></textarea>
            </div>
            {#if odata.row.method >''}
            <div class="ny3">
              <span>응답헤더</span> <br />
              <textarea readonly rows="4">{odata.row.rhead}</textarea>
            </div>
            {/if}
            <div class="ny3">
              <span
                >{"응답데이터 : " +
                  odata.row.rlen.toLocaleString("ko-KR")}</span
              ><br />
              <div class="rdata">{odata.row.rdata}</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* The Modal (background) */
  #myModal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 10; /* Sit on top */
    left: 0;
    right: 0;
    top: 0;
    font-family:  Tahoma, Geneva, Verdana, sans-serif,'Segoe UI';
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #e1e6f6;
    margin: 2px auto; /* 15% from the top and centered */
    padding: 15px;
    border: 1px solid #888;
    width: 98%;
  }

  .data {
    display: flex;
    font-size: 0.8rem;
  }
  #odata {
    display: none;
    border-left: 3px double #888
  }
  .cdata,
  #odata {
    flex: 1 1 0;
  }
  /* .modal-content > div  {
    width : 95%;
    padding-left : 1em ;
  } */
  .modal-content table {
    border-collapse: collapse;
    width: 100%;
    height: auto;
    overflow: hidden;
  }
  .modal-content td {
    margin: 0;
    padding: 0.5rem;
    vertical-align: middle;
    text-align: left;
    /* font-size: 0.9rem; */
    max-width: 20%;
    background-color: #ffffff;
    border: 1px solid #8d95b6;
  }
  td.lbl {
    background-color: var(--th_bgcolor);
    color: var(--th_color);
    text-align: center;
  }

  .ny1 {
    box-shadow: 0px 0px 3px gray;
    margin: 0.5em 0;
    padding: 0.5em 0.5em;
    vertical-align: middle;
  }

  .ny1 nav {
    float: right;
  }
  .ny1,
  .ny3 {
    text-align: left;
  }
  .ny3  span {
    font-size: 1.2em;
    color: midnightblue;
  }
  .rdata {
    @apply bg-slate-50 max-h-[330px] overflow-y-auto resize-y break-all whitespace-pre-wrap 
      min-h-16 border border-gray-500
  }

  textarea {
    @apply w-full border-gray-500 rounded resize-y break-all whitespace-pre-wrap
  }
</style>
