<script>
	import { authApps, isLogged,userid } from "../aqtstore";
	import ChangePass from "./ChangePass.svelte";
	
/* 	import {setContext }  from "svelte";

	setContext('gettcode', {
		getTcode: async () => tcodelist 
	});
	let tcodelist ;
	async function getTcodelist() {
    const res = await fetch("/tmaster/tsellist/"+$userid );
    tcodelist =   await res.json();
		console.log(tcodelist);
  }
 */
	const imgUrl = new URL("/images/Logo.png", import.meta.url).href;
	let showModal = false;
	let password = "";
	let usrid = "";
	let error = "";

	async function login() {
		// const chk = await getCheckPass(password);
		const res = await fetch("/logonchk?pass=" + password);
		let data = await res.json();

		if (data.chk) {
			$isLogged = 2;
			if (error) error = "";
		} else {
			error = "비밀번호가 맞지않습니다.";
		}
	}

	async function login3() {
		if (password === 'aqtuser'){
			showModal = true ;
      return ;
		}
		fetch("/logonchk", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				pass:
					Math.floor(Math.random() * 100)
						.toString()
						.padStart(2, "0") +
					Buffer.from(password, "utf8").toString("base64"),
				usrid:
					Math.floor(Math.random() * 10) +
					Buffer.from(usrid, "utf8").toString("base64"),
			}),
		})
			.then(async (res) => {
				const data = await res.json();
				if (data.hg == 0) error = "허가되지않은 IP.";
				else if (data.chk) {
					$isLogged = data.admin == "1" ? 2 : 1;
					$authApps = data.apps ;
					$userid = usrid ;
//					getTcodelist() ;
					if (error) error = "";
				} else {
					error = "비밀번호가 맞지않습니다.";
				}
			})
			.catch((err) => {
				error = err.message;
			});
	}

	async function login2() {
		$isLogged = 1;
	}


</script>

<div class="login-wrapper">
	<img src={imgUrl} alt="" />
	<form on:submit|preventDefault={() => {}} id="login-form">
		<h2>사용자ID</h2>
		<input class="form-control" bind:value={usrid} />

		<h2>비밀번호</h2>
		<input
			type="password"
			class="form-control"
			id="passw"
			bind:value={password}
		/>
		<div class="btns">
			<button on:click={login3} class="btn1">로그인</button>
			<button on:click={() => (showModal = true)} class="btn2"
				>비밀번호변경</button
			>
		</div>
		<div id="error_message" class="text-danger">
			<small>{error}</small>
		</div>
	</form>
</div>
<ChangePass bind:showModal {usrid} />

<style>
	.login-wrapper {
		/* position: relative; */
		margin: 0 auto;
		border: none;
		width: 400px;
		height: auto;
		/* background-image: url("/images/login.png"); */
		/* background-repeat: no-repeat; */
		/* background-size: 70% ; */
		/* background-position: left; */
		padding: 40px;
		box-sizing: border-box;
		opacity: 0.8;
		background-color: rgb(26, 26, 176);
	}
	h2 {
		font-size: 24px;
		color: #e2eee7;
		margin-bottom: 20px;
	}
	.text-danger {
		font-size: 20px;
		color: yellow;
		margin-top: 20px;
	}

	.form-control {
		width: 100%;
		height: 48px;
		padding: 0 10px;
		box-sizing: border-box;
		margin-bottom: 16px;
		border-radius: 6px;
		background-color: #f8f8f8;
	}
	/* form {
		width: 100%;
		height: 48px;
		padding: 0 10px;
		box-sizing: border-box;
		margin-bottom: 16px;
		border-radius: 6px;
		background-color: #f8f8f8;
	} */

	.btns {
		margin-top: 30px;
		/* width: fit-content; */
		display: flex;
		justify-content: center;
	}

	.btns > button {
		color: #fff;
		font-size: 20px;
		background-color: #6a24fe;
		border-radius: 6px;
	}
	/* .btns::after {
    content: "";
    display: block;
    clear: both;
}
	button {
		display: block; 
	} */
</style>
