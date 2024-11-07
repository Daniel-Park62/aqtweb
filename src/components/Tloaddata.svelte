<script>
  import { onMount } from "svelte";
  import Tloadtable from "./Tloadtable.svelte";

  let rdata = [];
  let tcode = "";

  const columns = [
    "TID",
    "From Date ",
    "To Date",
    "건수",
    "URI수",
    "등록일",
  ];
  let sv_row;

  async function getdata() {
    try {
      const res = await fetch("/tloaddata/summary");
      if (res.ok) {
        rdata = await res.json();
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

<div class="tList">
  <div class="item">
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
        {#each rdata as row}
          <tr
            class={row.sflag}
            on:click={(event) => {
              tcode = row.tcode;
              if (sv_row) sv_row.classList.remove("row-selected");
              sv_row = event.target.parentElement.cells[0];
              sv_row.classList.toggle("row-selected");
            }}
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
  <div class="item">
    <Tloadtable bind:tcode />
  </div>
</div>

<style>
  .tList {
    /* max-height: 85vh; */
    /* overflow: auto; */
    display: flex;
  }
  .item {
    max-height: 85vh;
    border-collapse: collapse;
    overflow: auto;
  }
  .item:nth-child(1) {
    flex: 0 0 550px;
  }
  table {
    width : 96%;
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
  /* tbody tr:nth-child(odd) td {
	background-color: #fafbff;
} */

  .row-selected {
    background-color: #f8c;
  }
</style>
