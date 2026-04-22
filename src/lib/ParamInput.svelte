<script>
  import qs from "qs";

  let { showModal = $bindable(), items=$bindable() , title="파라미터",pkey, onApply = () => {} } = $props();
  // 초기 상태: 빈 입력창 하나 제공

  // let items = $state( Object.entries( qs.parse(resultStr == "" ? "key=value" : resultStr)) );

  let dialog;
  // 새로운 키-값 쌍 추가
  
  function addItem() {
    items.push(["key", "value" ]);
    // console.log("ParamInput items", items) ;
  }

  // 특정 인덱스의 항목 삭제
  function removeItem(ix) {
    items.splice(ix, 1);
  }

  // function checkResult() {
  //   resultStr = title === '파라미터' ? qs.stringify(Object.fromEntries(items), { arrayFormat: 'repeat' }) : JSON.stringify(items) ;
  // }

  function applystr() {
    onApply(pkey ); 
  }

  $effect(() => {
    if (dialog && showModal) { 
      dialog.showModal();
      // items = Object.entries( qs.parse(resultStr == "" ? "key=value" : resultStr,{ duplicates: 'combine' })) ;
    }
  });
</script>

<dialog bind:this={dialog} 
    onclose={() => (showModal = false)} oncancel={() => {showModal = false}} >
  <dev class="flex flex-col p-4 gap-2 items-center  ">
    <div class="m-2 text-xl font-bold text-indigo-950 bg-slate-50">{title}({pkey})</div>
    <div class="w-[96%] p-4 m-2 border shadow rounded">
      {#each items as item,  ix}
        <div class="row">
          <input class="flex-none w-[30ch]" type="text" placeholder="Key" bind:value={item[0]} />
          <input class="flex-1 w-[50ch]" type="text" placeholder="Value" bind:value={item[1]} />
          <button class="btn-delete flex-none w-[10ch]" onclick={() => removeItem(ix)}>
            삭제
          </button>
        </div>
      {/each}
      <button onclick={addItem}> + 항목추가 </button>
    </div>
    <!-- <div class="w-[96%] border flex justify-stretch ">
       <button class="flex-none" title="QueryString 값을 확인" onclick={checkResult}>확인</button>
       <span class="border border-gray-300 p-2 rounded w-full text-left pl-2 whitespace-normal">{resultStr}</span>
    </div> -->
    
    <dev class="w-full flex gap-6 justify-center">
      <button title="저장됩니다" onclick={applystr}>적용</button>
      <button class="btn-close" onclick={() => dialog.close()}>닫기</button>
    </dev>
  </dev>
</dialog>

<style>
dialog {
 @apply rounded-lg border border-gray-300 h-fit;
}

dialog::backdrop { background: rgba(0, 0, 0, 0.3); }

.row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
input {
    padding: 2px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }


</style>
