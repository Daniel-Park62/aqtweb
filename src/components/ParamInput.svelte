<script>
  import qs from "qs";

  let { showModal = $bindable(), resultStr=$bindable() , pkey } = $props();
  // 초기 상태: 빈 입력창 하나 제공

  let items = $state(Object.entries( qs.parse(resultStr == "" ? "key=value" : resultStr)) );

  let dialog;
  // 새로운 키-값 쌍 추가
  
  function addItem() {
    items.push(["key", "value" ]);
    resultStr = qs.stringify(Object.fromEntries(items)) ;
    // console.log("ParamInput items", items) ;
  }

  // 특정 인덱스의 항목 삭제
  function removeItem(ix) {
    items.splice(ix, 1);
    resultStr = qs.stringify(Object.fromEntries(items)) ;
  }

  // 결과 확인용 (콘솔 출력 또는 API 전송용)
  function applystr() {

    resultStr = qs.stringify(Object.fromEntries(items)) ; // JSON.stringify(ritem);

    fetch("/trlist/change", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkey: pkey,
        params: resultStr,
        gubun: "params",
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        alert(rmsg.message);
      })
      .catch((err) => {
        alert("error:" + err.message);
      });
  }

  $effect(() => {
    if (dialog && showModal) { 
      dialog.showModal();
      items = Object.entries( qs.parse(resultStr == "" ? "key=value" : resultStr)) ;
    }
  });
</script>

<dialog bind:this={dialog} onclose={() => (showModal = false)} oncancel={() => {}} >
  <h2>Parameter input </h2>
  <hr />
  <div class="container p-4">
    {#each items as item,  ix}
      <div class="row">
        <input type="text" placeholder="Key" bind:value={item[0]} />
        <input type="text" placeholder="Value" bind:value={item[1]} />
        <button class="delete-btn" onclick={() => removeItem(ix)}>
          삭제
        </button>
      </div>
    {/each}

    <button class="add-btn" onclick={addItem}> + 항목추가 </button>
  </div>

  <hr />

  ### Qery String 결과
  <button onclick={applystr}>적용</button>
  <pre>{pkey} {resultStr}</pre>
  <button onclick={() => dialog.close()}>닫기</button>
</dialog>

<style>
  .container {
    max-width: 500px;
  }
  .row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex: 1;
  }

  .add-btn {
    width: 100%;
    padding: 10px;
    background: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
  .delete-btn {
    background: #ff4444;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }

  pre {
    background: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
  }
</style>
