<script lang="ts">
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
        if (res.ok) {
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
        if (res.ok) {
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
    if (res.status < 400) {
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
  <div class="headpan ">
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
    <!-- <span>APPID : <input type="text" bind:value={conds.appid} ></span> -->
    <span>APPID :  <select   bind:value={conds.appid}>
          <option value="">모두조회</option>
        {#each getAppid() as r}
            <option value={'^'+ r.appid + '$'}>
              {r.appname}
            </option>
          {/each}
               </select></span>
    <span>서비스(URI) : <input type="text" bind:value={conds.svcid} ></span>
    <button class="ml-auto" onclick={getdata}>조회</button>
    <span class="mr-3">{rcnt > 0 ? rcnt.toLocaleString("ko-KR") + " 건" : " "}</span>
  </div>
  <div class="flex-[1_1_0] h-[calc(100%-50px)] w-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] ">
    <table class="w-[99%] ">
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
        <!-- {#await rdata}
          <tr><td>...waiting</td></tr>
        {:then rows} -->
          {#each rdata as row, ix}
            <tr tabindex="0" onclick={() => curRow = row }>
              <td><input type="checkbox" bind:checked={row.chk} /></td>
              {#if row.pkey === 0}
                <td class="w-[20ch]">
                  <select class="border-none w-full" bind:value={row.appid}>
                    {#each getAppid() as r}
                    <option value={r.appid}>
                      {r.appname}
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
                contenteditable="true"
                bind:textContent={row.manager}
              ></td>
              <td>
                 <div
                  class="w-fit flex justify-center items-center border-0 whitespace-nowrap gap-2 text-center"
                >
                  <span >TCP<input class="radio radio-accent w-6 align-middle"  type="radio"
                    name={ix.toString()}
                    bind:group={row.svckind}
                    value={'0'}
                    onchange={() => row.chk = true}
                  /></span>
                  <span>HTTP<input class="radio radio-accent w-6 align-middle" type="radio"    name={ix.toString()}
                    bind:group={row.svckind}
                    value={'1'}
                    onchange={() => row.chk = true}
                  /></span>
                  <span>UDP<input class="radio radio-accent w-6 align-middle" type="radio"    name={ix.toString()}
                    bind:group={row.svckind}
                    value={'2'}
                    onchange={() => row.chk = true}
                  /></span>
                  <span>TMAX<input class="radio radio-accent w-6 align-middle" type="radio"    name={ix.toString()}
                    bind:group={row.svckind}
                    value={'3'}
                    onchange={() => row.chk = true}
                  /></span>
                </div>
              </td>
            </tr>
          {/each}
        <!-- {:catch err}
          <p style="color: red">{err.message}</p>
        {/await} -->
      </tbody>
    </table>
  </div>
</main>

<style>
  div > button {
    @apply w-24
  }

</style>
