<script>
  // @ts-nocheck

  import Chart from "chart.js/auto";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import { onMount, onDestroy } from "svelte";
  import { rooturl, intlMs, t } from "../aqtstore";
  // 플러그인 등록
  Chart.register(ChartDataLabels);

  let { page } = $props();
  let ctx, chartx, chartCanvas;
  let setConfig = false;

  let config = {
    type: "bar",
    data: {
      datasets: [
        {
          label: $t.bar.label1, // 첫 번째 데이터셋
          backgroundColor: ["#4427ee"], // 색상
          borderRadius: 10,
        },
        {
          label: $t.bar.label2, // 두 번째 데이터셋
          backgroundColor: ["#ff6384"],
          borderRadius: 10,
        },
      ],
    },
    options: {
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            color: "white", // X축 레이블 글씨 색상 설정
          },
          grid: {
            display: true, // 그리드 표시 여부
            color: "gray", // 그리드 색상
          },
        },
        y: {
          ticks: {
            color: "white", // X축 레이블 글씨 색상 설정
          },
          grid: {
            display: true, // 그리드 표시 여부
            color: "gray", // 그리드 색상
          },
        },
      },
      plugins: {
        datalabels: {
          color: ["white"], // 텍스트 색상
          font: { size: 18 },
          formatter: function (v, ctx) {
            let num = parseFloat(v); // 안전하게 숫자로 변환

            if (!isNaN(num) && num !== 0) {
              return num.toLocaleString(); // 숫자인 경우, 천 단위 콤마 추가
            }

            return "";
          },
        },
        title: {
          display: true,
          text: "",
          font: { size: 20, weight: "normal" },
          color: "#fef9c3",
        },
        legend: {
          display: true, // 범례 표시 여부
          labels: { color: "#fff" },
          boxWidth: 14,
        },
      },
    },
  };

  export async function parentCall() {
    const rdata = await getData();
    chartDraw(rdata);
  }

  async function getData() {
    let service = "";

    if (page === "S") service = "/dashboard2/perftest_list";
    else if (page === "D") service = "/dashboard2/datatr_list";
    else if (page === "M") service = "/dashboard2/datatr_checkres";

    const res = await fetch($rooturl + service);

    if (res.ok) return await res.json();
    else throw new Error(res.statusText);
  }

  function setChartConfig(rdata) {
    if (setConfig) return;

    if (page === "S") {
      if (rdata[0].gb === "3") config.data.datasets[1].label = $t.bar.label3;
      else config.data.datasets[1].label = $t.bar.label4;

      if (rdata[0].gb === "3") {
        if (config.data.datasets.length == 2) {
          config.data.datasets.push({
            label: $t.bar.label5, // 두 번째 데이터셋
            backgroundColor: ["#b604ce"],
            borderRadius: 10,
          });
          config.data.datasets.push({
            label: $t.bar.label6, // 두 번째 데이터셋
            backgroundColor: ["#3cba9f"],
            borderRadius: 10,
          });
        }
      } else {
        if (config.data.datasets.length == 2) {
          config.data.datasets.push({
            label: $t.bar.label7, // 두 번째 데이터셋
            backgroundColor: ["#b604ce"],
            borderRadius: 10,
          });
          config.data.datasets.push({
            label: $t.bar.label6, // 두 번째 데이터셋
            backgroundColor: ["#3cba9f"],
            borderRadius: 10,
          });
        }
      }
      config.options.scales.x.stacked = true;
      config.options.scales.y.stacked = true;
      config.data.datasets[0].stack = "group1";
      config.data.datasets[1].stack = "group2";
      config.data.datasets[2].stack = "group2";
      config.data.datasets[3].stack = "group2";
      config.data.datasets[2].color = "black";
      config.options.plugins.title.text = $t.bar.title1;
    } else if (page === "D") {
      //대시보드 데이터 이행 결과
      let labels = $t.bar.dataLabels1;
      config.data.labels = labels;
      config.options.plugins.title.text = $t.bar.title2;

      // config.options.plugins.title.display = false;
    } else if (page === "M") {
      //대시보드 데이터 Value 검증
      config.data.labels = $t.bar.dataLabels2;
      config.data.datasets[0].label = $t.bar.label8;
      config.data.datasets[1].label = $t.bar.label9;
      config.options.plugins.title.text = "데이터 Value 검증 결과";
      config.data.datasets[0].barThickness = 50; // 바의 고정 넓이 (픽셀)
      config.data.datasets[1].barThickness = 50; // 바의 고정 넓이 (픽셀)
    }
    setConfig = true;
  }

  function chartDraw(rdata) {
    setChartConfig(rdata);

    if (page === "S") {
      //성능
      let apnms = [];
      let tcnts = [];
      let scnts = [];
      let delays = [];
      let nocnts = [];
      let totCnt = 0;

      rdata.forEach((element) => {
        apnms.push(element.apnm);
        tcnts.push(element.tcnt);
        scnts.push(element.scnt);
        delays.push(element.delay);
        nocnts.push(element.nocnt);
        totCnt += element.tcnt;
      });

      config.data.labels = apnms;
      config.data.datasets[0].data = tcnts;
      config.data.datasets[1].data = scnts;
      config.data.datasets[2].data = delays;
      config.data.datasets[3].data = nocnts;
    } else if (page === "D") {
      //대시보드 데이터 이행 결과
      let asiss = [
        rdata[0].tblasis,
        rdata[0].idxasis,
        rdata[0].objasis,
        rdata[0].invalidasis,
      ];

      let tobes = [
        rdata[0].tbltobe,
        rdata[0].idxTobe,
        rdata[0].objTobe,
        rdata[0].invalidtobe,
      ];

      let totCnt =
        rdata[0].tblasis +
        rdata[0].idxasis +
        rdata[0].objasis +
        rdata[0].invalidasis;
      config.data.datasets[0].data = asiss;
      config.data.datasets[1].data = tobes;
    } else if (page === "M") {
      //대시보드 데이터 Value 검증
      config.data.datasets[0].data = [rdata[0].tbltobe, 0];
      config.data.datasets[1].data = [0, rdata[0].tblasistobesum];
    }

    chartx.update();
  }

  onMount(async () => {
    ctx = chartCanvas.getContext("2d");
    chartx = new Chart(ctx, config);
    const rdata = await getData();
    chartDraw(rdata);
  });
</script>

<canvas bind:this={chartCanvas} id="myChart" class="flex"></canvas>
