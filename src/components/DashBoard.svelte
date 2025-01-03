<script>
  import { onMount, afterUpdate, beforeUpdate } from "svelte";
  import TidList from "./TidList.svelte";

  import { Doughnut } from "svelte-chartjs";
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale
  } from "chart.js";

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels );
  ChartJS.register({
  id: "doughnutInnerText",
  afterDraw: (chart, args, options) => {
    const width = chart.width,
      height = chart.height,
      ctx = chart.ctx;
    ctx.restore();
    const fontSize = 18 // (height / 160).toFixed(2);
    ctx.font = "13px Arial";
    ctx.textBaseline = "top";
    const espnVal = "누적진척율:" 
              + (data.datasets[0].data[0] * 100 / (data.datasets[0].data[0] + data.datasets[0].data[1])).toFixed(2) + "%"; 
    if (espnVal) {
      const textX = Math.round((width - ctx.measureText(espnVal).width) / 2),
      textY = height / 1.3;
      ctx.fillText(espnVal, textX, textY);
      // console.log("espnVal", espnVal, textX, textY) ;
    }
    ctx.save();
  },
});

  const options = {
    responsive: false,
    plugins: {
      doughnutInnerText: {
            myVal: "88 %",
            fontSize: 11
          },
      legend: {
        display: false,
      },
      tooltip:{
        enabled:false
      },
      title: {
        display: false,
        text: '전체누적진척율',
        fontSize: 11,
      },
      datalabels: {
        color: 'black',
        display: true,
        font: {
          weight: 'bold',
          size: 10
        },
        formatter: function(v,ctx) {
          return ctx.chart.data.labels[ctx.dataIndex] + v + " 건" ;
        },
      }
    },
    maintainAspectRatio: false,
    animation: false,
  };

  const data = {
    labels: ["수행서비스\n", "미수행서비스\n"],
    datasets: [
      {
        data: [300, 50],
        backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C"],
        hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870"],
        circumference: 180, // 도넛 반 자르기
        rotation: 270,
      },
    ],
  };

  let tick = 0;
  setInterval(() => {
    tick += 1;
  }, 5000);

  $: getdata(tick);

  let tcode;
  let svccnt = 999;
  let datas = {
    svccnt: 0,
    rows: [
      { lvl: "1", svc_cnt: 0 },
      { lvl: "2", svc_cnt: 0 },
    ],
  };

  async function getdata(x = 0) {
    //    try {
    const res = await fetch("/dashboard/summary");

    datas = await res.json();

    if (res.ok) {
      data.datasets[0].data[0] = datas.rows[0].svc_cnt * 1;
      data.datasets[0].data[1] = datas.svccnt - datas.rows[0].svc_cnt * 1 ;
      return datas;
    } else {
      throw new Error(res.statusText);
    }

    //  } catch (e) {
    //    console.log("call /dashboard/summary error", e) ;
    //  }
  }

  onMount(() => {

    getdata() ;
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="main" on:click={() => getdata()}>
  <div class="container">
    <div class="subm">
      <div class="cap">단위테스트</div>
      <div class="items">
        <div class="item1 item">
          <Doughnut {data} plugins={[ChartDataLabels]} height={140} {options} />
          <!-- <div>전체누적진척율</div>
          <div class="per">{(datas.rows[0].svc_cnt * 100 / datas.svccnt).toFixed(2) }%</div>
          <span class="lbl">대상서비스 :</span><span>{datas.svccnt.toLocaleString("ko-KR")}</span><br>
          <span class="lbl">진행건수   :</span><span class="text-blue text-xl font-bold">{(datas.rows[0].svc_cnt *1).toLocaleString("ko-KR")}</span> -->
        </div>

        <div class="item2 item">
          <div>테스트성공률</div>
          <div class="per">{datas.rows[0].srate * 1}%</div>
          <span class="lbl">수행건수 :</span><span
            >{(datas.rows[0].data_cnt * 1).toLocaleString("ko-KR")}</span
          ><br />
          <span class="lbl">성공건수 :</span><span
            >{(datas.rows[0].scnt * 1).toLocaleString("ko-KR")}</span
          >
        </div>
      </div>
    </div>
    <div class="subm">
      <div class="cap">통합테스트</div>
      <div class="items">
        <div class="item1 item">
          <div>전체누적진척율</div>
          <div class="per">
            {(((datas.rows[1].svc_cnt ?? 0) * 100) / datas.svccnt).toFixed(2)}%
          </div>
          <span class="lbl">대상서비스 :</span><span
            >{datas.svccnt.toLocaleString("ko-KR")}</span
          ><br />
          <span class="lbl">진행건수 :</span><span
            >{(datas.rows[1].svc_cnt * 1).toLocaleString("ko-KR")}</span
          >
        </div>

        <div class="item2 item">
          <div>테스트성공률</div>
          <div class="per">
            {(
              ((datas.rows[1].scnt || 0) * 100) /
              (datas.rows[1].data_cnt || 1)
            ).toFixed(2)}%
          </div>
          <span class="lbl">수행건수 :</span><span
            >{(datas.rows[1].data_cnt * 1).toLocaleString("ko-KR")}</span
          ><br />
          <span class="lbl">성공건수 :</span><span
            >{(datas.rows[1].scnt * 1).toLocaleString("ko-KR")}</span
          >
        </div>
      </div>
    </div>
  </div>
  <div class="tlist"><TidList bind:tcode /></div>
</div>

<style>
  .container,
  .items {
    display: flex;
    margin: 0%;
    height: auto;
    justify-content: space-evenly;
  }

  .subm {
    flex: 1 1 0;
    padding: 1em;
    text-align: left;
    color: #3455a3;
  }
  .subm > .cap {
    padding: 0 2em;
    color: silver;
    font-weight: bold;
    font-size: 1.4rem;
  }

  .item {
    border: solid 1px darkblue;
    box-shadow: 3px 3px 5px #8585a8;
    border-radius: 6px;
    flex: 1 1 0;
    margin: 0 1em;
    padding: 0.3em 2em;
    font-size: 1.2rem;
    text-align: center;
  }
  .item .per {
    font-size: 1.5rem;
    font-weight: bold;
    color: #6a40ff;
  }
  .item2 .per {
    color: #e19ae1;
  }
  .item span {
    display: inline-block;
    text-align: right;
    width: 4rem;
    font-size: 1rem;
  }
  .item .lbl {
    width: 6rem;
  }
  .tlist {
    max-height: 70vh;
    overflow-y: auto;
  }
</style>
