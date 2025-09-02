<script>
 import { isLogged, userid } from "../aqtstore.js";
  export let vid = "none";
  export let pid = 0;
  export let parr = [] ;
  export let pidx = 0;
  export let origin ='';

  let modal;
  let cdata = [];
  let odata = { ok: false, display: "none" };

  let encd = 'UTF-8' ;

  $: if (modal) modal.style.display = vid;
  $: getDetail(pid);

  async function reSend(row) {
    
    fetch("/trequest", {
      method: "POST" ,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ insdata : [
        row.pkey,
        row.cmpid,
        row.tcode,
        $userid
      ]})
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
    let urlv="/trlist/" + pid ; //+ `?v=${nnn}`; 
    if (origin) urlv="/tloaddata/" + pid  ; // + `?v=${nnn}`
    
    const res = await fetch(urlv);
    cdata = await res.json();
    odata.ok = false;
    if (document.getElementById("odata").style.display == "block")
      getOrig(cdata[0]);
  }

  async function getNext() {
    if (pidx >= parr.length -1) {
      window.alert('다음자료가 없습니다.');
      return ;
    }
    pid = parr[++pidx] ;
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
      window.alert('이전자료가 없습니다.');
      return ;
    }
    // await getDetail(parr[--pidx]);
    pid = parr[--pidx] ;

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
      odata.ok = false ;
      await getOrig(row);
    } else {
      odata.display = "none";
    }
    document.getElementById("odata").style.display = odata.display;
  }

  async function getOrig(qdata) {
    let cdata;
    if (!odata.ok) {
      const res = await fetch("/trlist/orig" ,
      { method: "POST" ,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          'id': qdata.cmpid,
          'tcode':qdata.tcode,
          'userid':$userid
        })
      });
    
      if (res.ok) cdata = await res.json();
      else {
        const err = await res.json();
        window.alert(err.message);
        return;
      }
      odata.ok = true;
      for (let row of cdata) {
        odata.row = row;
      }
    }
  }

  window.onclick = function (event) {
    modal = document.getElementById("myModal");
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
        sdata: row.sdata
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
    window.location.reload(true); // Reloads page from server
    getDetail(pid) ;
  }
  function trRedo(row) {
    fetch("/trlist/redo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: row.pkey
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

</script>

<!-- The Modal -->
<div id="myModal" class="modal">
  <!-- Modal content -->
  <div class="modal-content">
      {#if cdata.length > 0}
        <div class="ny1">
          <span class="title">{" 전문ID : " + cdata[0].cmpid} </span>
          <nav>
            {#if !origin} <button on:click={async () => reSend(cdata[0])}>재전송</button> {/if}
            <button on:click={async () => getDetail(cdata[0].pkey)}>새로고침</button>
            <button on:click={async () => getNext()}>다음</button>
            <button on:click={async () => getPrev()}>이전</button>
            {#if !origin} 
            <button
              on:click={async () => {
                viewOrig(cdata[0]);
              }}>원본보기</button
            >
            {/if}
            <button on:click={closedtl}>Close</button>
          </nav>
        </div>

        <div class="data">
            <div class="cdata">
              <div class="ny2">
                <table>
                  <tr>
                    <td class="lbl">테스트ID</td><td>{cdata[0].tcode}</td>
                    <td class="lbl">ID</td><td>{cdata[0].pkey}</td>
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
                    <td>{cdata[0].dstip + ":" + cdata[0].dstport}</td
                    >
                  </tr>
                  <!-- <tr>
              <td class="lbl">URI</td><td colspan="3">{row.uri}</td>
              <td class="lbl">Method</td><td>{row.method}</td>
              <td class="lbl">작업일시</td><td>{row.cdate}</td>
              <td class="lbl">수신코드</td><td>{row.rcode}</td>
            </tr> -->
                </table>
              </div>
              <div class="ny3">
                <br /><span
                  >{"송신데이터 : " + cdata[0].slen.toLocaleString("ko-KR")}
                </span>
                {#if $isLogged == 2}
                <button on:click={ () => trChange(cdata[0])}>송신저장</button>
                <button on:click={ () => trRedo(cdata[0])}>송신원복</button>
                {/if}
                 <br />
                <textarea  rows="8" cols="120" bind:value={cdata[0].sdata} />
              </div>
              <div class="ny3">
                <span>수신헤더</span> <br />
                <textarea readonly rows="5">{cdata[0].rhead}</textarea>
              </div>
              <div class="ny3">
                <span>{"수신데이터 : " + cdata[0].rlen.toLocaleString("ko-KR")}</span
                ><br />
                <textarea readonly rows="8" cols="120">{cdata[0].rdata.toString()}</textarea>
              </div>
            </div>
          <div id="odata">
            {#if odata.ok}
              <div class="ny2">
                <table>
                  <tr>
                    <td class="lbl">테스트ID</td><td>{odata.row.tcode}</td>
                    <td class="lbl">ID</td><td>{odata.row.pkey}</td>
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
                    </td
                    >
                  </tr>
                </table>
              </div>
              <div class="ny3">
                <br /><span
                  >{"송신데이터 : " + odata.row.slen.toLocaleString("ko-KR")}
                </span> <br />
                <textarea readonly rows="8" cols="120"
                  >{odata.row.sdata}</textarea
                >
              </div>
              <div class="ny3">
                <span>수신헤더</span> <br />
                <textarea readonly rows="5">{odata.row.rhead}</textarea>
              </div>
              <div class="ny3">
                <span
                  >{"수신데이터 : " +
                    odata.row.rlen.toLocaleString("ko-KR")}</span
                ><br />
                <textarea readonly rows="8" cols="120"
                  >{odata.row.rdata}</textarea
                >
              </div>
            {/if}
          </div>
        </div>
      {/if}
  </div>
</div>

<style>
  /* The Modal (background) */
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    right: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #e1e6f6;
    margin: 0% auto; /* 15% from the top and centered */
    padding: 15px;
    border: 1px solid #888;
    width: 95%;
  }

  .data {
    display: flex;
  }
  #odata {
    display: none;
    border-left: 2px solid darkblue;
  }
  .cdata, #odata {
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
    box-shadow: 0px 2px 3px gray;
    margin: 0.5em 0;
    padding: 0.5em 0.5em;
    vertical-align: middle;
  }
  .ny1 button {
    width: 6em;
    margin: 0 0.2em;
    border-radius: 6px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  .ny1 button:hover {
    box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
      0 17px 50px 0 rgba(0, 0, 0, 0.19);
  }
  .ny1 .title {
    font-size: 2em;
  }
  .ny1 nav {
    float: right;
  }
  .ny1,
  .ny3 {
    text-align: left;
  }
  .ny3 > span {
    font-size: 1.2em;
    color: midnightblue;
  }
  .ny3 textarea {
    width: 100%;
    border: 1px solid #8d95b6;
  }
</style>
