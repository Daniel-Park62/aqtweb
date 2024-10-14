<script>
  import * as buffer from 'buffer/';
  window.Buffer = buffer.Buffer ;

  export let showModal; // boolean
  export let usrid;
  let dialog; // HTMLDialogElement
  let opass = '';
  let npass1 = '';
  let npass2 = '';
  async function changepass() {
    if (npass1 !== npass2) {
      alert("비밀번호 확인값이 다릅니다.");
      return ;
    }
    if (! /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/.test(npass1)) {
      alert("영숫자 및 특수문자를 포함하여 8자리이상이어야 합니다.");
      return ;
    }
    fetch("/logonchk/cp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opass:
          Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0") + Buffer.from(opass, "utf8").toString("base64"),
        pass:
          Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0") + Buffer.from(npass1, "utf8").toString("base64"),
        usrid:
          Math.floor(Math.random() * 10) +
          Buffer.from(usrid, "utf8").toString("base64"),
      }),
    })
      .then(async (res) => {
        let rmsg = await res.json();
        if (res.status < 400) {
          alert(rmsg.message);
          dialog.close();
          // return ( ! rmsg.err );
        }
      })
      .catch((err) => {
        alert(err.message);
      });
      return false ;
  }

  function _onCancel() {
    dialog.close();
  }

  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <h2>{usrid} 비밀번호변경</h2>
    <hr />
    <div>변경전 비밀번호:</div>
    <input type="password" bind:value={opass} />
    <br />
    <div>새 비밀번호:</div>
    <input type="password" bind:value={npass1} />
    <br />
    <div>비밀번호 확인:</div>
    <input type="password" bind:value={npass2} />

    <div class="btns">
      <button on:click={_onCancel}> 취소 </button>
      <button disabled='{npass1.length < 6}' on:click={changepass}> 적용 </button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: 400px;
    border-radius: 0.2em;
    border: 1;
    padding: 0;
    background-color: rgb(223, 218, 218);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  input {
    width: 100%;
		height: 48px;
		padding: 0 10px;
		box-sizing: border-box;
		margin-bottom: 16px;
		border-radius: 6px;
		background-color: #f8f8f8;
  }
  
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.8);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .btns {
    margin-top: 30px;
    /* width: fit-content; */
    display: flex;
    justify-content: center;
  }
  button {
    display: block;
  }
</style>
