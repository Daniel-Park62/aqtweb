<script>
  import { onMount } from "svelte";

  let rdata = [];
  let curRow = {};
  let cols = {
    chk : 1,
    pkey : 0,
    appid : "",
    svcid : "서비스",
    svckor : "한글명",
    svceng : "영문명",
    task : "",
    manager : "",
    svckind : "0",
  };
  let newRow = {...cols};
  const columns = [
    " ",
    "APID ",
    "서비스(URI)",
    "서비스명(한글)",
    "서비스명(영문)",
    "업무명",
    "담당자",
    "서비스종류",
  ];
  const conds = {
    appid : '',
    svcid : ''
  };

  function insService() {
    const inss = newRow.slice(2);
    
    fetch("/tservice", {
      method: "POST" ,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ins: inss
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

  function updService() {
    const upds = rdata.filter((r) => ( r.chk && r.pkey != 0) ).map((r) => {delete r.chk; return r;});
    const inss = rdata.filter((r) => ( r.chk && r.pkey == 0) ).map((r) => {delete r.chk; delete r.pkey; return r;});
  // console.log(inss)     ;
    fetch("/tservice", {
      method: "POST" ,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upd: upds,
        ins: inss
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
    const delcodes = rdata.filter((r) => (r.chk && r.pkey > 0) ).map((r) => r.pkey);

    if (delcodes.length == 0) return;
    // console.log("del code:", delcodes) ;
    fetch("/tservice", {
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
//    const res = await fetch("/tservice");
const res = await fetch("/tservice/part", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.status === 200) {
      const rows = await res.json();
      rdata = rows.map( r => {r.chk = 0; return r}) ;
    } else {
      throw new Error(res.statusText);
    }
  }

//  onMount(getdata);
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
  <button on:click={() => {
    newRow.appid = curRow.appid ;
    rdata = [{...newRow}, ...rdata]; 
    newRow = {...cols};newRow.appid = curRow.appid }}>추가</button>
  <button on:click={delService}>선택삭제</button>
  <button on:click={updService}>적용</button>
  <button on:click={getdata}>적용취소</button>
  <span>APPID : <input type="text" bind:value={conds.appid} /></span>
  <span>서비스(URI) : <input type="text" bind:value={conds.svcid} /></span>
  <button style="margin-left: auto" on:click={getdata}>조회</button>
</div>
<hr />
<div class="tList">
  <table>
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
      {#await rdata}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row }
          <tr
            on:click={() => (curRow = row)}
          >
            <td><input type="checkbox" bind:checked={row.chk} /></td>
            {#if row.pkey === 0}
            <td class="appid" contenteditable="true" bind:textContent={row.appid} />
            <td class="svcid" contenteditable="true" style="width:20rem ;text-align:left" bind:textContent={row.svcid}/>
            {:else}
            <td class="appid" >{row.appid}</td>
            <td class="svcid" style="width:20rem">{row.svcid}</td>
            {/if}
            <td
              contenteditable="true"
              class="svckor"
              style="width:20%"
              bind:textContent={row.svckor}/>
            <td contenteditable="true" bind:textContent={row.svceng} class="svceng" style="width:20%" />
            <td contenteditable="false" class="task" bind:textContent={row.task}/>
            <td contenteditable="true" class="manager" bind:textContent={row.manager}/>
            <td contenteditable="true" class="svckind" bind:textContent={row.svckind} />
            {#if curRow === row}
              <td>◀</td>
            {/if}
          </tr>
        {/each}
      {:catch err}
        <p style="color: red">{err.message}</p>
      {/await}
    </tbody>
  </table>
</div>

<style>
  .tList {
    max-height: 80vh;
    overflow: auto;
  }

  #btns * {
    margin: 2px 8px;
    height: 1.7em;
  }  

  .svcid, .svckor, .svceng {
    word-break:break-all;
  }
</style>
