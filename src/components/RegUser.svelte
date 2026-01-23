<script>
  import { onMount, tick } from "svelte";

  let rdata = [];
  let curRow = {};
  let ncount = 0 ;
  const cols = {
    chk: true,
    pkey: 0,
    usrid: "User",
    host: "Host",
    usrdesc: "사용자명",
    admin: 0,
    apps: "",
    regdt: new Date().toLocaleDateString(),
  };
  const columns = [
    " ",
    "UserId ",
    "Host",
    "사용자명",
    "Admin",
    "접근가능업무",
    "등록일",
  ];

  function updUser() {
    const upds = rdata
      .filter((r) => r.chk && r.pkey != 0)
      .map((r) => {
        delete r.chk;
        delete r.regdt;
        return r;
      });
    const inss = rdata
      .filter((r) => r.chk && r.pkey == 0)
      .map((r) => {
        delete r.chk;
        delete r.regdt;
        return r;
      });
    // console.log("upds:", upds);
    fetch("/tuser", {
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

  function delUser() {
    const delcodes = rdata
      .filter((r) => r.chk && r.pkey > 0)
      .map((r) => r.pkey);

    if (delcodes.length == 0) return;
    // console.log("del code:", delcodes) ;
    fetch("/tuser", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkeys: delcodes,
      }),
    })
      .then(async (res) => {
//        let rmsg = await res.json();
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
    const res = await fetch("/tuser");
    if (res.status === 200) {
      const rows = await res.json();
      rdata = rows.map((r) => {
        r.chk = false;
        return r;
      });
    } else {
      throw new Error(res.statusText);
    }
  }

  onMount(getdata);
  let tblbody ;
  async function addRow() {
      cols.regdt = (new Date()).toLocaleString('lt') ;
      rdata = [...rdata,{...cols} ] ;

      await tick() ;
      if (tblbody) {
        const lastRow = tblbody.lastElementChild;
        lastRow.click() ;
        // 필요 시 스크롤 이동
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
  <button on:click={addRow}>추가</button>
  <button on:click={delUser}>선택삭제</button>
  <button on:click={updUser}>적용</button>
  <button on:click={getdata}>적용취소</button>
</div>
<hr />
<div class="tList">
  <table id='myTable'>
    <thead>
      <tr>
        {#each columns as column}
          <th>
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody bind:this={tblbody}>
        {#each rdata as row}
          <tr on:click={() => (curRow = row)}> 
            <td><input type="checkbox" bind:checked={row.chk} /></td>
            {#if row.pkey === 0 }
              <td tabindex="0" 
                class="usrid"
                contenteditable="true"
                style="width:10rem"
                bind:textContent={row.usrid}
              />
            {:else}
              <td class="usrid" style="width:10rem">{row.usrid}</td>
            {/if}
            <td
              class="host"
              contenteditable
              style="width:15rem"
              bind:textContent={row.host}
            />
            <td
              contenteditable
              class="usrdesc"
              style="width:20%"
              bind:textContent={row.usrdesc}
            />
            <td><input type="checkbox" bind:checked={row.admin} /></td>
            <td
              contenteditable="true"
              class="apps"
              bind:textContent={row.apps}
            />
            <td>{row.regdt}</td>
            {#if curRow === row}
              <td>◀</td>
            {/if}
          </tr>
        {/each}
    </tbody>
  </table>
</div>

<style>
  .tList {
    max-height: 80vh;
    overflow: auto;
  }
  .usrdesc {
    word-break: break-all;
  }
</style>
