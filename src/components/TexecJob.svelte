<script>
/** 
* 테스트 작업 등록
*/
  import { onMount, getContext } from "svelte";
  import { userid } from "../aqtstore";
  
  import RegExeProg from "../lib/RegExeProg.svelte";
    // import res from "express/lib/response";

  let tick = 0;
  let intv ;

  // $: geting(tick);
  let showModal = $state(false);
  let tcodelist = $state([]) ;

  const statusnm = { 0: "등록", 1: "실행대기", 2: "실행중", 3: "수행오류", 9:"작업완료" };

  let rdata = $state([]); // Promise.resolve([]);
  let qselected = $state(4);

  let curRow = $state({});

  function autoGet(t) {
    return setInterval(() => { tick += 1; }, t);
  }

  function stopIntv() {
    intv ? intv=clearInterval(intv)  : null ;
  }
  function newJob() {
    if (curRow.jobsts == 1) {
      getdata();
      return;
    }
    if (intv) {
      intv=clearInterval(intv) ;
    }
    let nrow ;
    if (curRow.tcode) {
      nrow = { ...curRow , jobsts : 1, pkey:0, resultstat:0,
        reqstartDt : new Date().toLocaleString("lt"),
        reqstartDt2 : new Date().toLocaleString("lt"),
        msg : ""
      } 
    } else {
      nrow = { jobsts : 1,
        pkey: 0, ppkey: 0, tcode: tcodelist[0].tcode, tdesc: "", resultstat: 0,
        jobkind: 9, dbskip: "0", limits: "", etc: "", in_file: "",
        reqstartDt: new Date().toLocaleString("lt"),
        reqstartDt2: new Date().toLocaleString("lt"),
        msg: "", exectype: 0, tnum: 1, repnum: 1, reqnum: 0,
        thost: "", tport: 0,
      };
    }
    rdata = [nrow, ...rdata];
    curRow = rdata[0] ;
    setTimeout(() => document.getElementById("newrow")?.focus(), 0);
  }

  function reExec() {
    if (curRow.tcode == "") {
      alert("작업할 테스트 ID 를 선택하세요.");
      return;
    }
    
    let result = confirm(
      `작업시작시간:[${curRow.reqstartDt}] 에 테스트ID:[${curRow.tcode}] :  \n 실행 요청하시겠습니까?`,
    );
    if (result) {
      curRow.resultstat = 1;
      updExec();
    }
  }
  function reqStop() {
    if (curRow.resultstat !== 2) {
      return;
    }

    const result = confirm(
      `[${curRow.tcode}] : ${curRow.tdesc} \n 작업 중단하시겠습니까?`,
    );
    if (result) {
      fetch("/texecjob/reqStop/" + curRow.pkey);
      setTimeout(getdata, 3000);
    }
  }

  function updExec() {
    if (! Number.isInteger(curRow.ppkey)) curRow.ppkey = 0;
    fetch("/texecjob", {
      method: curRow.jobsts === 1 ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(curRow),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
        if (res.ok) {
          setTimeout(getdata, 2000);
        }
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  function deljob(pkey) {
    if (curRow.resultstat == 2) return reqStop();
    if (
      !confirm(
        `JobNo:${curRow.pkey} [${curRow.tcode}]:${curRow.tdesc} 삭제하시겠습니까?`,
      )
    )
      return;
    fetch("/texecjob", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: pkey,
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        if (res.status < 400) {
          getdata();
          alert("정상 삭제되었습니다");
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  async function getdata() {
    const res = await fetch("/texecjob/9" );
    if (res.status === 200) {
      rdata = await res.json();
      // stopIntv();
      // intv = autoGet(5000);
    } else {
      throw new Error(res.statusText);
    }
  }

  function geting() {
    const socket = new WebSocket('ws://' + window.location.host + '/execjob');

    socket.onopen = function(e) {
      socket.send('{"type":2, "payload":{"kind":9 }}'); // 데이터 전송
    };

    socket.onmessage = async function(event) {
    // const res = await fetch("/texecjob/ing?" + x);
    // if (res.ok) {
    //   const ring = await res.json();
      const ring = JSON.parse(event.data) ;

      for await (const rw of ring) {
        const ii = rdata.findIndex((a) => a.pkey == rw.pkey);
        if (ii >= 0) {
          rdata[ii].resultstat = rw.resultstat;
          rdata[ii].startDt = rw.startDt;
          rdata[ii].endDt = rw.endDt;
        }
        const [hh,mm,ss] = rw.elapsed.split(':').map(Number);
        rw.elaps = hh * 3600 + mm * 60 + ss ;
        const elm = document.getElementById(rw.pkey);
        if (elm && rw.resultstat === 2) {
          elm.setAttribute(
            "title",
            "총: " +
              rw.tcnt.toLocaleString("ko-KR") +
              " 건" +
              (rw.elaps ? "\n " + (rw.ccnt / rw.elaps).toFixed() + " tps" : ""),
          );
          elm.innerHTML = `
                    <p>${rw.ccnt.toLocaleString("ko-KR")}건 수행됨</p>
                    <img class='mx-4 my-0 h-6 animate-bounce' src="/images/horse.gif" />
                    <p class='text-blue-700'>&nbsp;${rw.tcnt ? ((rw.ccnt / rw.tcnt) * 100).toFixed(2) : 0}% 완료</p> `;
          elm.previousElementSibling.innerHTML = rw.elapsed ;
        } else elm.previousElementSibling.innerHTML = `${rw.ccnt.toLocaleString("ko-KR")} 건 수행됨` ;
      }
      // if (ring.length === 0)  setTimeout(getdata,0) ;

    }
    socket.onerror = function(error) {
      console.log(`[error] ${error.message}`);
    };
    return () => { socket.close() };
  }

  let selected;

  onMount(() => {
    getdata();
    (async () => {
      tcodelist = [];
      const res = await fetch("/tmaster/tsellist/" + $userid);
      const tlist = await res.json();
      tcodelist = tlist.filter( r => (r.lvl != 0 && r.endDate == null )) ;
      const selEl = document.getElementById("tcode");
      selEl.addEventListener("change", (e) => {
        const fcode = tcodelist.find((r) => r.tcode == e.target.value);
        // console.log(fcode);
        if (fcode) {
          curRow.thost = fcode.thost;
          curRow.tport = fcode.tport;
        }
      });
    })() ;
    return geting() ;

  });
</script>

<main class="h-full">
  <div class="headpan">
    <span>[ ▼ 전문송신이력 ] 조회선택▶</span>
    <div class="flex border border-gray-500 mx-2 p-1 rounded" >
      <span class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={1} /> 실행대기</span >
      <span class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={2} /> 실행중</span >
      <span class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={9} /> 작업완료</span >
      <span class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={4} /> 모두보기</span >
    </div>
    <button onclick={getdata}>조회</button>
  </div>

  <div class="min-h-[calc(100%-378px)] overflow-auto grow">
    <table class="w-[98%]">
      <thead>
        <tr>
          <th>Job No</th>      
          <th>테스트ID</th>
          <th>Description</th>
          <th>작업개수</th>
          <th>작업요청일시</th>
          <th>상태</th>
          <th>작업시간</th>
          <th>소요시간</th>
          <th>작업메세지</th>
        </tr>
      </thead>
      <tbody>
        {#await rdata}
          <p>...waiting</p>
        {:then rows}
          {#each rows as row (row.pkey)}
            {#if qselected == 4 || qselected == row.resultstat}
              <tr tabindex="0"
                id={row.pkey ? row.pkey + "jajq" : "newrow"}
                class={ `${row.resultstat === 2 ? 'text-red-600' : row.resultstat === 1 ? "text-blue-700" : "" }`} 
                onclick={(e) => {curRow = row; }}
              >
                <td class="pkey" tabindex="0"><strong>{row.pkey}</strong></td>
                <td class="tcode">{row.tcode}</td>
                <td class="tdesc">{row.tdesc}</td>
                <td class="tnum">{row.tnum}</td>
                <td class="reqstartDt">{row.reqstartDt2}</td>
                <td class="resultstat">{statusnm[row.resultstat]}</td>
                <td class="startDt">{(row.startDt ? row.startDt:"") + " ~ " + (row.endDt ?  row.endDt :"") }</td>
                <td >{row.elapsed ? row.elapsed : ''}</td>
                {#if row.resultstat === 2}
                  <td id={row.pkey} class="flex w-90 align-top"
                    title={"총: " + row.tcnt.toLocaleString("ko-KR") + " 건"}
                  >
                    <p>{row.ccnt.toLocaleString("ko-KR")}건 수행됨</p>
                    <img
                      class="mx-4 my-0 h-6 animate-bounce"
                      src="/images/horse.gif"
                    />
                    <p class="text-blue-700">
                      &nbsp;{row.tcnt
                        ? ((row.ccnt / row.tcnt) * 100).toFixed(2)
                        : 0}% 완료
                    </p>
                  </td>
                {:else}
                  <td class="text-start max-w-[20%]"
                    >{row.msg ? row.msg.split("\n")[0] : ""}</td
                  >
                {/if}
              </tr>
            {/if}
          {/each}
        {:catch err}
          <p style="color: red">{err.message}</p>
        {/await}
      </tbody>
    </table>
  </div>

  <div class="shrink-0 headpan">
    <button onclick={newJob}>{curRow.jobsts === 1 ? "신규취소" : "작업추가" }</button>
    <button onclick={reExec}>실행요청</button>
    {#if curRow.pkey > 0}
      <button class="btn-delete" onclick={() => deljob(curRow.pkey)}
        >{curRow.resultstat == 2 ? "작업중지" : "작업삭제"}</button
      >
    {/if}
    <button  onclick={()=>{curRow.resultstat=0; updExec() }}>저장</button>
    <button disabled={!curRow.pkey} onclick={()=>{ showModal = true; }}>선후행프로그램선택</button>
  </div>
  <div class="m-1 p-2 shadow border-zinc-500 items flex-none {curRow.pkey ? '': 'bg-slate-200'}">
    <div class="item text-right">테스트ID:</div>
    <!-- <input class="item in_value" maxlength=10 style="width:200px"
          pattern="[A-Z0-9]{(3, 6)}"
          bind:value={curRow.tcode}
        /> -->
    <select id="tcode" class="item in_value" bind:value={curRow.tcode}>
      {#each tcodelist as t}
        <option value={t.tcode}>{t.tcode + " : " + t.name}</option>
      {/each}
    </select>

    <div class="item text-right">Description:</div>
    <input
      class="item in_value caret-pink-500 col-start-4 col-span-3"
      bind:value={curRow.tdesc}
    />
    <div class="item text-right">작업개수:</div>
    <input class="item in_value" type="number" bind:value={curRow.tnum} />
    <div class="item text-right ">선행JobId: </div>
    <input class="item in_value"  type="number"  bind:value={curRow.ppkey} />
   
    <div class="item text-right">수행결과:</div>
    <div class="item in_value flex items-center">
      <span class="px-2"
        ><input
          type="radio"
          name="dbskip"
          value={"0"}
          bind:group={curRow.dbskip}
        /> 저장함</span
      >
      <span class="px-2"
        ><input
          type="radio"
          name="dbskip"
          value={"1"}
          bind:group={curRow.dbskip}
        /> 저장않함</span
      >
    </div>
    <div class="item text-right">작업방법:</div>
    <div class="item in_value flex items-center">
      <span class="px-2"><input type="radio" name="exec" value={0} bind:group={curRow.exectype} /> 즉시실행</span >
      <span class="px-2"><input type="radio" name="exec" value={1} bind:group={curRow.exectype} /> 원본송신간격</span >
    </div>

    <div class="item text-right">송신간격(ms):</div>
    <input class="item in_value" type="number" bind:value={curRow.reqnum} />
    <span class="text-right">Host:</span>
    <input id="thost" class="item in_value" bind:value={curRow.thost} />
    <span class="text-right">Port:</span>
    <input class="item in_value" type="number" bind:value={curRow.tport} />
    <div class="item text-right">작업요청일시:</div>
    <input
      class="item in_value"
      type="datetime-local"
      bind:value={curRow.reqstartDt}
    />
   
    <div class="item text-right">반복횟수:</div>
    <input class="item in_value" type="number" bind:value={curRow.repnum} />
    <div class="item text-right">대상선택조건:</div>
    <input class="item in_value col-span-3" bind:value={curRow.etc} />
    <div class="item text-right">처리건수:</div>
    <input class="item in_value col-span-3" bind:value={curRow.limits} />

    <div class="item text-right">작업메세지:</div>
    <textarea
      readonly
      class="item in_value col-span-7 h-20 mb-0"
      bind:value={curRow.msg}
></textarea>
  </div>
</main>
<RegExeProg bind:showModal={showModal} pkey={curRow.pkey} />

<style>
  /* .main {
    max-height: 100%;
    overflow: auto;
  } */
  .in_value > label,
  .rlabel {
    margin: 0px 5px;
    font-size: 0.9em;
  }
  .items {
    display: grid;
    grid-template-columns: repeat(3, 7rem auto) 7rem 5rem;
    gap: 3px 10px;
    align-items: baseline ;
    align-content: start;
    margin: 5px;
  }

  .item {
    vertical-align: text-bottom;
  }

  .in_value:not(textarea) {
    border: 1px solid silver;
    border-radius: 5px;
    height: 2.2em;
  }

</style>
