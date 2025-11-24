<script>
  import { onMount } from "svelte";
  import { getLvlnm } from "./Common.svelte" ;

  export let task = "";
  export let lvl = '';
  export let ischg = 1;
  let sv_row ;
  function clickRow(e, row) {
    if (sv_row) sv_row.classList.remove("bg-teal-100");
    sv_row = e.target.parentElement;
    sv_row.classList.toggle("bg-teal-100");
  }

  let promise = Promise.resolve([]);
  onMount(async () => {
    const res = await fetch( "/byservice");
    promise = await res.json();
  });

</script>

<div class="container">
  <table class="tcode-status">
    <thead>
      <tr>
        <th>업무명</th>
        <th>단계</th>
        <th>서비스수</th>
        <th>실패서비스</th>
        <th>패킷건수</th>
        <th>성공건수</th>
        <th>실패서비스</th>
        <th>성공율(%)</th>
        <th>미수행건수</th>
      </tr>
    </thead>
    <tbody>
      {#await promise}
        <p>...waiting</p>
      {:then rows}
        {#each rows as row}
          <tr on:click={(e) => {
              ischg=0;
              if (task != row.task || lvl != row.lvl) {
                ischg=1;
                task = row.task; lvl = row.lvl ; 
              };
              clickRow(e,row) ;
          }} >
            <td>{row.task}</td>
            <td>{getLvlnm(row.lvl)}</td>
            <td align="right">{row.svc_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.fsvc_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.data_cnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.scnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.fcnt.toLocaleString("ko-KR")}</td>
            <td align="right">{row.srate }</td>
            <td align="right">{(row.data_cnt - row.scnt - row.fcnt).toLocaleString("ko-KR")}</td>
          </tr>
        {/each}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
    </tbody>
  </table>
</div>

<style>
  /* .title {
    text-align: justify;
  } */

  /* .container {
    height: auto;
    overflow: auto;
  } */
  .tcode-status {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
/*
  .tcode-status td,
  .tcode-status th {
    border: 1px solid rgb(214, 214, 230);
    padding: 5px;
  }

  .tcode-status th {
    text-align: center;
    position: sticky;
    top: 0;
  }

  .tcode-status tr:hover {
    background-color: #ddd;
  }
  */
</style>
