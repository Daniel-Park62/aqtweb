<script>
	import { authApps, isLogged, userid } from "../aqtstore";
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
	let showModal = $state(false);
	let password = $state("");
	let usrid = $state("");
	let error = $state("");

	async function login3() {
		if (password === "aqtuser") {
			showModal = true;
			return;
		}
		fetch("/tuser/logonchk", {
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
					$authApps = data.apps;
					$userid = usrid;
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
<div class="flex items-center justify-center min-h-screen">
	
	<div class="w-[400px] p-10 rounded-lg shadow-lg bg-[rgba(26,26,176,0.8)] shadow-slate-500">
		<img src={imgUrl} alt="" />
		<form class="my-6 text-left" onsubmit={(e)=> {e.preventDefault()}}>
			<dev class="text-2xl text-yellow-50">사용자ID</dev>
			<input class="form-control" bind:value={usrid} />
	
			<dev class="text-2xl text-yellow-50">비밀번호</dev>
			<input type="password" class="form-control" bind:value={password} />
			<div class="btns gap-4">
				<button type='button' onclick={login3} class="btn1">로그인</button>
				<button type='button' onclick={() => (showModal = true)} class="btn2"
					>비밀번호변경</button
				>
			</div>
			<div class="text-2xl text-amber-400">
				<small>{error}</small>
			</div>
		</form>
	</div>
	<ChangePass bind:showModal {usrid} />
</div>

<style>
	input {
		@apply text-lg;
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
		@apply px-4 py-2 text-xl text-white rounded-md bg-[#6a24fe] hover:bg-[#5a1edb] transition-colors duration-300;
	}
</style>
