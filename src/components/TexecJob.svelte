<script>
  import { onMount, getContext } from "svelte";
  import Modal, { getModal } from "./Modal.svelte";
  import CopyTr from "./CopyTr.svelte";
  import {  userid } from "../aqtstore" ;

  let tick = 0 ;
  let intv = setInterval(() => {
    tick += 1
  }, 5000);

  $: getdata(tick) ;

  let tcodelist = [] ;

  const jobkindnm = {
    0: "패킷캡쳐",
    1: "import패킷",
    3: "전문생성",
    9: "테스트수행",
  };
  const statusnm = { 0: "미실행", 1: "실행중", 2: "작업완료", 3: "수행오류" };

  let rdata = [] ; // Promise.resolve([]);
  let jobsts = 0;
  let copytr = "copytr";
  let qselected = 4;

  let curRow = {};

  const columns = [
    "Job No",
    "작업종류",
    "테스트ID",
    "Description",
    "작업개수",
    "작업요청일시",
    "상태",
    "작업시작시간",
    "작업종료시간",
    "작업메세지",
  ];

  let sv_row;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
    curRow = row;
  }

  function newJob(){

        jobsts = 1;

        if ( ! (curRow = rdata.find(a => a.pkey == 0)) ) {
        curRow = {
          pkey: 0,
          tcode: tcodelist.sort((a,b) => a.enddate > b.enddate)[0].code ,
          tdesc: "",
          resultstat: 0,
          jobkind: 9,
          dbskip: "0",
          limits: "",
          etc: "",
          in_file: "",
          reqstartDt: (new Date()).toLocaleString('lt'),
          msg: "",
          exectype: 0,
          tnum: 1,
          repnum: 1,
          reqnum: 0,
        };
        rdata = [curRow, ...rdata] ;
        }
//        document.getElementsByTagName("table")[0].scrollIntoView() ;
  }

  function reExec() {
    if (curRow.tcode == "") {
      alert("작업할 테스트 ID 를 선택하세요.");
      return;
    }
    let jname = jobsts == 1 ? "신규작업" : "";
    let result = confirm(
      `작업시작시간:${curRow.reqstartDt} 에 JobNo:${jname} [${curRow.tcode}] :  \n 실행 요청하시겠습니까?`
    );
    if (result) updTcode();
  }
  function updTcode() {
    let {
      pkey,
      jobkind,
      tcode,
      tdesc,
      tnum,
      dbskip,
      limits,
      etc,
      in_file,
      outlogdir,
      reqstartDt,
      exectype,
      resultstat,
      reqnum,
      repnum
    } = curRow;
    resultstat = 0;

    fetch("/texecjob", {
      method: jobsts === 1 ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey,
        jobkind,
        tcode,
        tdesc,
        tnum,
        dbskip,
        limits,
        etc,
        in_file,
        outlogdir,
        reqstartDt,
        exectype,
        resultstat,
        reqnum,
        repnum
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

  function deljob(pkey) {
    if (
      !confirm(
        `JobNo:${curRow.pkey} [${curRow.tcode}]:${curRow.tdesc} 삭제하시겠습니까?`
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
  async function getdata(a='1') {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    const res = await fetch("/texecjob?"+a);
    if (res.status === 200) {
      rdata = await res.json();
    } else {
      throw new Error(res.statusText);
    }
  }

  let selected;

  onMount(async () => {
    getdata();
    const res = await fetch("/tmaster/tsellist/"+$userid );
    tcodelist =   await res.json();

    
	  const el = document.querySelector("#processing");
    el?.animate([
          { left: "0%", transform: "rotate(0deg)" },
          { left: "50%", transform: "rotate(360deg)" }
      ], {
          duration: 2000,
          fill: "forwards",
          iterations : Infinity
      });         
    
});
  
</script>

<div class="flex flex-col h-100 " >
  <div  class="flex justify-start items-baseline"  >
    <lebel>[ ▼ 전문송신이력 ] 조회선택▶</lebel>
    <div style="display:flex; border: 1px solid silver; margin:0 3px">
      <label class="rlabel"
        ><input type="radio" name="drone" bind:group={qselected} value={0} /> 미실행Job</label
      >
      <label class="rlabel"
        ><input type="radio" name="drone" bind:group={qselected} value={1} /> 실행중</label
      >
      <label class="rlabel"
        ><input type="radio" name="drone" bind:group={qselected} value={2} /> 작업완료</label
      >
      <label class="rlabel"
        ><input type="radio" name="drone" bind:group={qselected} value={4} /> 모두보기</label
      >
      <button title="5초마다 조회" on:click={()=>{intv ? (clearInterval(intv) , intv=null) : intv = setInterval(() => tick+=1,5000) }}>{intv ? '조회중지':'자동조회시작'}</button>
    </div>
  </div>
  <hr />
  <div class="max-h-[45vh] overflow-auto grow">
    <table class='my-1'>
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
          {#each rdata as row (row.pkey)}
            {#if qselected == 4 || qselected == row.resultstat}
              <tr
                class={"s"+row.resultstat}
                on:click={(e) => {
                  if (curRow.pkey) {
                    const ii = rdata.findIndex(a => a.pkey == curRow.pkey) ;
                    rdata[ii] = curRow ;
                  }
                  clickRow(e,row);
                  jobsts = 0;
                }}
              >
                <td class="pkey"><strong>{row.pkey}</strong></td>
                <td class="jobkind">{jobkindnm[row.jobkind]}</td>
                <td class="tcode">{row.tcode}</td>
                <td class="tdesc" style="width:10rem">{row.tdesc}</td>
                <td class="tnum">{row.tnum}</td>
                <td class="reqstartDt">{row.reqstartDt}</td>
                <td class="resultstat">{statusnm[row.resultstat]}</td>
                <td class="startDt">{row.startDt === null ? "" :row.startDt}</td>
                <td class="endDt">{row.endDt === null ? "" : row.endDt }</td>
                {#if (row.resultstat === 1)}
                  <td class="flex w-90 align-top">
                    <p>미수행:{(row.tcnt - row.ccnt).toLocaleString('ko-KR')}건 </p>
                    <img class='mx-4 my-0 h-6 animate-bounce' src="/images/hg5m.gif" />
                    <p class='text-blue-700'>&nbsp;{(row.ccnt/row.tcnt*100).toFixed(2)}% 완료</p>
                  </td>
                {:else}
                  <td class="msg max-w-[20%]" >{row.msg ? row.msg.split("\n")[0] : ""}</td>
                {/if}
              </tr>
            {/if}
          {/each}
        <!-- {:catch err}
          <p style="color: red">{err.message}</p>
        {/await} -->
      </tbody>
    </table>
  </div>
  <hr />
  <div class="flex pt-2 ">
    <button
      on:click={newJob}>신규작업</button>
    <button on:click={reExec}>{curRow.pkey > 0 ? "재" :""}실행요청</button>
    {#if curRow.pkey > 0}
      <button on:click={() => deljob(curRow.pkey)}>작업삭제</button>
    {/if}
    <button on:click={getModal(copytr).open({}, "60", "60")}>전문생성</button>
  </div>
  <div class="p-2 border-2 border-indigo-500 items basis-[250px] flex-none">
    <div class="item in_label">테스트ID:</div>
    <!-- <input class="item in_value" maxlength=10 style="width:200px"
          pattern="[A-Z0-9]{(3, 6)}"
          bind:value={curRow.tcode}
        /> -->
    <select class="item in_value" bind:value={curRow.tcode}>
      {#each tcodelist.filter(a => a.enddate === null) as t}
        <option value={t.code}>{t.code + " : " + t.name}</option>
      {/each}
    </select>

    <div class="item in_label">Description:</div>
    <input class="item in_value caret-pink-500 col-start-4 col-span-3" bind:value={curRow.tdesc} />
    <div class="item in_label">작업개수:</div>
    <input class="item in_value" type="number" bind:value={curRow.tnum} />
    <div class="item in_label">작업종류:</div>
    <div class="item in_value flex items-center">
      <label
        ><input
          type="radio"
          name="kind"
          value={9}
          bind:group={curRow.jobkind}
          readonly
        /> 테스트수행</label
      >
      <label
        ><input
          type="radio"
          name="kind"
          value={1}
          bind:group={curRow.jobkind}
          readonly
        /> import패킷</label
      >
      <label
        ><input
          type="radio"
          name="kind"
          value={3}
          bind:group={curRow.jobkind}
          readonly
          onclick="return false;"
        /> 전문생성</label
      >
    </div>
    <div class="item in_label">수행결과:</div>
    <div class="item in_value flex items-center">
      <label
        ><input
          type="radio"
          name="dbskip"
          value={"0"}
          bind:group={curRow.dbskip}
        /> 저장함</label
      >
      <label
        ><input
          type="radio"
          name="dbskip"
          value={"1"}
          bind:group={curRow.dbskip}
        /> 저장않함</label
      >
    </div>
    <div class="item in_label">작업방법:</div>
    <div class="item in_value flex items-center" >
      <label
        ><input
          type="radio"
          name="exec"
          value={0}
          bind:group={curRow.exectype}
        /> 즉시실행</label>
      <label
      ><input
        type="radio"
        name="exec"
        value={1}
        bind:group={curRow.exectype}
      /> 원본송신간격</label>
  </div>

    <div class="item in_label">송신간격(ms):</div>
    <input class="item in_value" type="number" bind:value={curRow.reqnum} />
    <div class="item in_label">처리건수:</div>
    <input class="item in_value col-start-2 col-span-2" bind:value={curRow.limits} />
    <div class="item in_label">작업요청일시:</div>
    <input
      class="item in_value col-start-5 col-span-2" 
      type="datetime-local"
      bind:value={curRow.reqstartDt}
    />
    <div class="item in_label">반복횟수:</div>
    <input class="item in_value" type="number" bind:value={curRow.repnum} />
    <div class="item in_label">대상선택조건:</div>
    <input class="item in_value col-start-2 col-span-2" bind:value={curRow.etc} />
    <div class="item in_label">작업메세지:</div>
    <textarea
      readonly
      class="item in_value col-start-5 col-span-4"
      bind:value={curRow.msg}
    />
  </div>
</div>
<Modal bind:id={copytr}>
  <CopyTr tlist={tcodelist} on:click={() => getModal(copytr).close()} />
</Modal>

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
    align-content: start;
    /* align-items: center; */
    margin: 10px;
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

  textarea {
    height: 100px;
    font-size: 0.8em;
  }

  .s0 {
    color :blue ;
  }
  .s1 {
    color :red ;
    font-weight: bold;
  }

</style>
