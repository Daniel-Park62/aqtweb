<script>
  import { getAppid } from "../lib/Common.svelte";

  let rdata = $state([]);
  let curRow = $state({});
  let rcnt = $state(0);
  let cols = {
    chk: 1,
    pkey: 0,
    appid: "",
    svcid: "서비스",
    svckor: "한글명",
    svceng: "영문명",
    task: "",
    manager: "",
    svckind: "0",
  };
  let newRow = $state({ ...cols });
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
  const conds = $state({
    appid: "",
    svcid: "",
  });

  function updService() {
    const upds = rdata
      .filter((r) => r.chk && r.pkey != 0)
      .map((r) => {
        delete r.chk;
        return r;
      });
    const inss = rdata
      .filter((r) => r.chk && r.pkey == 0)
      .map((r) => {
        delete r.chk;
        delete r.pkey;
        return r;
      });
    // console.log(inss)     ;
    fetch("/tservice", {
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
      rcnt = rows.length;
      rdata = rows.map((r) => {
        r.chk = 0;
        return r;
      });
    } else {
      throw new Error(res.statusText);
    }
  }

  //  onMount(getdata);
</script>
<datalist id="apps">
  <option value="ATT"></option>
  <option value="BTT"></option>
  <option value="HHH"></option>
  <option value="PPP"></option>
</datalist>

<main class="h-full w-full box-border">
  <div class="flex justify-start gap-2 m-2 p-2 shadow">
    <button
      onclick={() => {
        newRow.appid = curRow.appid;
        rdata = [{ ...newRow }, ...rdata];
        newRow = { ...cols };
        newRow.appid = curRow.appid;
      }}>추가</button
    >
    <button class="btn-delete" onclick={delService}>선택삭제</button>
    <button onclick={updService}>적용</button>
    <button onclick={getdata}>적용취소</button>
    <label>APPID : <input type="text" bind:value={conds.appid} ></label>
    <label>서비스(URI) : <input type="text" bind:value={conds.svcid} ></label>
    <button class="ml-auto" onclick={getdata}>조회</button>
    <label class="mr-3">{rcnt > 0 ? rcnt.toLocaleString("ko-KR") + " 건" : " "}</label>
  </div>
  <div class="h-[80vh] w-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] ">
    <table class="w-[98%] ">
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
          <tr><td>...waiting</td></tr>
        {:then rows}
          {#each rows as row}
            <tr tabindex="0" onclick={() => curRow = row }>
              <td><input type="checkbox" bind:checked={row.chk} /></td>
              {#if row.pkey === 0}
                <td class="w-[14ch]">
                  <select class="border-none w-full" bind:value={row.appid}>
                    {#each getAppid() as r}
                    <option value={r.value}>
                      {r.name}
                    </option>
                    {/each}
                  </select>
                </td>
                <td
                  class="w-[20rem] text-left"
                  contenteditable="true"
                  bind:textContent={row.svcid}
                ></td>
              {:else}
                <td class="w-[10ch]">{row.appid}</td>
                <td class="svcid w-[20rem]">{row.svcid}</td>
              {/if}
              <td
                contenteditable="true"
                class="w-[20%]"
                bind:textContent={row.svckor}
              ></td>
              <td
                contenteditable="true"
                bind:textContent={row.svceng}
                class="w-[20%]"
              ></td>
              <td
                contenteditable="false"
                class="task"
                bind:textContent={row.task}
              ></td>
              <td
                contenteditable="true"
                bind:textContent={row.manager}
              ></td>
              <td
                contenteditable="true"
                bind:textContent={row.svckind}
              ></td>
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
  div > button {
    @apply w-24
  }

</style>
