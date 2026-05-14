<script lang="ts">
  // @ts-nocheck

  import BarChart from "./BarChart.svelte";
  import PieChart from "./PieChart.svelte";
  import { onMount } from "svelte";
  import { rooturl, t } from "../aqtstore";

  let isLoading: boolean = true;
  let rdata: null = null;

  async function getData() {
    try {
      const res = await fetch($rooturl + "/dashboard2");
      if (res.ok) return await res.json();
      else throw new Error(res.statusText);
    } catch (error) {
      alert(error);
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    rdata = await getData();
  });
</script>

<div class="mx-auto p-3 w-10/12 h-5/6">
  <div class="flex flex-col max-h-svh">
    {#if rdata}
      <div class=" bg-gray-700 rounded-lg">
        <div class="flex w-full bg-white items-center h-8">
          <h1 class="w-3/5 text-2xl tracking-tight p-3 text-left h-14">
            {$t.dash.testTitle}
          </h1>
          <h1 class="w-2/5 text-1xl tracking-tight text-end p-3 h-14">
            {$t.dash.date}
          </h1>
        </div>
        <div class="flex justify-between w-full p-3">
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center"
          >
            <div class="size-[320px]">
              <PieChart
                page={"S"}
                selData={rdata[0]}
                title={rdata[0]?.performnm}
              ></PieChart>
            </div>
          </div>
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center"
          >
            <BarChart page={"S"}></BarChart>
          </div>
        </div>
      </div>
      <div class="bg-gray-700 mt-3 rounded-lg">
        <!--
        <div
          class="flex w-full border-b-2 border-gray-500 items-center text-yellow-100"
        >
          <h1 class="w-3/5 text-2xl tracking-tight p-3">
            {$t.dash.dataTitle}
            {rdata[0]?.dataverifynm}
          </h1>
          <h1 class="text-1xl w-full text-end tracking-tight p-3">
            {$t.dash.date}
            {rdata[0]?.dataverifydt}
          </h1>
        </div>
-->
        <div class="flex justify-between w-full p-3">
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center"
          >
            <div class="size-[320px]">
              <PieChart
                page={"S"}
                selData={rdata[0]}
                title={rdata[0]?.performnm}
              ></PieChart>
            </div>
          </div>
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center"
          >
            <BarChart page={"S"}></BarChart>
          </div>
        </div>
        <!--
        <div class="flex justify-between w-full p-3">
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 justify-center mx-1"
          >
            <BarChart page={"D"}></BarChart>
          </div>
          <div
            class="flex bg-gray-800 px-12 rounded-lg w-1/2 justify-center mx-1"
          >
            <BarChart page={"M"}></BarChart>
          </div>
        </div>
-->
      </div>
    {/if}
  </div>
</div>

<style>
</style>
