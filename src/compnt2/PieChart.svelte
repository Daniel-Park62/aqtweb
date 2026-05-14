<script lang="ts">
  // @ts-nocheck

  import Chart, { Legend } from "chart.js/auto";
  import { onMount } from "svelte";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import { rooturl, intlMs, t } from "../aqtstore";

  // 플러그인 등록
  Chart.register(ChartDataLabels);

  let { page, selData, title } = $props();
  let ctx, chartx, chartCanvas;
  let setConfig = false;

  let marginLegend = {
    id: "marginLegend",
    beforeInit(chart, legend, options) {
      console.log(chart.legend.fit);
      const fitValue = chart.legend.fit;

      chart.legend.fit = function fit() {
        fitValue.bind(chart.legend)();
        // return this.width +=50;
      };
    },
  };

  let config = {
    type: "pie",
    dispatchEvent,
    alert: "items-center",
    data: {
      labels: [],
      datasets: [
        {
          backgroundColor: [
            "#ff6384",
            "#3cba9f",
            "#b604ce",
            "#e8c3b9",
            "#c45850",
          ],
          data: [],
          borderWidth: 0,
        },
      ],
    },

    options: {
      // responsive: true,
      // maintainAspectRatio: true,
      // aspectRatio: 1,
      plugins: {
        legend: {
          display: true,
          rtl: true,
          position: "right",
          labels: {
            color: "white",
            boxWidth: 16,
            font: {
              size: 16, // 범례 폰트 크기 조정
            },
          },
        },
        title: {
          display: true,
          text: "",
          font: { size: 20, weight: "normal" },
          color: "#fef9c3",
        },
        datalabels: {
          color: "white", // 텍스트 색상
          font: { size: 25 },
          formatter: function (v, ctx) {
            let num = parseFloat(v); // 안전하게 숫자로 변환

            if (!isNaN(num) && num !== 0) {
              return num.toLocaleString(); // 숫자인 경우, 천 단위 콤마 추가
            }

            return "";
          },
        },
        layout: {
          margin: {
            left: 100, // 차트와 범례 사이의 여백 설정
          },
        },
      },
      // plugins:[marginLegend],
    },
  };

  export async function parentCall() {
    const rdata = await getData();
    chartDraw(rdata);
  }

  async function getData() {
    let service = "";

    if (page === "S") service = "/dashboard2/perftest_checkres";
    if (page === "P")
      service = "/performcomposit/perfcomp_checkres?tid=" + selData.tid;
    if (page === "T")
      service = "/testcomposit/testcomp_checkres?tid=" + selData.tid;

    const res = await fetch($rooturl + service);

    if (res.ok) return await res.json();
    else throw new Error(res.statusText);
  }

  function setChartConfig(rdata) {
    if (setConfig) return;

    let labels = [];

    if (page === "S") {
      //dashboard
      if (rdata[0].gb === "3") {
        labels = $t.pie.pLabels;
      } else {
        labels = $t.pie.tLabels;
      }
    } else if (page === "P") {
      labels = $t.pie.pLabels;
    } else if (page === "T") {
      labels = $t.pie.tLabels;
    }
    config.data.labels = labels;
    setConfig = true;
  }

  function chartDraw(rdata) {
    setChartConfig(rdata);
    let labels = [];
    let datas = [];

    if (page === "S") {
      datas = [rdata[0].scnt, rdata[0].nocnt, rdata[0].delay];
    } else if (page === "P") {
      //성능
      datas = [rdata[0].scnt, rdata[0].nocnt, rdata[0].delay];
    } else {
      //테스트
      datas = [rdata[0].scnt, rdata[0].nocnt, rdata[0].fcnt];
    }
    let totCnt = rdata[0].tcnt;

    config.data.datasets[0].data = datas;
    config.options.plugins.title.text =
      (title === undefined ? "" : title) +
      " " +
      $t.pie.target +
      totCnt +
      $t.pie.cnt;
    chartx.update();
  }

  onMount(async () => {
    ctx = chartCanvas.getContext("2d");
    chartx = new Chart(ctx, config);
    await parentCall();
  });
</script>

<canvas bind:this={chartCanvas} id="myChart"></canvas>
