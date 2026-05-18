<!-- 테스트수행에 따른 프로그램 지정: texecjob 과 taqtprog 를 매핑하는 texecprog 정의 -->
<script>
  import { getdataExec, saveExec } from "../model/taqtprog";

  let { showModal = $bindable(), pkey = 0 } = $props();

  let dialog;

  const pgbm = { 1: "테스트전", 2: "요청전", 3: "응답후", 4: "테스트후" };
  const pgkindm = { 1: "JS", 2: "C", 3: "Python", 4: "Java" };
  let rcnt = $state(0);
  const cols = {
    chk: false,
    progno: 0,
    nm: "프로그램명입력",
    pgb: "1",
    pgkind: 1,
    src: "",
  };
  let rdata = $state([]);

  async function save() {
    if (rdata.length == 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }
    try {
      const res = await saveExec(pkey,rdata);
      alert(res.message);
      getdata();
    } catch (err) {
      alert("error:" + err.message);
    }
  }

  async function getdata() {
    rdata=[] ;
    try {
      const rows = await getdataExec(pkey);
      rdata = rows.map((r) => ({ ...r, chk: r.pkey > 0 }));
      rcnt = rdata.length;
    } catch (error) {
      alert("error:" + error.message);
    }
  }

  $effect(() => {
    if (dialog && showModal) {
      dialog.showModal();
      getdata();
    }
  });
</script>

<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  oncancel={() => {
    showModal = false;
  }}
>
  <div
    class="flex flex-col rounded-lg border border-gray-300 h-fit p-5"
  >
    <div class="border-l-4 border-indigo-700 pl-3 tracking-wider text-xl font-bold text-indigo-950 text-start mb-2">
      선후행프로그램선택 (Job ID:{pkey})
    </div>
    <div class="headpan w-[98%]">
      <button class="btn-update" onclick={save}>저장</button>
      <button onclick={getdata}>조회</button>
      <button class="btn-close ml-auto" onclick={() => dialog.close()}
        >닫기</button
      >
    </div>

    <div
      class="flex-1 h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
    >
      <table class="table-fixed w-[98%]">
        <thead>
          <tr>
            <th class="w-[1.5cm]">선택</th>
            <th class="w-[40ch]">프로그램명</th>
            <th class="w-[10ch]">Language</th>
            <th class="w-[30ch]">수행구분</th>
            <th>수행코드내용</th>
          </tr>
        </thead>
        <tbody>
          {#await rdata}
            <tr><td>...waiting</td></tr>
          {:then rows}
            {#each rows as row}
              <tr tabindex="0">
                <td class="align-middle"
                  ><input type="checkbox" bind:checked={row.chk} /></td
                >
                <td>
                  {row.nm}
                </td>
                <td class="align-middle">
                  {pgkindm[row.pgkind]}
                </td>
                <td class="align-middle">
                  {pgbm[row.pgb]}
                </td>
                <td class="text-nowrap text-start">
                  {row.src}
                </td>
              </tr>
            {/each}
          {/await}
        </tbody>
      </table>
    </div>
  </div>
</dialog>

<style>
  dialog {
    @apply rounded-lg border border-gray-300 w-[70%] h-fit max-h-[70%];
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
</style>
