<!-- 모의서버 관리 tmocksvr 테이블 등록 -->
<script>
  import { onMount, tick } from "svelte";
  const statusnm = { 0: "정지", 1:"대기", 2: "실행중", 3: "오류"};
  let rcnt = $state(0) ;
  const cols = {
    chk: true,
    pkey: 0,
    svrnm: "서버명입력",
    svrkind: 0,
    status: 0,
    portno: 9988,
    allowip: "",
    srcnm: "tcpsvr",
  };
  let rdata = $state([{...cols}]);
  let wsocket;
  function updService() {
    console.log("update", rdata);
    const upds = rdata.filter((r) => r.chk && r.pkey != 0) ;

    const inss = rdata.filter((r) => r.chk && r.pkey == 0) ;

    // console.log(inss)     ;
    fetch("/tmocksvr", {
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
    fetch("/tmocksvr", {
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

    const res = await fetch("/tmocksvr") ;
    if (res.status === 200) {
      rdata = await res.json();
      rcnt = rdata.length ;

    } else {
      throw new Error(res.statusText);
    }
  }

  let tblbody = $state() ;
  async function addRow() {
      cols.portno++ ;
      rdata = [...rdata, {...cols} ] ;
      await tick() ;
      
      if (tblbody) {
        const lastRow = tblbody.lastElementChild;

        await lastRow.click() ;
        lastRow.focus();
        // 필요 시 스크롤 이동
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }

  function startsvr(ix) {

    if (wsocket?.readyState === WebSocket.OPEN ) {
      const sdata = {type:8,payload:{}};
      if (rdata[ix].status === 2 )  { 
        sdata.type = 9;
        sdata.payload = {pkey:rdata[ix].pkey, pid : rdata[ix].procid };
      } else {
        sdata.payload = {srcnm:rdata[ix].srcnm, port:rdata[ix].portno,pkey:rdata[ix].pkey } ;
        rdata[ix].status = 1;
      }
      wsocket.send(JSON.stringify(sdata)); // 데이터 전송
    };

  }

  function wconnect() {
    const socket = new WebSocket('ws://' + window.location.host + '/mock');
    socket.onopen = (e) => { wsocket = socket }
    socket.onmessage = function(event) {
      alert(event.data);
      setTimeout(getdata, 3000) ;
    }
    socket.onerror = function(error) {
      console.log(`[error] ${error.message}`);
    };
    socket.onclose = (e) => {
      wsocket=null;
      // setTimeout(wconnect,3000);
    }

    return () => socket.close() ;
  }

  onMount(() => {
    getdata();
    return wconnect() ;
  });

  function chHdle(ix) {
    rdata[ix].chk = true;
    switch (rdata[ix].svrkind) {
      case 2:
        rdata[ix].srcnm = 'kftcsvr';
        break;
      case 1:
        rdata[ix].srcnm = 'httpsvr';
        break;
      case 0:
        rdata[ix].srcnm = 'tcpsvr';
        break;
    }
  }
</script>
<main class="h-full">

<div id="btns" class="flex">
  <button
    onclick={addRow}>추가</button >
  <button onclick={delService}>선택삭제</button>
  <button onclick={updService}>선택수정</button>
  <button class="ml-auto" onclick={getdata}>조회</button>
  <span class="ml-auto" >{rcnt > 0 ? rcnt.toLocaleString('ko-KR') + ' 건' : ' '}</span>
</div>
<hr />
<div class="tList">
  <table class="border-collapse table-fixed">
    <thead>
      <tr>
          <th class='w-[1.5cm]'>선택</th>
          <th class='w-[20%]'>서버명</th>
          <th class='w-[20%]'>종류</th>
          <th class='w-[7em]'>Port</th>
          <th>허용 IP Addr.</th>
          <th>연관소스</th>
          <th class='w-[4cm]'>상태</th>
          <th></th>
      </tr>
    </thead>
    <tbody bind:this={tblbody}>
      {#await rdata}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row, ix}
          <tr tabindex="0" class="focus-within:bg-blue-100 focus-within:outline-none cursor-pointer">
            <td class="align-middle"><input  disabled={row.pkey == 0} type="checkbox" bind:checked={row.chk} /></td>
            <td>
              <input class="w-[100%] my-0 bg-transparent border-none" onchange={() => row.chk=true} bind:value={row.svrnm}>
            </td>
            <td class="border align-middle">
              <div class="w-[100%] flex gap-4 items-center border-0 ">
                <label ><input class="radio radio-accent" type="radio" name={ix.toString()} bind:group={row.svrkind} value={2} onchange={() => chHdle(ix)}/> OpenAPI</label>
                <label ><input class="radio radio-accent" type="radio" name={ix.toString()} bind:group={row.svrkind} value={0} onchange={() => chHdle(ix)}/> TCP</label>
                <label ><input class="radio radio-accent" type="radio" name={ix.toString()} bind:group={row.svrkind} value={1} onchange={() => chHdle(ix)}/> HTTP</label>
              </div>
            </td>
            <td><input disabled={row.status==2} class="w-[100%] my-0 bg-transparent border-none" type=number onchange={() => row.chk=true} bind:value={row.portno} max=65535></td>
            <td>
              <input disabled={row.status==2} class="w-[100%] my-0 bg-transparent border-none" onchange={() => row.chk=true} bind:value={row.allowip}>
            </td>
            <td   class=" srcnm">
              <input disabled={row.status==2} class="my-0 bg-transparent border-none" onchange={() => row.chk=true} bind:value={row.srcnm}>
            </td>
            <td class="align-middle">{statusnm[row.status]}</td>
            <td class="align-middle ">
              <button disabled={row.status == 1} onclick={() => {startsvr(ix);}} class={`${row.status == 2 ? 'hover:bg-red-700 bg-red-600' : 'hover:bg-blue-700 bg-blue-600'} px-4 py-1 text-white text-xs rounded-md transition`}>
              {( row.status == 1 ||  row.status == 2 )  ? '중지' : '시작'}
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
</main>
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
