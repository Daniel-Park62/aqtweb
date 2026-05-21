<script lang="ts">
  // @ts-nocheck

  import Chart, { Legend } from "chart.js/auto";
  import { onMount } from "svelte";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import { rooturl } from "../aqtstore";

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
            "#b604ce",
            "#3cba9f",
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
          font: { size: 22 }, // % 문자가 들어가므로 크기를 살짝 조절(기존 25)
          textAlign: "center", // 줄바꿈 처리를 위해 중앙 정렬 추가
          formatter: function (v, context) {
            let num = parseFloat(v); // 안전하게 숫자로 변환

            if (!isNaN(num) && num !== 0) {
              // 1. 현재 데이터의 인덱스 확인 및 라벨 가져오기
              const index = context.dataIndex;
              const label = context.chart.data.labels[index];

              // 2. '완료' 항목일 경우 건수와 퍼센트 같이 표시
              if (label === "완료") {
                // 전체 데이터 배열
                const dataArr = context.chart.data.datasets[0].data;
                // 전체 합계 계산
                const total = dataArr.reduce((a, b) => a + parseFloat(b || 0), 0);
                // 퍼센트 계산 (소수점 첫째 자리까지 표기 예시)
                const percentage = total > 0 ? ((num / total) * 100).toFixed(1) : 0;
                
                // 건수와 퍼센트를 줄바꿈(\n)으로 리턴 (차트 안에 이쁘게 배치됨)
                return `${num.toLocaleString()}건\n(${percentage}%)`;
              }

              // 3. '완료'가 아닌 나머지 항목은 기존처럼 건수만 표시
              return num.toLocaleString(); 
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

    if (page === "T") service = "/dashboard2/perftest_checkres";
    if (page === "S") service = "/dashboard2/perftest_checkres2";

    const res = await fetch($rooturl + service);

    if (res.ok) return await res.json();
    else throw new Error(res.statusText);
  }

  function setChartConfig(rdata) {
    if (setConfig) return;

    let labels = [];

    if (page === "S") {
      labels = ["완료", "오류", "미테스트"];
    } else {
      labels = ["완료", "오류", "미전환"];
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
    } else {
      datas = [rdata[0].scnt, rdata[0].nocnt, rdata[0].delay];
    }
    
    let totCnt = rdata[0].tcnt.toLocaleString();

    config.data.datasets[0].data = datas;
    config.options.plugins.title.text = (title === undefined ? "" : title) + " 대상 " + totCnt + "건";
    chartx.update();
  }

  onMount(async () => {
    ctx = chartCanvas.getContext("2d");
    chartx = new Chart(ctx, config);
    await parentCall();
  });
</script>

<canvas bind:this={chartCanvas} id="myChart"></canvas>