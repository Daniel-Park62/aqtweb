<script>
  import { onMount, getContext } from "svelte";
  import Modal, { getModal } from "./Modal.svelte";
  import CopyTr from "./CopyTr.svelte";
  import {  userid } from "../aqtstore" ;

  let tick = 0 ;
  setInterval(() => {
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
  let edited = false;
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

  function reExec() {
    if (curRow.tcode == "") {
      alert("작업할 테스트 ID 를 선택하세요.");
      return;
    }
    let jname = jobsts == 1 ? "신규작업" : "";
    let result = confirm(
      ` ${jname} ${curRow.tcode} : ${curRow.reqstartDt} \n 실행 등록하시겠습니까?`
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
        `${curRow.pkey} ${curRow.tcode} ${curRow.tdesc} 삭제하시겠습니까?`
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
          alert("정상 삭제되었습니다");
          getdata();
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  async function getdata(a='1') {
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
    el.animate([
          { left: "0%", transform: "rotate(0deg)" },
          { left: "50%", transform: "rotate(360deg)" }
      ], {
          duration: 2000,
          fill: "forwards",
          iterations : Infinity
      });         
    
});
  
</script>

<div class="main">
  <div
    class="itemx"
    style="display:flex; justify-content: flex-start; align-items:baseline"
  >
    <lebel>[ ▼ 전문송신이력 ] 조회선택▶</lebel>
    <div style="display:flex; border: 1px solid silver;">
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
    </div>
  </div>
  <hr />
  <div class="itemx texecList">
    <table style='width: 100%;'>
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
                on:click={() => {
                  if (curRow.pkey) {
                    const ii = rdata.findIndex(a => a.pkey == curRow.pkey) ;
                    rdata[ii] = curRow ;
                  }
                  curRow = row;
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
                  <td style="width:20%; "
                  >미수행{(row.tcnt - row.ccnt).toLocaleString('ko-KR')}건 <img height="20" src="./images/hg5m.gif"/>&nbsp;{(row.ccnt).toLocaleString('ko-KR')}건 처리</td>
                {:else}
                  <td class="msg" style="max-width:20%">{row.msg ? row.msg.split("\n")[0] : ""}</td>
                {/if}
                {#if (curRow === row)}
                  <td>◀</td>
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
  <div class="itemx" style="display:flex; justify-content: flex-start; ">
    <button
      on:click={() => {
        jobsts = 1;
        let today = new Date();
        today.setHours(today.getHours() + 9);
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
          reqstartDt: today.toISOString().slice(0, -5).replace("T", " "),
          msg: "",
          exectype: 0,
          tnum: 1,
          repnum: 1,
          reqnum: 0,
        };
        rdata = [curRow, ...rdata] ;
        }
        document.getElementsByTagName("table")[0].scrollIntoView() ;
      }}>신규작업</button>
    <button on:click={reExec}>{curRow.pkey > 0 ? "재" :""}실행요청</button>
    {#if curRow.pkey > 0}
      <button on:click={deljob(curRow.pkey)}>작업삭제</button>
    {/if}
    <button on:click={getModal(copytr).open({}, "60", "60")}>전문생성</button>
  </div>
  <hr />
  <div class="itemx items">
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
    <input class="item in_value" style="grid-column: 4 / span 3;" bind:value={curRow.tdesc} />
    <div class="item in_label">작업개수:</div>
    <input class="item in_value" type="number" bind:value={curRow.tnum} />
    <div class="item in_label">작업종류:</div>
    <div class="item in_value" style="display:flex;align-items:center">
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
    <div class="item in_value" style="display:flex;align-items:center">
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
    <div class="item in_value" style="display:flex;align-items:center">
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
    <input class="item in_value" style="grid-column: 2 / span 2;" bind:value={curRow.limits} />
    <div class="item in_label">작업요청일시:</div>
    <input
      class="item in_value" style="grid-column: 5 / span 2;"
      type="datetime-local"
      bind:value={curRow.reqstartDt}
    />
    <div class="item in_label">반복횟수:</div>
    <input class="item in_value" type="number" bind:value={curRow.repnum} />
    <div class="item in_label">대상선택조건:</div>
    <input class="item in_value" style="grid-column: 2 / span 2;" bind:value={curRow.etc} />
    <div class="item in_label">작업메세지:</div>
    <textarea
      readonly
      class="item in_value"
      bind:value={curRow.msg}
      style="grid-column: 5 / span 4;"
    />
  </div>
</div>
<Modal bind:id={copytr}>
  <CopyTr tlist={tcodelist} on:click={() => getModal(copytr).close()} />
</Modal>

<style>
  .main {
    max-height: 100%;
    overflow: auto;
  }
  .texecList {
    max-height: 45vh;
    overflow: auto;
  }

  .itemx:nth-child(n + 2) {
    flex: 1 0 0;
  }
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
    height: 40vh;
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

  table {
    border-collapse: collapse;
    overflow: auto;
  }

  td,
  th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
  }

  .s0 {
    color :blue ;
  }
  .s1 {
    color :red ;
    font-weight: bold;
  }

</style>
