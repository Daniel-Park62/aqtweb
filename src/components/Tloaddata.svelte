<script>
  import { onMount } from "svelte";
  import Tloadtable from "./Tloadtable.svelte";

  let rdata = $state([]);
  let tcode = $state("");

  const columns = [
    "TID",
    "From Date ",
    "To Date",
    "건수",
    "URI수",
    "등록일",
  ];

  async function getdata() {
    try {
      const res = await fetch("/tloaddata/summary");
      if (res.ok) {
        rdata = await res.json();
        tcode=rdata[0]?.tcode ?? "" ;
      } else {
        if (res.status === 404) throw new Error("404, Not found");
        if (res.status === 500) throw new Error("500, internal server error");
        throw new Error(res.status + ", unknown");
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  onMount(getdata);
</script>

<main class="flex flex-row h-full">
  <div class="h-full flex-[0_0_550px] ml-2 mt-3">
    <table class="w-[96%]">
    <caption class="m-2 text-xl text-left text-blue-900 shadow">원본데이터 목록</caption>
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
        {#each rdata as row}
          <tr tabindex="0"
            class={row.sflag}
            onclick={() => tcode = row.tcode }
          >
            <td class="tcode">{row.tcode}</td>
            <td class="stimef">{row.stimef}</td>
            <td class="stimet">{row.stimet}</td>
            <td class="cnt" align="right">{row.cnt}</td>
            <td class="scnt" align="right">{row.scnt}</td>
            <td class="cdate">{row.cdate}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="h-full">
    <Tloadtable tcode={tcode} />
  </div>
</main>

