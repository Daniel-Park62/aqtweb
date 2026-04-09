<script>

  let { label = "메뉴", items = [], isOpen=false, onSelect,toggle } = $props();
  // let isOpen = $state(false);

  function handleSelect(component) {
    onSelect(component); // 부모에게 선택된 컴포넌트 전달
    isOpen = false;
  }
  
</script>

<div class="dropdown">
  <button onclick={toggle}>{label}</button>

  {#if isOpen}
    <ul class="menu bg-gray-800">
      {#each items as item}
        <li>
          <button class="text-gray-100 hover:bg-gray-500 hover:font-bold" onclick={() => handleSelect(item)}>
            {item.nm}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown > button {
    @apply  bg-gray-800 text-gray-100 hover:text-white  font-semibold py-2 px-4 
             border border-gray-500 rounded shadow ;
  }

  .menu {
    position: absolute;
    top: 90% ;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    list-style: none;
    margin: 5px 0;
    min-width: 100px;
    z-index: 11;
  }
  .menu button {
    width: 100%;
    text-align: left;
    padding: 8px;
    border: none;
    background: none;
    cursor: pointer;
    white-space: nowrap;
  }

</style>
