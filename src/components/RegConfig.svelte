<script>
  import { onMount } from "svelte";
  import { userid } from "../aqtstore" ;

  let rdata = Promise.resolve([]);
  let jobsts = 0;

  let curRow = {};

  function updateConfig() {
    let {
      pjtnm,
      col1,
      col2,
      diffc,
      sflagc,
      encval,
      col1type,
      expr1,
      col2type,
      expr2
    } = curRow;
    
    // console.log(curRow) ;
    fetch("/aqtSetup", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pjtnm,
        col1,
        col2,
        diffc,
        sflagc,
        encval,
        expr1,
        col1type,
        expr2,
        col2type
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
  function altercol1() {
    let {
      col1,
      col1type,
      expr1
    } = curRow;
    
    fetch("/aqtSetup/altercol1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        col1,
        expr1,
        col1type
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
  function altercol2() {
    let {
      col2,
      col2type,
      expr2
    } = curRow;
    
    fetch("/aqtSetup/altercol2", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        col2,
        expr2,
        col2type
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
  async function getdata() {
    const res = await fetch("/aqtSetup");
    if (res.status === 200) {
      curRow = await res.json();
    } else {
      throw new Error(res.statusText);
    }
  }

  onMount(async () => {
    getdata();
  });
</script>

<div class="main">
  <div class="items">
    <div class="item in_label">프로젝트명:</div>
    <input class="item in_value"  bind:value={curRow.pjtnm} />
    <div class="item in_label">기본 Encoding:</div>
    <input class="item in_value"  bind:value={curRow.encval} />
    <div title='결과값은 char(1)만 유효합니다.' class="item in_label">실패조건:</div>
    <textarea rows="2"  bind:value={curRow.sflagc} />
    <div class="item in_label">원본차이조건:</div>
    <textarea rows="2"  bind:value={curRow.diffc} />
  </div>
  <div>
    <button on:click={updateConfig}>저장</button>
  </div>
  <hr />
  <div class="items">
    <div class="item in_label "> 가상칼럼1: </div>
    <div class="item grp" >
      <input class="item in_value" style="float:left" bind:value={curRow.col1} />
      <input class="item in_value"  bind:value={curRow.col1type} />
      <input class="item in_value"  bind:value={curRow.expr1} />
      <button class="item" on:click={altercol1}>적용</button>
    </div>
    <div class="item in_label "> 가상칼럼2: </div>
    <div class="item grp" >
      <input class="item in_value" style="float:left" bind:value={curRow.col2} />
      <input class="item in_value"  bind:value={curRow.col2type} />
      <input class="item in_value"  bind:value={curRow.expr2} />
      <button class="item" on:click={altercol2}>적용</button>
    </div>
  </div>
  <hr />

</div>

<style>
  .main {
    max-height: 100%;
    overflow: auto;
  }

  .items {
    display: grid;
    grid-template-columns:  9rem 1fr ;
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
    font-weight: bold;
    vertical-align: text-bottom;
  }
  .grp {
    /* border: 1px solid rgb(235, 233, 233); */
    grid-template-columns:  10rem auto auto 6rem;
    margin: 10px 10px ;
    display: grid;
    column-gap: 10px;
    height:2.2em;
    width : 100%;
  }

  /* textarea {
    height: 50px;
    font-size: 0.8em;
  }
 */
</style>
