<script>
    import { onDestroy } from "svelte";


    let iframeRef;
    window.AQTCONFIG= {
      page: 1
    }
    onDestroy(() => {
        delete window.AQTCONFIG ;
        if (iframeRef) {
            iframeRef.src = "";
        }
    });
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-5.8rem)] gap-4"
>
    <!-- <button on:click={sendToB}>서버 B 기능 원격 실행</button> -->
    <div
        class="flex-1 overflow-auto bg-white border border-gray-300 rounded shadow"
    >
        <iframe
            bind:this={iframeRef}
            src="http://localhost:5972"
            title="Server B Svelte App"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock allow-top-navigation"
        ></iframe>
    </div>
</div>

<style>
    .iframe-wrapper {
        width: 100%;
        height: 80vh;
        border: 2px dashed #ff3e00; /* Svelte 시그니처 컬러 */
    }
    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>
