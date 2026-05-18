<script>
	import "./app.css";
	import DropDown from "./lib/DropDown.svelte";
	import ByTcode from "./components/ByTcode.svelte";
	import DashBoard from "./components/DashBoard.svelte";
	import ByTask from "./components/ByTask.svelte";
	import RegApp from "./components/RegApp.svelte";
	import RegTcode from "./components/RegTcode.svelte";
	import TrList from "./components/TrList.svelte";
	import TexecJob from "./components/TexecJob.svelte";
	import TexecJob3 from "./components/TexecJob3.svelte";
	import LoginComp from "./components/LoginComp.svelte";
	import { isLogged } from "./aqtstore";
	import RegService from "./components/RegService.svelte";
	import RegUser from "./components/RegUser.svelte";
	import RegConfig from "./components/RegConfig.svelte";
	import CompareList from "./components/CompareList.svelte";
	import Tloaddata from "./components/Tloaddata.svelte";
	import RegMockSvr from "./components/RegMockSvr.svelte";
	import RegProg from "./components/RegProg.svelte";
	import { aqtConfig } from "./lib/Common.svelte";
	
	// compnt2 
	import CommHeader from "./compnt2/CommHeader.svelte";
	import JobManage from "./compnt2/JobManage.svelte";
	import JobTree from "./compnt2/JobTree.svelte";
	import JobDataManage from "./compnt2/JobDataManage.svelte";
	import ComJobDataSingle from "./compnt2/ComJobDataSingle.svelte";
	import JobDataSearch from "./compnt2/JobDataSearch.svelte";
	import TestCaseReg from "./compnt2/TestCaseReg.svelte";
	import TestCaseSearch from "./compnt2/TestCaseSearch.svelte";
	import TestSinalioReg from "./compnt2/TestSinalioReg.svelte";
	import TestSinalioSearch from "./compnt2/TestSinalioSearch.svelte";

	const mdata = [
	  { title:"기준정보관리",	
	   items : [
				{ nm: "기본정보관리",  cnm: RegConfig },
				{ nm: "App 등록",  cnm: RegApp },
				{ nm: "사용자 등록",  cnm: RegUser },
				{ nm: "서비스 등록",  cnm: RegService },
				{ nm: "프로그램 등록",  cnm: RegProg },
				]},
	  { title:"전문 Layout",	
	   items : [
				{ nm: "공통전문",  cnm: CommHeader },
				{ nm: "업무전문",  cnm: JobManage },
				{ nm: "전문Layout 조회",  cnm: JobTree },
				]},
    {
      title: "테스트데이터",
      items: [
        { nm: "전문업로드", cnm: JobDataManage },
        { nm: "신규등록/수정", cnm: ComJobDataSingle },
        //{ nm: "실시간전문등록", cnm: JobDataPacket },
        { nm: "전문데이터조회", cnm: JobDataSearch },
      ],
    },
    {
      title: "테스트케이스",
      items: [
        { nm: "테스트케이스 등록", cnm: TestCaseReg },
        { nm: "테스트케이스 조회", cnm: TestCaseSearch },
      ],
    },
    {
      title: "시나리오",
      items: [
        { nm: "시나리오 등록", cnm: TestSinalioReg },
        { nm: "시나리오 조회", cnm: TestSinalioSearch },
      ],
    },

	  { title:"테스트관리",	
	   items : [
				{ nm: "테스트등록/전문생성",  cnm: RegTcode },
				{ nm: "테스트 실행",  cnm: TexecJob },
				{ nm: "실시간 테스트",  cnm: TexecJob3 },
				{ nm: "가상서버 관리",  cnm: RegMockSvr },
				{ nm: "원본현황",  cnm: Tloaddata },
				// { nm: "itest",  cnm: Itest },
		]},
		{ title :"분석보고서", 
		  items : [
				{ nm: "총괄 현황",  cnm: DashBoard },
				{ nm: "테스트별 수행현황",  cnm: ByTcode },
				{ nm: "업무별 수행현황",  cnm: ByTask },
				{ nm: "수행결과원본비교",  cnm: CompareList },
				{ nm: "전문상세검색",  cnm: TrList },
		]},
	];
	let boxChecked = $state(false);
	const aqthome = { nm: "총괄 현황",  cnm: DashBoard };
	let selected = $state( aqthome);
	function select_item(item) {
		selected = item;
		// console.log(selected) ;
	}

 let openDropdownIndex = $state(-1);
/* 
 function toggleDropdown(index) {
			if (index >= 0 && openDropdownIndex === index) {
					openDropdownIndex = -1; // 이미 열려있으면 닫기
			} else {
					openDropdownIndex = index; // 아니면 해당 드롭다운 열기
			}
	}
	function closeDropdown(event) {
      if (!event.target.closest('.menubar')) {
          openDropdownIndex = -1;
      }
  } */
</script>
<svelte:head>
	{#if $isLogged}
    <title>AQT3 - {selected.nm}</title>
	{:else}
		<title>AQT3 - Login</title>
	{/if}
 </svelte:head>

<!-- <svelte:window onclick={closeDropdown} /> -->
{#if !$isLogged}
	<LoginComp></LoginComp>
{:else}
	<dev class="container">
		<div class="flex m-1 items-center ">
			<img class='pt-2 h-14 mr-12 cursor-pointer' onclick={() => selected = aqthome}
			     src="/images/Logo.png" alt="" />
			<nav class="bg-gray-800 p-1 m-1" >
				<div class="menubar flex space-x-8">
					{#each mdata as mitem,i}
					<DropDown
						label={mitem.title}
						items={mitem.items}
						// isOpen={openDropdownIndex === i}
						onSelect={select_item}
						// toggle={() => toggleDropdown(i)}
					/>
					{/each}
				</div>
			</nav>
			<div class="ml-auto p-2 bg-white text-[#070b57] font-black h-50 w-[18rem] rounded-md ">&nbsp&nbsp {selected.nm} &nbsp&nbsp</div>
			<div class="text-cyan-50 text-right p-2 ml-5 border-r-1">{aqtConfig.pjtnm}</div>
			<button class="flex items-center bg-transparent hover:font-bold hover:bg-transparent border-0 p-2 ml-2 text-cyan-50"
			        onclick={()=> $isLogged=0}>
				<img src="/images/ut_top_login.png" alt="">로그아웃
			</button>
		</div>

		<div spellcheck="false" class=" shadow-lg mt-1 flex-1 flex flex-col justify-stretch box-border rounded">
			<!-- <svelte:component this={selected.cnm} class="self-start"/> -->
			<selected.cnm></selected.cnm>
		</div>
	</dev>
{/if}

<style>
	.container {
		font-family: "맑은 고딕", "Lato", "Nanum Barun Gothic", "sans-serif";
		text-align: center;
		padding: 0;
		width: 100%;
		height: 100%;
		margin: 0 5;
		display: flex;
		overflow: hidden;
		flex-direction: column;
	}

	@media (min-width: 640px) {
		.container {
			max-width: none;
		}
	}
</style>
