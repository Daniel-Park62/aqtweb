<script lang="ts">
  // @ts-nocheck

  import BarChart from "./BarChart.svelte";
  import PieChart from "./PieChart.svelte";
  import { onMount } from "svelte";
  import { rooturl } from "../aqtstore";

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
  <div class="flex flex-col max-h-svh p-8">
    {#if rdata}
      <div class=" bg-gray-700 rounded-lg">
        <div class="flex w-full items-center h-8 rounded-lg">
        </div>
        <div class="flex justify-between w-full p-3 rounded-lg">
          <div class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center">
            <div class="size-[320px]">
              <PieChart page={"T"} selData={rdata[0]} title=전환></PieChart>
            </div>
          </div>
          <div class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center">
            <BarChart page={"T"}></BarChart>
          </div>
        </div>
      </div>
      <div class="bg-gray-700 mt-3 rounded-lg">
        <div class="flex w-full items-center h-8 rounded-lg">
        </div>
        <div class="flex justify-between w-full p-3">
          <div class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center">
            <div class="size-[320px]">
              <PieChart page={"S"} selData={rdata[0]} title=테스트></PieChart>
            </div>
          </div>
          <div class="flex bg-gray-800 px-12 rounded-lg w-1/2 mx-1 justify-center">
            <BarChart page={"S"}></BarChart>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
</style>
