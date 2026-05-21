<script>
  // @ts-nocheck

  import Chart from "chart.js/auto";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import { onMount, onDestroy } from "svelte";
  import { rooturl } from "../aqtstore";
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
          label: "대상", // 첫 번째 데이터셋 (index 0)
          backgroundColor: ["#4427ee"], // 색상
          borderRadius: 10,
        },
        {
          label: "이행", // 두 번째 데이터셋 (index 1 -> 완료)
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
          font: { size: 14 }, // 퍼센트가 추가되므로 가독성을 위해 사이즈를 살짝 조절(기존 18)
          formatter: function (v, context) {
            let num = parseFloat(v); // 안전하게 숫자로 변환

            if (isNaN(num) || num === 0) {
              return "";
            }

            // 현재 그리고 있는 데이터셋이 '완료(이행)' 데이터셋(index: 1)인 경우
            if (context.datasetIndex === 1) {
              // 같은 인덱스의 '대상' 데이터셋 값 가져오기
              const targetDataset = context.chart.data.datasets[0];
              const targetValue = parseFloat(targetDataset.data[context.dataIndex]);

              if (!isNaN(targetValue) && targetValue > 0) {
                // 퍼센트 계산 (소수점 첫째 자리까지 표시)
                const percentage = ((num / targetValue) * 100).toFixed(1);
                return `${num.toLocaleString()}\n(${percentage}%)`;
              }
            }

            // 기본 '대상' 및 '오류' 데이터셋은 숫자만 표시
            return num.toLocaleString();
          },
          // 건수와 퍼센트를 줄바꿈(\n) 표시하기 위해 텍스트 정렬 설정
          textAlign: "center", 
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

    if (page === "T") service = "/dashboard2/perftest_list";
    else if (page === "S") service = "/dashboard2/perftest_list2";

    const res = await fetch($rooturl + service);

    if (res.ok) return await res.json();
    else throw new Error(res.statusText);
  }

  function setChartConfig(rdata) {
    if (setConfig) return;

    if (page === "S") {
      config.data.datasets[1].label = "완료";

      if (config.data.datasets.length == 2) {
        config.data.datasets.push({
          label: "오류", // 두 번째 데이터셋
          backgroundColor: ["#b604ce"],
          borderRadius: 10,
        });
      }

      config.options.scales.x.stacked = true;
      config.options.scales.y.stacked = true;

      config.data.datasets[0].stack = "group1";
      config.data.datasets[1].stack = "group2";
      config.data.datasets[2].stack = "group2";
      config.data.datasets[2].color = "black";

      config.options.plugins.title.text = "업무별 테스트 진행 현황";
    } else if (page === "T") {
      config.data.datasets[1].label = "완료";

      if (config.data.datasets.length == 2) {
        config.data.datasets.push({
          label: "오류", // 두 번째 데이터셋
          backgroundColor: ["#b604ce"],
          borderRadius: 10,
        });
      }

      config.options.scales.x.stacked = true;
      config.options.scales.y.stacked = true;

      config.data.datasets[0].stack = "group1";
      config.data.datasets[1].stack = "group2";
      config.data.datasets[2].stack = "group2";

      config.data.datasets[2].color = "black";
      
      config.options.plugins.title.text = "업무별 전환 진행 현황";
    }
    setConfig = true;
  }

  function chartDraw(rdata) {
    setChartConfig(rdata);

    if (page === "S" || page === "T") {
      let apnms = [];
      let tcnts = [];
      let scnts = [];
      let nocnts = [];
      let totCnt = 0;

      rdata.forEach((element) => {
        apnms.push(element.apnm);
        tcnts.push(element.tcnt);
        scnts.push(element.scnt);
        nocnts.push(element.nocnt);
        totCnt += element.tcnt;
      });

      config.data.labels = apnms;
      config.data.datasets[0].data = tcnts;
      config.data.datasets[1].data = scnts;
      config.data.datasets[2].data = nocnts;
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