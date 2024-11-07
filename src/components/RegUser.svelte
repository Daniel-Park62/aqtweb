<script>
  import { onMount } from "svelte";

  let rdata = [];
  let curRow = {};
  let cols = [true,0, "User","Host", "사용자명",false,"",(new Date()).toLocaleDateString()];
  let newRow = [...cols];
  const columns = [
    " ",
    "UserId ",
    "Host",
    "사용자명",
    "Admin",
    "접근가능업무",
    "등록일",
  ];

  function updService() {
    const upds = rdata.filter((r) => ( r[0] && r[1] != 0) ).map((r) => [...(r.slice(2,7)),r[1] ]);
    const inss = rdata.filter((r) => ( r[0] && r[1] == 0) ).map((r) => r.slice(2,7) );
  console.log(inss)     ;
    fetch("/tuser", {
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
    const delcodes = rdata.filter((r) => (r[0] && r[1] > 0) ).map((r) => r[1]);

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
    const res = await fetch("/tuser");
    if (res.status === 200) {
      rdata = await res.json();
    } else {
      throw new Error(res.statusText);
    }
  }

  onMount(getdata);
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
  <button on:click={() => {rdata = [[...newRow], ...rdata]; newRow = cols; }}>추가</button>
  <button on:click={delService}>선택삭제</button>
  <button on:click={updService}>적용</button>
  <button on:click={getdata}>적용취소</button>
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

        {#each rdata as row }
          <tr on:click={() => (curRow = row)} >
            <td><input type="checkbox" bind:checked={row[0]} /></td>
            {#if row[1] === 0}
            <td class="usrid" contenteditable="true" style="width:10rem" bind:textContent={row[2]}/>
            {:else}
            <td class="usrid" style="width:10rem">{row[2]}</td>
            {/if}
            <td class="host" contenteditable="true" style="width:15rem" bind:textContent={row[3]}/>
            <td contenteditable="true" class="usrdesc" style="width:20%" bind:textContent={row[4]}/>
            <td><input type="checkbox" bind:checked={row[5]}/></td> 
            <td contenteditable="true" class="apps" bind:textContent={row[6]}/>
            <td>{row[7]}</td>
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
    word-break:break-all;
  }
</style>
