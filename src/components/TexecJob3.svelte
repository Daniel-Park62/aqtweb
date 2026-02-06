<script>
/** 
* 실시간 테스트 작업 등록
*/
  import { onMount } from "svelte";
  import { userid } from "../aqtstore";

  let tick = 0;
  let intv ;

  $: geting(tick);

  let tcodelist = [];

  const statusnm = { 0: "등록", 1: "실행대기", 2: "실행중", 3: "수행오류", 9:"작업완료" };

  let rdata = []; // Promise.resolve([]);
  let qselected = 4;

  let curRow ={} ;

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
      nrow = { ...curRow , jobsts : 1,
          pkey : 0,   jobkind : 8 ,resultstat : 0 ,
          reqstartDt : new Date().toLocaleString("lt") ,
          reqstartDt2 : new Date().toLocaleString("lt") , msg :"",  
          aqttype: "TCP", ctype: 0, ptype: "C", dstf: "",
          immd:1, dstip: "", dstport: 0, otherCond:"",
          otherOpt:"", norcv:0
        }
    } else {
      nrow = {
        jobsts : 1,
        pkey: 0,
        ppkey: 0,
        tcode: "",
        tdesc: "Test",
        resultstat: 0,
        jobkind: 8,
        dbskip: "0",
        limits: "",
        etc: "",
        in_file: "",
        reqstartDt: new Date().toLocaleString("lt"),
        reqstartDt2: new Date().toLocaleString("lt"),
        msg: "",
        exectype: 0,
        tnum: 1,
        repnum: 1,
        reqnum: 0,
        thost: "",
        tport: 0,
        aqttype: "TCP", ctype: 0, ptype: "C", dstf: "",
        immd:1, dstip: "", dstport: 0, otherCond:"",
        otherOpt:"", norcv:0
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
        if (res.status < 300) {
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
    const res = await fetch("/texecjob/8" );
    if (res.status === 200) {
      rdata = await res.json();
      stopIntv();
      intv = autoGet(5000);
    } else {
      throw new Error(res.statusText);
    }
  }

  async function geting(x) {
    const res = await fetch("/texecjob/ing?" + x);
    if (res.ok) {
      const ring = await res.json();

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
        if (elm) {
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
        }
      }
      // if (ring.length === 0)  setTimeout(getdata,0) ;
    } else {
      throw new Error(res.statusText);
    }
  }

  let selected;

  onMount(async () => {
    getdata();
    const res = await fetch("/tmaster/tsellist/" + $userid);
    const tlist = await res.json();
    tcodelist = tlist.filter( r => (r.lvl != 0 && r.enddate == null )) ;

    const selEl = document.getElementById("tcode");
    selEl.addEventListener("change", (e) => {
      const fcode = tcodelist.find((r) => r.code == e.target.value);
      // console.log(fcode);
      if (fcode) {
        curRow.thost = fcode.thost;
        curRow.tport = fcode.tport;
      }
    });

    /*     
	  const el = document.querySelector("#processing");
    el?.animate([
          { left: "0%", transform: "rotate(0deg)" },
          { left: "50%", transform: "rotate(360deg)" }
      ], {
          duration: 2000,
          fill: "forwards",
          iterations : Infinity
      });         
 */
  });
</script>

<div class="flex flex-col h-100">
  <div class="flex justify-start items-baseline">
    <lebel>[ ▼ 전문송신이력 ] 조회선택▶</lebel>
    <div style="display:flex; border: 1px solid silver; margin:0 3px">
      <label class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={1} /> 실행대기</label >
      <label class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={2} /> 실행중</label >
      <label class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={9} /> 작업완료</label >
      <label class="rlabel" ><input type="radio" name="drone" bind:group={qselected} value={4} /> 모두보기</label >
    </div>
    <button on:click={getdata}>조회</button>
  </div>
  <hr />
  <div class="max-h-[45vh] overflow-auto grow">
    <table class="my-1">
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
                class={ `focus-within:bg-teal-100 focus-within:outline-none   ${row.resultstat === 2 ? 'text-red-600' : row.resultstat === 1 ? "text-blue-700" : "" }`} 
                on:click={(e) => {curRow = row }}
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
                  <td
                    id={row.pkey}
                    class="flex w-90 align-top"
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
                  <td id={row.pkey} class="msg max-w-[20%]"
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
  <hr />
  <div class="flex pt-2">
    <button on:click={newJob}>{curRow.jobsts === 1 ?  "신규취소" : "작업추가" }</button>
    <button on:click={reExec}>실행요청</button>
    {#if curRow.pkey > 0}
      <button on:click={() => deljob(curRow.pkey)}
        >{curRow.resultstat == 2 ? "작업중지" : "작업삭제"}</button
      >
    {/if}
    <button  on:click={()=>{curRow.resultstat=0; updExec() }}>저장</button>
  </div>
  <div class="p-2 border-2 border-indigo-500 items basis-[100px] flex-none {curRow.pkey ? '': 'bg-lime-100'}">
    <div class="item in_label">테스트ID:</div>
    <!-- <input class="item in_value" maxlength=10 style="width:200px"
          pattern="[A-Z0-9]{(3, 6)}"
          bind:value={curRow.tcode}
        /> -->
    <select id="tcode" class="item in_value " bind:value={curRow.tcode}>
      {#each tcodelist as t}
        <option value={t.code}>{t.code + " : " + t.name}</option>
      {/each}
    </select>

    <div class="item in_label">Description:</div>
    <input
      class="item in_value caret-pink-500 col-start-4 col-span-3"
      bind:value={curRow.tdesc}
    />
    <div class="item in_label">작업개수:</div>
    <input class="item in_value" type="number" bind:value={curRow.tnum} />

    <div class="item in_label">자료종류:</div>
    <div class="item in_value flex ">
      <label class="pt-1"><input type="radio" name="aqttype" value={"TCP"} bind:group={curRow.aqttype}/> TCP</label>
      <label class="pt-1"><input type="radio" name="aqttype" value={"TMAX"} bind:group={curRow.aqttype}/> TMAX</label>
      <label class="pt-1"><input type="radio" name="aqttype" value={"JEUS"} bind:group={curRow.aqttype}/> JEUS</label>
      <label class="pt-1"><input type="radio" name="aqttype" value={"HTTP"} bind:group={curRow.aqttype}/> HTTP</label>
      <label class="pt-1"><input type="radio" name="aqttype" value={"UDP"} bind:group={curRow.aqttype}/> UDP</label>
    </div>

    <div class="item in_label">작업요청일시:</div>
    <input class="item in_value" type="datetime-local" bind:value={curRow.reqstartDt} />

    <div class="item in_label" title="테스트대상 서버ip 또는 host명">테스트Host:</div>
    <input id="thost" class="item in_value" bind:value={curRow.thost} />
    <div class="item in_label">- port:</div>
    <input class="item in_value" type="number" bind:value={curRow.tport} />

    <div class="item in_label">테스트여부:</div>
    <div class="item in_value flex">
      <label class="pt-1"><input type="radio" name="immd" value={0} bind:group={curRow.immd}/> 데이터수집</label>
      <label class="pt-1"><input type="radio" name="immd" value={1} bind:group={curRow.immd}/> 실시간</label>
      <label title="수행결과를 저장하지않으므로 처리속도향상을 기대" class="pt-1"><input type="radio" name="immd" value={2} bind:group={curRow.immd}/> 실시간(결과무시)</label>
    </div>
   
    <div class="item in_label">수집방법:</div>
    <div class="item in_value flex ">
      <label class="pt-1"><input type="radio" name="ptype" value={"C"} bind:group={curRow.ptype}/> NetWork</label>
      <label class="pt-1"><input type="radio" name="ptype" value={"F"} bind:group={curRow.ptype}/> 파일에서</label>
    </div>
    <div class="item in_label">파일명:</div>
    <input class="item in_value " bind:value={curRow.dstf} />

    <div class="item in_label">처리건수:</div>
    <input class="item in_value " type="number" bind:value={curRow.limits} />

    <div class="item in_label">수집명령:</div>
    <div class="item in_value flex">
      <label class="pt-1"><input type="radio" name="ctype" value={0} bind:group={curRow.ctype}/> tcpdump</label>
      <label class="pt-1"><input type="radio" name="ctype" value={1} bind:group={curRow.ctype}/> netti</label>
      <label class="pt-1"><input type="radio" name="ctype" value={2} bind:group={curRow.ctype}/> snoop</label>
    </div>

    <label class="item in_value pt-1 col-span-2"><input type="checkbox" name="norcv" bind:checked={curRow.norcv}/> 송신만 수집하고 응답은 무시함</label>

    <div class="item in_label">수집대상ip:</div>
    <input class="item in_value" bind:value={curRow.dstip} />
    <div class="item in_label">- port:</div>
    <input class="item in_value" type="number" bind:value={curRow.dstport} />

    <div class="item in_label" title="tcpdump 시 추가할 옵션 ">수집추가옵션:</div>
    <input class="item in_value " name="otherOpt" bind:value={curRow.otherOpt} />


    <div class="item in_label" title="tcpdump 시 추가할 필터조건">추가조건:</div>
    <input class="item in_value" bind:value={curRow.otherCond} />

    <div class="item in_label">작업메세지:</div>
    <textarea
      readonly
      class="item border-gray-500 text-sm col-span-3 mb-0"
      bind:value={curRow.msg}
    />
  </div>
</div>

<style>

  .in_value > label,
  .rlabel {
    margin: 0px 5px;
    font-size: 0.9em;
  }
  .items {
    display: grid;
    grid-template-columns: repeat(3, 7rem auto) 7rem 5rem;
    gap: 3px 10px;
    align-content: start;
    /* align-items: center; */
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
  .in_label {
    text-align: end;
  }

</style>
