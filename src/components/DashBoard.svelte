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
    CategoryScale,
  } from "chart.js";

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels );
  ChartJS.register({
  id: "doughnutInnerText",

  afterDraw: (chart, args, options) => {
    const { ctx, chartArea:{width,height}} = chart ;

    ctx.restore();
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#6a40ff" ;
    const ltext = "총 " + ( chart.data.datasets[0].data[0] + chart.data.datasets[0].data[1])
                                .toLocaleString() + "건" ;
    let textX = Math.round((width - ctx.measureText(ltext).width) / 2),
        textY = height + 5;

    ctx.fillText(ltext, textX, textY  );
      // console.log("espnVal", espnVal, textX, textY) ;
    const espnVal = 
                ( chart.data.datasets[0].data[0] * 100 / 
                ( chart.data.datasets[0].data[0] + chart.data.datasets[0].data[1])).toFixed(2) + "%"; 
    if (espnVal) {
      textX = Math.round((width - ctx.measureText(espnVal).width) / 2) ;
      ctx.font = "bold 16px sans-serif";

      ctx.fillText(espnVal, textX, textY - 16);
      // console.log("espnVal", espnVal, textX, textY) ;
    }
    ctx.save();
  },
});

const formatf = (v,ctx) => {
          const vsum = ctx.chart.data.datasets[0].data[0] + ctx.chart.data.datasets[0].data[1];
          if (v === 0  || (v * 100 / vsum) < 5 ) return "" ;
          
          return ctx.chart.data.labels[ctx.dataIndex].padStart(7,' ') 
          +  v.toLocaleString().padStart(6,' ')  + " 건" ;
  };

  const options = {
    responsive: false,
    aspectRatio: 1.8,
    maintainAspectRatio: false,
    onResize: function(chart, size) {
      chart.update();
    },
    plugins: {
/*       doughnutInnerText: {
          }, */
      legend: {
        display: false,
      },
      tooltip:{
        enabled:false
      },
      title: {
        display: true,
        text: '누적진척율',
        fontSize: 10,
        padding: {top: 5, left: 0, right: 0, bottom: 0}
      },
      datalabels: {
        color: 'darkblue',
        align:"center",
        display: true,
        font: {
          size: 11,
          weight: "lighter",
          family: "Verdana" ,
        },
        formatter: formatf ,
      }
    },
    animation: false,
  };

  const data = {
    clabel: "누적진척율",
    labels: ["수행서비스\n", "미수행서비스\n"],
    datasets: [
      {
        data: [300, 50],
        backgroundColor: ["#ed487f", "#46BFBD", "#FDB45C"],
        hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870"],
        circumference: 180, // 도넛 반 자르기
        rotation: 270,
        cutout : "55%",
        borderRadius: 5,
      },
    ],
  };
  const data2 = JSON.parse(JSON.stringify(data)) ;
  data2.clabel = "테스트성공률" ;
  data2.labels = ["성공건수\n","실패건수\n"];
  const data3 = JSON.parse(JSON.stringify(data)) ;
  const data4 = JSON.parse(JSON.stringify(data)) ;
  data4.clabel = "테스트성공률" ;
  data4.labels = ["성공건수\n","실패건수\n"];
  data2.datasets[0].backgroundColor = data4.datasets[0].backgroundColor = ["#F7464A", "#46BFBD"] ;
  const options2 = JSON.parse(JSON.stringify(options)) ;
  options2.plugins.title.text="테스트성공률" ;
  options2.plugins.datalabels.formatter = formatf ;

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

      data2.datasets[0].data[0] = datas.rows[0].scnt * 1 ;
      data2.datasets[0].data[1] = datas.rows[0].data_cnt * 1 - datas.rows[0].scnt * 1 ;
      data3.datasets[0].data[0] = datas.rows[1].svc_cnt * 1;
      data3.datasets[0].data[1] = datas.svccnt - datas.rows[1].svc_cnt * 1 ;
      data4.datasets[0].data[0] = datas.rows[1].scnt * 1 ;
      data4.datasets[0].data[1] = datas.rows[1].data_cnt * 1 - datas.rows[1].scnt * 1 ;

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
          <Doughnut {data} {options} plugins={[ChartDataLabels]} height=120vh  />
          <!-- <div>전체누적진척율</div>
          <div class="per">{(datas.rows[0].svc_cnt * 100 / datas.svccnt).toFixed(2) }%</div>
          <span class="lbl">대상서비스 :</span><span>{datas.svccnt.toLocaleString("ko-KR")}</span><br>
          <span class="lbl">진행건수   :</span><span class="text-blue text-xl font-bold">{(datas.rows[0].svc_cnt *1).toLocaleString("ko-KR")}</span> -->
        </div>

        <div class="item2 item">
          <Doughnut data={data2} options={options2} plugins={[ChartDataLabels]} height=120vh  />
<!--           <div>테스트성공률</div>
          <div class="per">{datas.rows[0].srate * 1}%</div>
          <span class="lbl">수행건수 :</span><span
            >{(datas.rows[0].data_cnt * 1).toLocaleString("ko-KR")}</span
          ><br />
          <span class="lbl">성공건수 :</span><span
            >{(datas.rows[0].scnt * 1).toLocaleString("ko-KR")}</span
          > -->
        </div>
      </div>
    </div>
    <div class="subm">
      <div class="cap">통합테스트</div>
      <div class="items">
        <div class="item1 item">
          <Doughnut data={data3} {options} plugins={[ChartDataLabels]} height=120vh />
<!--           <div>전체누적진척율</div>
          <div class="per">
            {(((datas.rows[1].svc_cnt ?? 0) * 100) / datas.svccnt).toFixed(2)}%
          </div>
          <span class="lbl">대상서비스 :</span><span
            >{datas.svccnt.toLocaleString("ko-KR")}</span
          ><br />
          <span class="lbl">진행건수 :</span><span
            >{(datas.rows[1].svc_cnt * 1).toLocaleString("ko-KR")}</span
          > -->
        </div>

        <div class="item2 item">
          <Doughnut data={data4} options={options2} plugins={[ChartDataLabels]} height=120vh  />
<!--           <div>테스트성공률</div>
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
          > -->
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
    border: solid 1px #6868a9;
    box-shadow: 3px 3px 5px #8585a8;
    border-radius: 6px;
    flex: 1 1 0;
    margin: 0 1em;
    padding: 0.3em 1em;
    font-size: 1.2rem;
    justify-content: center;
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
