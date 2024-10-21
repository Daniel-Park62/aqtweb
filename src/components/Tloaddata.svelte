<script>
  import { onMount } from "svelte";

  let rdata = Promise.resolve([]);
  let tcode = '';

  const columns = [
    "테스트ID",
    "From Date ",
    "To Date",
    "데이터건수",
    "서비스 수",
    "등록일",
  ];

  async function getdata() {
    try {
      const res = await fetch("/tloaddata/summary");
      if (res.ok) {
        rdata = await res.json();
      } else {
        if (res.status === 404) throw new Error('404, Not found');
        if (res.status === 500) throw new Error('500, internal server error');
        throw new Error(res.status + ', unknown');
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  //  onMount(getdata);
</script>

<div id="btns" style="display:flex; justify-content: flex-start; ">
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
        {#each rows as row}
        <tr
            class={row.sflag}
            on:dblclick={() => {
              tcode = row.tcode;
            }}
          >
        <td class="tcode">{row.tcode}</td>
        <td class="stimef">{row.stimef}</td>
        <td class="stimet">{row.stimet}</td>
        <td class="cnt" align="right">{row.cnt}</td>
        <td class="scnt"  align="right">{row.scnt}</td>
        <td class="cdate">{row.cdate}</td>
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
  table {
    height: auto;
    border-collapse: collapse;
    overflow: auto;
  }

  td,
  th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
  }

  td {
    overflow: hidden;
    white-space: wrap;
    text-overflow: clip;
    font-size: 0.9rem;
  }

  th {
    background-color: var(--th_bgcolor);
    color: var(--th_color);
  }
  #btns * {
    margin: 2px 8px;
    height: 1.7em;
  }
  /* tbody tr:nth-child(odd) td {
	background-color: #fafbff;
} */

  thead th:first-child {
    border-top-left-radius: 5px;
  }

  thead th:last-child {
    border-top-right-radius: 5px;
  }
  .tList th {
    text-align: center;
    position: sticky;
    top: 0;
  }
  tbody tr:last-child td:first-child {
    border-bottom-left-radius: 5px;
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: 5px;
  }

  tbody tr:hover {
    background-color: #ddd;
  }

</style>
