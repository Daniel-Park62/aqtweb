<!-- 테스트 사용자 프로그램 등록 -->
<script>
  import { onMount, tick } from "svelte";
  import * as tprog from "../model/taqtprog";
  import Modal from "../lib/Modal2.svelte";
  const pgbm = { 1:"테스트전",2:"요청전",3:"응답후",4:"테스트후" } ;
  let rcnt = $state(0);
  const cols = {
    chk: true,
    progno: 0,
    nm: "프로그램명입력",
    pgb: "1",
    pgkind: 1,
    src: "",
  };
  let rdata = $state([{ ...cols }]);
  let curRow = $state({});
  let showModal = $state(false);

  async function save() {
    try {
      const res = await tprog.save(rdata);
      alert(res.message);
      getdata();
    } catch (err) {
      alert("error:" + err.message);
    }
  }

  async function erase() {
    const delcodes = rdata
      .filter((r) => r.chk && r.progno > 0)
      .map((r) => r.progno);

    if (delcodes.length == 0) return;
    // console.log("del code:", delcodes) ;
    try {
      const res = await tprog.erase(delcodes);
      alert("정상 삭제되었습니다");
      getdata();
    } catch (err) {
      throw err;
    }
  }
  async function getdata() {
    try {
      const rows = await tprog.getdata();
      rdata = rows.map((r) => ({ ...r, chk: false }));
      rcnt = rdata.length;
    } catch (error) {
      alert("error:" + error.message);
    }
  }

  let tblbody = $state();

  async function addRow() {
    rdata = [...rdata, { ...cols }];
    await tick();

    if (tblbody) {
      const lastRow = tblbody.lastElementChild;

      await lastRow.click();
      lastRow.focus();
      // 필요 시 스크롤 이동
      lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  onMount(getdata);

</script>

<main class="h-full">
  <div class="headpan w-[98%]">
    <button onclick={addRow}>추가</button>
    <button class="btn-delete" onclick={erase}>선택삭제</button>
    <button class="btn-update" onclick={save}>선택수정</button>
    <button class="ml-auto" onclick={getdata}>조회</button>
    <span class="mr-3"
      >{rcnt > 0 ? rcnt.toLocaleString("ko-KR") + " 건" : " "}</span
    >
  </div>

  <div
    class="flex-[1_1_0] h-[calc(100%-50px)] w-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
  >
    <table class="table-fixed w-[98%]">
      <thead>
        <tr>
          <th class="w-[1.5cm]">선택</th>
          <th class="w-[160px]">수행구분</th>
          <th class="w-[140px]">Language</th>
          <th class="w-[40ch]">프로그램설명</th>
          <th >수행코드내용</th>
        </tr>
      </thead>
      <tbody bind:this={tblbody}>
        {#await rdata}
          <tr><td>...waiting</td></tr>
        {:then rows}
          {#each rows as row, ix}
            <tr tabindex="0">
              <td class="align-middle"
                ><input
                  disabled={row.progno == 0}
                  type="checkbox"
                  bind:checked={row.chk}
                /></td
              >
              <td class="align-middle">
                <select 
                  class="my-0 bg-transparent border-none"
                  onchange={() => (row.chk = true)}
                  bind:value={row.pgb}
                >
                  {#each Object.entries(pgbm) as [key, value]}
                    <option value={key}>{key}:{value}</option>
                  {/each}
                </select>
              </td>
              <td class="border align-middle ">
                 <div
                  class="w-fit flex justify-center items-center border-0 whitespace-nowrap gap-2 text-center"
                >
                  <span >JS<input
                    class="radio radio-accent w-6 align-middle"
                    type="radio"
                    name={ix.toString()}
                    bind:group={row.pgkind}
                    value={1}
                    onchange={() => row.chk = true}
                  /></span>
                  <span>C<input
                    class="radio radio-accent w-6 align-middle"
                    type="radio"
                    name={ix.toString()}
                    bind:group={row.pgkind}
                    value={2}
                    onchange={() => row.chk = true}
                  /></span>
                </div>
              </td>
              <td class="align-middle">
                <input
                  class="w-[40ch] my-0 bg-transparent border-none"
                  onchange={() => (row.chk = true)}
                  bind:value={row.nm}
                />
              </td>
              <td class="flex items-end">
                <input
                  readonly
                  class="my-0 bg-transparent border-none"
                  bind:value={row.src}
                />
                <button class="ml-auto p-1 bg-blue-50 hover:bg-blue-100 rounded h-6 w-6 " 
                  onclick={() => {curRow=row; showModal=true;}}>
                  ..
                </button>
              </td>
            </tr>
          {/each}
          {/await}
      </tbody>
    </table>
  </div>
  <Modal bind:showModal wd="80vw">
    <div class="flex justify-start gap-3 items-baseline">
      <span class="border-l-4 border-indigo-700 text-lg bg-gray-100  m-1 px-3">{curRow.nm}</span>
      <span class="ml-auto mr-4">
      {#if curRow.pgb === '1' }
        ** 요청/응답에 사용될 Object return 
      {:else if curRow.pgb < '4' }
        ** 인수: xargs &#123; sdata, stime, ... &#125,fargs [ ex: xargs.sdata ] 
      {/if}
      </span></div>
    <textarea class="h-[94%] w-full p-2 overflow-auto " onchange={() => (curRow.chk = true)} bind:value={curRow.src}></textarea>
  </Modal>
</main>
