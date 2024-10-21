<script>
  import { onMount } from "svelte";
  import { userid,authApps } from "../aqtstore.js";
//   import { getComparator, formatDate, formatDateTime } from "../helpers.js";
// import { bind } from "svelte/internal";
// import DetailTr from "./DetailTR.svelte";
import Trtable from "./Trtable.svelte";

  let vid = 'none';
  let pid ;
  
  let conds = {
    tcode: "",
    rcode: '',
    page: 0,
    psize: 20,
    cond: "",
    uri: "",
    apps:""
  };

  let tcodelist = [];
  let selected ;
  let tcnt = '';

  async function getTRlistm() {

    conds.tcode = selected.code ;
    const res = await fetch("/trlist/tcnt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
      const rdata = await res.json();
      tcnt = rdata[0].tcnt ;
      console.log("trlist tcnt", rdata) ;
    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res);
    }
  }

  async function getDownLoad() {
    // console.log("entr ...", conds) ;
    conds.tcode = selected.code ;

    conds.apps = $authApps ;
    const res = await fetch("/tresult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conds),
    });
    if (res.ok) {
//      rdata = await res.json();
      const file = await res.blob(); 
      const downloadUrl = window.URL.createObjectURL(file); // 해당 file을 가리키는 url 생성
 
      const anchorElement = document.createElement('a');
      document.body.appendChild(anchorElement);
      anchorElement.download = conds.tcode; // a tag에 download 속성을 줘서 클릭할 때 다운로드가 일어날 수 있도록 하기
      anchorElement.href = downloadUrl; // href에 url 달아주기
 
      anchorElement.click(); // 코드 상으로 클릭을 해줘서 다운로드를 트리거
 
      document.body.removeChild(anchorElement); // cleanup - 쓰임을 다한 a 태그 삭제
      window.URL.revokeObjectUrl(downloadUrl); // cleanup - 쓰임을 다한 url 객체 삭제

    } else {
      // rdata = Promise.resolve([]);
      throw new Error(res);
    }
  }

  onMount(async () => {
    const res = await fetch( "/tmaster/tsellist/"+$userid ) ;
    tcodelist = await res.json(); 
    tcodelist.push({code:'%',name:'ALL'});
    selected = tcodelist[0];
    conds.tcode = selected.code ;
    // promise = Promise.resolve(tcodelist) ;
  });
  
</script>

<div class="main" on:mouseenter={() => vid = 'none' }>
  <div class="cond fitem">
    <p>* 테스트ID : </p> 
    <select bind:value={selected} >
        
      {#each tcodelist as tc}
      <option value={tc}>
        {tc.code + ' : ' + tc.name}
      </option>
      {/each}
    </select>
    <span>URI : <input type="text" bind:value={conds.uri} /></span>
    <span class="number-in">응답코드 : <input  type="number" bind:value={conds.rcode} /></span>
    <span>기타 : <input type="text" bind:value={conds.cond} /></span>
    <button on:click={getTRlistm}>조회</button>
    <span>{tcnt}</span>

  </div>
  <div class="fitem">
    <Trtable bind:conds/>
  </div>
</div>

<style>
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .cond {
    display:flex ;
    align-items: baseline ;
    
  }
  .cond * {
    margin: 2px 4px;
    padding: 0 3px;
    height: 1.7em;
  }
  .cond span {
    margin: 2px 8px;
  }  
  .cond button {
    width: 4em;
    border-radius: 6px;
  }
  .number-in input{
    max-width: 70px;
    text-align: right;
  }

</style>
