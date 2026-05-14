<script>
    //@ts-nocheck

    import { onMount } from "svelte";
    import { rooturl, userid } from "../aqtstore";
    import * as XLSX from "xlsx";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";

    let projects = [];
    let searchProjectId = "";

    let businesses = [];
    let searchAppId = "";

    let testcaseid = [];

    let searchType = "";
    let searchKeyword = "";

    let selectedIds = new Set();

    let unitTestList = [];
    let currentHeader = {
        job: searchAppId, //업무ID
        pkey: 0, //JobID
        tcode: "", //테스트케이스ID
        tdesc: "", //설명
        tnum: 0, //작업개수
        ppkey: 0, //선행JobID
        dbskip: "0", //수행결과(0:저장, 1:저장하지않음)
        repnum: "", //반복횟수
        limits: "", //처리건수
        exectype: 0, //작업방법(0:즉시실행, 1:원본송신간격)
        reqnum: 0, //송신간격(ms)
        thost: "", //Host
        tport: "", //Port
        reqstartDt: "", //작업요청일시
        etc: "", //대상선택조건
        msg: "", //작업메세지
        reqkill: "", //작업중지요청
    };

    let fileInput;
    //////////////////////////////////////////////////////////////////////////////////////////////////
    let currentPage = 1;
    let itemsPerPage = 10;

    $: totalPages = Math.ceil(unitTestList.length / itemsPerPage);
    $: paginatedList = unitTestList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    onMount(async () => {
        handleSearchProjectChangeTop();

        return geting();
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //프로젝트선택 리스트
    async function fetchProjects() {
        try {
            const res = await fetch(`${$rooturl}/project/list`);

            if (res.ok) {
                projects = await res.json();
            }
        } catch (e) {
            console.error(e);
        }
    }

    //업무선택 리스트
    async function fetchBusinesses() {
        try {
            const res = await fetch(`${$rooturl}/project/business/list`);

            if (res.ok) {
                businesses = await res.json();
            }
        } catch (e) {
            console.error(e);
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    async function handleSearchProjectChangeTop() {
        searchAppId = "";
        unitTestList = [];
        businesses = [];

        //상단 입력초기화
        resetForm();

        //프로젝트선택 리스트
        await fetchProjects();

        const found = projects.find((p) => {
            searchProjectId = p.PRJ_ID;
        });

        //업무선택 리스트
        await fetchBusinesses();

        return;
    }

    //상단 테스트케이스ID 조회
    async function fetchTestcaseID() {
        if (!searchProjectId || !searchAppId) {
            unitTestList = [];

            alert("업무를 선택해 주세요.");
            return;
        }

        try {
            const res = await fetch(
                `${$rooturl}/unitTest/message/list?app_id=${searchAppId}`,
            );

            if (res.ok) {
                testcaseid = await res.json();
            }
        } catch (e) {
            console.error(e);
        }
    }

    //업무선택시 해당 업무의 host, ip 불러오기
    async function fetchTsellist() {
        if (!searchProjectId || !searchAppId) {
            unitTestList = [];

            alert("업무를 선택해 주세요.");
            return;
        }

        try {
            const res = await fetch(
                `${$rooturl}/unitTest/tsellist?app_id=${searchAppId}`,
            );

            if (res.ok) {
                const tlist = await res.json();
                //alert("tlist : " + JSON.stringify(tlist));

                const tcodelist = tlist.filter((r) => r.enddate == null);
                //alert("tcodelist : " + JSON.stringify(tcodelist));

                const selEl = document.getElementById("tcode");
                //alert("selEl : " + JSON.stringify(selEl));

                selEl.addEventListener("change", (e) => {
                    //alert("e.target.value : " + e.target.value);
                    const fcode = tcodelist.find(
                        (r) => r.tcode == e.target.value,
                    );
                    //alert("fcode : " + JSON.stringify(fcode));

                    if (fcode) {
                        currentHeader.thost = fcode.thost;
                        currentHeader.tport = fcode.tport;
                        //alert("currentHeader.thost : " + currentHeader.thost);
                        //alert("currentHeader.tport : " + currentHeader.tport);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
    //상단 업무 선택시 상단 테스트케이스ID, 하단 그리드 자료조회 (업무 선택 선택하면 상단, 하단 내용 모두 초기화)
    async function handleSearchJobChange() {
        //상단 테스트케이스ID 조회
        fetchTestcaseID();

        //상단 입력초기화
        resetForm();

        //하단 단위테스트목록 조회
        await fetchCommHeaders();

        //host, port 조회
        fetchTsellist();

        return;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //상단 입력초기화
    function resetForm() {
        currentHeader = {
            job: searchAppId, //업무ID
            pkey: 0, //JobID
            tcode: "", //테스트케이스ID
            tdesc: "", //설명
            tnum: 0, //작업개수
            ppkey: 0, //선행JobID
            dbskip: "0", //수행결과(0:저장, 1:저장하지않음)
            repnum: "", //반복횟수
            limits: "", //처리건수
            exectype: 0, //작업방법(0:즉시실행, 1:원본송신간격)
            reqnum: 0, //송신간격(ms)
            thost: "", //Host
            tport: "", //Port
            reqstartDt: "", //작업요청일시
            etc: "", //대상선택조건
            msg: "", //작업메세지
            reqkill: "", //작업중지요청
        };
    }

    //상단 저장
    async function handleTopSave() {
        if (!searchAppId) {
            alert("업무를 먼저 선택하여 주십시오.");
            return;
        }

        if (!currentHeader.tcode) {
            alert("테스트케이스ID 는 필수입니다.");
            return;
        }

        if (!confirm("단위테스트 내용을 저장하시겠습니까?")) return;

        try {
            const res = await fetch(`${$rooturl}/unitTest/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentHeader),
            });

            if (res.ok) {
                alert("저장되었습니다.");

                selectedIds = new Set();
                //하단 단위테스트목록 조회
                fetchCommHeaders();
                //상단 입력초기화
                resetForm();
            } else {
                const text = await res.text();
                alert(`저장 실패: ${text}`);
            }
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    }

    //상단 실행요청(ASIS function getdata())
    function ExecRequest() {
        if (currentHeader.tcode == "" && currentHeader.pkey == "") {
            alert("실행요청할 통합테스트를 하단 리스트에서 선택하세요.");
            return;
        }

        let result = confirm(
            `작업시작시간:[${currentHeader.reqstartDt}] 에 테스트ID:[${currentHeader.tcode}] :  \n 실행 요청하시겠습니까?`,
        );
        if (result) {
            currentHeader.resultstat = 1;
            handleTopSave();
        }
    }

    function geting() {
        const socket = new WebSocket(
            "ws://" + window.location.host + "/execjob",
        );

        socket.onopen = function (e) {
            socket.send('{"type":2, "payload":{"kind":9 }}'); //데이터 전송
        };

        socket.onmessage = async function (event) {
            //alert("JSON.parse(event.data) : " + JSON.parse(event.data));
            const ring = JSON.parse(event.data);
            //alert("ring : " + ring);

            for await (const rw of ring) {
                const ii = unitTestList.findIndex((a) => a.pkey == rw.pkey);

                if (ii >= 0) {
                    unitTestList[ii].resultstat = rw.resultstat;
                    unitTestList[ii].startDt = rw.startDt;
                    unitTestList[ii].endDt = rw.endDt;
                }

                const [hh, mm, ss] = rw.elapsed.split(":").map(Number);
                rw.elaps = hh * 3600 + mm * 60 + ss;

                const elm = document.getElementById(rw.pkey);

                if (elm) {
                    elm.setAttribute(
                        "title",
                        "총: " +
                            rw.tcnt.toLocaleString("ko-KR") +
                            " 건" +
                            (rw.elaps
                                ? "\n " +
                                  (rw.ccnt / rw.elaps).toFixed() +
                                  " tps"
                                : ""),
                    );

                    elm.innerHTML = `
                      <p>${rw.ccnt.toLocaleString("ko-KR")}건 수행됨</p>
                      <img class='mx-4 my-0 h-6 animate-bounce' src="/images/horse.gif" />
                      <p class='text-blue-700'>&nbsp;${rw.tcnt ? ((rw.ccnt / rw.tcnt) * 100).toFixed(2) : 0}% 완료</p>
                    `;

                    elm.previousElementSibling.innerHTML = rw.elapsed;
                }
            }
        };

        socket.onerror = function (error) {
            console.log(`[error] ${error.message}`);
        };

        return () => {
            socket.close();
        };
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //하단 단위테스트목록 조회
    async function fetchCommHeaders() {
        if (!searchProjectId || !searchAppId) {
            alert("상단의 업무를 선택해 주세요.");
            return;
        }

        try {
            const params = new URLSearchParams({
                type: searchType,
                keyword: searchKeyword,
                app_id: searchAppId,
            });

            const res = await fetch(
                `${$rooturl}/unitTest/list?${params.toString()}`,
            );

            if (res.ok) {
                unitTestList = await res.json();
                currentPage = 1; //Reset to first page on search
            }
        } catch (error) {
            console.error(error);
        }
    }

    //하단 그리드 삭제
    async function handleGridDelete() {
        if (selectedIds.size === 0) {
            alert("삭제할 항목을 선택해주세요.");

            return;
        }

        if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`))
            return;

        try {
            for (let id of selectedIds) {
                if (id) {
                    const res = await fetch(
                        `${$rooturl}/unitTest/delete/${id}`,
                        {
                            method: "DELETE",
                        },
                    );

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(
                            `Failed to delete UnitTest ${id}: ${text}`,
                        );
                    }
                }
            }

            alert("정상적으로 삭제되었습니다.");

            selectedIds = new Set();
            //하단 단위테스트목록 조회
            fetchCommHeaders();
            //상단 입력초기화
            resetForm();
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다.");
        }
    }

    //하단 엑셀다운로드
    function handleExcelDownload() {
        if (unitTestList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const dataToExport = unitTestList.map((item) => ({
            업무ID: item.APP_ID || "",
            JobID: item.pkey || 0,
            테스트케이스ID: item.tcode || "",
            설명: item.tdesc || "",
            작업개수: item.tnum || 0,
            상태:
                item.resultstat === 0
                    ? "작성중(등록)"
                    : item.resultstat === 1
                      ? "실행대기"
                      : item.resultstat === 2
                        ? "수행중"
                        : item.resultstat === 3
                          ? "실행오류"
                          : item.resultstat === 9
                            ? "수행완료"
                            : "",
            작업상태: item.reqkill === "1" ? "중지요청" : "",
            작업시작시간: item.startDt || "",
            작업종료시간: item.endDt || "",
            소요시간: item.elapsed || 0,
            선행JobID: item.ppkey || 0,
            수행결과:
                item.dbskip === "0"
                    ? "저장함"
                    : item.dbskip === "1"
                      ? "저장안함"
                      : "",
            반복횟수: item.repnum || 0,
            처리건수: item.limits || "",
            작업방법:
                item.exectype === 0
                    ? "즉시실행"
                    : item.exectype === 1
                      ? "원본송신간격"
                      : "",
            "송신간격(ms)": item.reqnum || 0,
            Host: item.thost || "",
            Port: item.tport || 0,
            작업요청일시: item.reqstartDt || "",
            대상선택조건: item.etc || "",
            작업메세지: item.msg || "",
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "단위테스트");
        writeFile(wb, `단위테스트_${currentHeader.job}.xlsx`);
    }

    //하단 그리드 전체 체크박스
    function toggleAll(event) {
        if (event.target.checked) {
            selectedIds = new Set(unitTestList.map((item) => item.pkey));
        } else {
            selectedIds = new Set();
        }
        selectedIds = selectedIds;
    }

    //하단 그리드 개별 체크박스
    function toggleOne(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        selectedIds = selectedIds;
    }

    //하단 단위테스트 그리드 선택
    async function unitTestSelect(item) {
        currentHeader.pkey = item.pkey; //pkey
        currentHeader.job = item.APP_ID; //업무ID
        currentHeader.tcode = item.tcode; //테스트케이스ID
        currentHeader.tdesc = item.tdesc; //설명
        currentHeader.tnum = item.tnum; //작업개수
        currentHeader.ppkey = item.ppkey; //선행JobID
        currentHeader.dbskip = item.dbskip; //수행결과(0:저장, 1:저장하지않음)
        currentHeader.repnum = item.repnum; //반복횟수
        currentHeader.limits = item.limits; //처리건수
        currentHeader.exectype = item.exectype; //작업방법(0:즉시실행, 1:원본송신간격)
        currentHeader.reqnum = item.reqnum; //송신간격(ms)
        currentHeader.thost = item.thost; //Host
        currentHeader.tport = item.tport; //Port
        currentHeader.reqstartDt = item.reqstartDt; //작업요청일시
        currentHeader.etc = item.etc; //대상선택조건
        currentHeader.msg = item.msg; //작업메세지
        currentHeader.reqkill = item.reqkill; //작업중지요청
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div class="bg-white shadow border border-gray-300 p-4 mb-0">
        <div class="flex justify-end mb-2 space-x-2 items-center">
            <div class="flex space-x-2 mr-auto items-start">
                <h2 class="text-lg font-bold text-gray-700 px-5">단위테스트</h2>
            </div>
            <div class="flex items-center space-x-2 mr-4">
                <div class="items-center hidden">
                    <span
                        class="w-32 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
                    >
                        프로젝트
                    </span>
                    <select
                        class="border border-gray-300 rounded px-2 py-1 text-sm"
                        bind:value={searchProjectId}
                        on:change={handleSearchProjectChangeTop}
                    >
                        {#each projects as prj}
                            <option value={prj.PRJ_ID}>{prj.PRJ_NM}</option>
                        {/each}
                    </select>
                </div>
                <div class="items-center hidden">
                    <span
                        class="w-32 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
                    >
                        프로젝트
                    </span>
                    <span
                        class="w-40 mr-1 text-sm font-bold text-left text-gray-600 px-2 py-1 border border-gray-300"
                    >
                        {projects.find((p) => p.PRJ_ID == searchProjectId)
                            ? projects.find((p) => p.PRJ_ID == searchProjectId)
                                  .PRJ_NM
                            : ""}
                    </span>
                </div>
                <div class="flex items-center">
                    <span
                        class="w-32 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
                    >
                        업무
                    </span>
                    <select
                        class="border border-gray-300 rounded px-2 py-1 text-sm"
                        bind:value={searchAppId}
                        on:change={handleSearchJobChange}
                    >
                        <option value="">업무 선택</option>
                        <!--
                        {#each businesses as biz}
                            <option value={biz.APP_ID}>{biz.APPNM}</option>
                        {/each}
                        -->
                        {#each getAppid() as biz}
                            <option value={biz.appid}>{biz.appname}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <button on:click={resetForm}> 입력초기화 </button>
            <button on:click={handleTopSave}> 저장 </button>
            <button on:click={ExecRequest} class="btn-delete">
                실행요청
            </button>
        </div>
        <div class="py-2"></div>
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm"
        >
            <!-- hidden 업무 ID (job)-->
            <input
                type="text"
                class="flex-1 border border-gray-300 bg-gray-100 py-1 px-2 text-gray-500 hidden"
                bind:value={currentHeader.job}
            />
            <!-- hidden testcase pkey -->
            <input
                type="text"
                class="flex-1 border border-gray-300 bg-gray-100 py-1 px-2 text-gray-500 hidden"
                bind:value={currentHeader.pkey}
            />
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >테스트케이스ID</label
                >
                <select
                    id="tcode"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    bind:value={currentHeader.tcode}
                    on:change={fetchTsellist}
                >
                    <option value="">테스트케이스ID 선택</option>
                    {#each testcaseid as tcid}
                        <option value={tcid.TC_ID}>{tcid.TC_NAME}</option>
                    {/each}
                </select>
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >설명</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="설명 입력"
                    bind:value={currentHeader.tdesc}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >작업개수</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="작업개수 입력"
                    bind:value={currentHeader.tnum}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >선행 JobID</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="선행 JobID 입력"
                    bind:value={currentHeader.ppkey}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >수행결과</label
                >
                <label
                    class="flex-1 border border-gray-300 py-1 px-2 text-left"
                >
                    <input
                        type="radio"
                        name="dbskip"
                        value={"0"}
                        bind:group={currentHeader.dbskip}
                    />
                    저장&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input
                        type="radio"
                        name="dbskip"
                        value={"1"}
                        bind:group={currentHeader.dbskip}
                    /> 저장하지않음
                </label>
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >반복횟수</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="반복횟수 입력"
                    bind:value={currentHeader.repnum}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >처리건수</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="처리건수 입력"
                    bind:value={currentHeader.limits}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >작업방법</label
                >
                <label
                    class="flex-1 border border-gray-300 py-1 px-2 text-left"
                >
                    <input
                        type="radio"
                        name="exec"
                        value={0}
                        bind:group={currentHeader.exectype}
                    />
                    즉시실행&nbsp;&nbsp;&nbsp;&nbsp;
                    <input
                        type="radio"
                        name="exec"
                        value={1}
                        bind:group={currentHeader.exectype}
                    /> 원본송신간격
                </label>
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >송신간격(ms)</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="송신간격(ms) 입력"
                    bind:value={currentHeader.reqnum}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >HOST</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="HOST 입력"
                    bind:value={currentHeader.thost}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >Port</label
                >
                <input
                    type="text"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="Port 입력"
                    bind:value={currentHeader.tport}
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                    >작업요청일시</label
                >
                <input
                    type="date"
                    class="flex-1 border border-gray-300 py-1 px-2"
                    bind:value={currentHeader.reqstartDt}
                />
            </div>
        </div>
        <div class="flex items-center mt-2 text-sm space-x-1">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label
                class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                >대상선택조건</label
            >
            <input
                type="text"
                class="flex-1 border border-gray-300 py-1 px-2"
                placeholder="대상선택조건 입력"
                bind:value={currentHeader.etc}
            />
        </div>
        <div class="flex items-center mt-2 text-sm space-x-1">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label
                class="w-36 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right"
                >작업메세지</label
            >
            <input
                type="text"
                class="flex-1 border border-gray-300 py-1 px-2"
                placeholder="작업메세지 입력"
                bind:value={currentHeader.msg}
            />
        </div>
    </div>
    <div class="bg-white p-4 shadow border border-gray-300">
        <div class="flex justify-between items-center mb-4">
            <div class="flex space-x-2 mr-auto items-start">
                <h2 class="text-lg font-bold text-gray-700 px-5">
                    단위테스트 목록
                </h2>
            </div>
            <div class="flex space-x-2 items-center">
                <span
                    class="w-20 mr-1 text-sm font-bold text-center text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
                >
                    상태
                </span>
                <select
                    class="border border-gray-300 rounded px-8 py-1 text-sm"
                    bind:value={searchType}
                >
                    <option value="">전체</option>
                    <option value="1">실행대기</option>
                    <option value="2">실행중</option>
                    <option value="9">작업완료</option>
                </select>
                <div class="w-8 h-6 bg-white mx-1"></div>
                <input
                    type="text"
                    bind:value={searchKeyword}
                    placeholder="검색어 입력"
                    class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    style="width: 350px; min-width: 200px;"
                />
                <button on:click={fetchCommHeaders}> 조회 </button>
                <button on:click={handleGridDelete} class="btn-delete">
                    삭제
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button on:click={handleExcelDownload} class="btn-excel">
                    엑셀다운로드
                </button>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th
                            class="text-center"
                            style="width: 6px; min-width: 6px;"
                        >
                            <input type="checkbox" on:change={toggleAll} />
                        </th>
                        <th class="text-center hidden">업무ID</th>
                        <th class="text-center hidden">JobID</th>
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;"
                            >테스트케이스ID</th
                        >
                        <th
                            class="text-center"
                            style="width: 160px; min-width: 160px;">설명</th
                        >
                        <th
                            class="text-center"
                            style="width: 60px; min-width: 60px;">작업개수</th
                        >
                        <th
                            class="text-center"
                            style="width: 60px; min-width: 60px;">상태</th
                        >
                        <th
                            class="text-center"
                            style="width: 60px; min-width: 60px;">작업상태</th
                        >
                        <th
                            class="text-center"
                            style="width: 180px; min-width: 180px;">작업시간</th
                        >
                        <th
                            class="text-center"
                            style="width: 60px; min-width: 60px;">소요시간</th
                        >
                        <th class="text-center hidden">선행JobID</th>
                        <th class="text-center hidden">수행결과</th>
                        <th class="text-center hidden">반복횟수</th>
                        <th class="text-center hidden">처리건수</th>
                        <th class="text-center hidden">작업방법</th>
                        <th class="text-center hidden">송신간격(ms)</th>
                        <th class="text-center hidden">Host</th>
                        <th class="text-center hidden">Port</th>
                        <th class="text-center hidden">작업요청일시</th>
                        <th class="text-center hidden">대상선택조건</th>
                        <th
                            class="text-center"
                            style="width: 180px; min-width: 180px;"
                            >작업메세지</th
                        >
                    </tr>
                </thead>
                <tbody class="bg-white">
                    {#each paginatedList as item (item.pkey)}
                        <tr
                            class="hover:bg-blue-50 transition-colors border-b border-gray-200 cursor-pointer {selectedIds ===
                            item
                                ? 'bg-blue-100'
                                : ''}"
                            on:click={() => unitTestSelect(item)}
                        >
                            <td class="text-center" on:click|stopPropagation>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(item.pkey)}
                                    on:change={() => toggleOne(item.pkey)}
                                />
                            </td>
                            <td class="text-center hidden">
                                {item.APP_ID}
                            </td>
                            <td class="text-center hidden">
                                {item.pkey}
                            </td>
                            <td class="text-center">
                                {item.tcode}
                            </td>
                            <td class="text-left">
                                {item.tdesc}
                            </td>
                            <td class="text-right">
                                {item.tnum}
                            </td>
                            <td class="text-center">
                                {#if item.resultstat === 0}
                                    등록
                                {:else if item.resultstat === 1}
                                    실행대기
                                {:else if item.resultstat === 2}
                                    실행중
                                {:else if item.resultstat === 3}
                                    실행오류
                                {:else if item.resultstat === 9}
                                    수행완료
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-center">
                                {#if item.reqkill === "1"}
                                    중지요청
                                {:else}
                                    &nbsp;
                                {/if}
                            </td>
                            <td class="text-left">
                                {item.startDt} ~ {item.endDt}
                            </td>
                            <td class="text-center">
                                {item.elapsed}
                            </td>
                            <td class="text-center hidden">
                                {item.ppkey}
                            </td>
                            <td class="text-center hidden">
                                {#if item.dbskip === "0"}
                                    저장함
                                {:else if item.dbskip === "1"}
                                    저장안함
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-right hidden">
                                {item.repnum}
                            </td>
                            <td class="text-right hidden">
                                {item.limits}
                            </td>
                            <td class="text-center hidden">
                                {#if item.exectype === 0}
                                    즉시실행
                                {:else if item.exectype === 1}
                                    원본송신간격
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-right hidden">
                                {item.reqnum}
                            </td>
                            <td class="text-center hidden">
                                {item.thost}
                            </td>
                            <td class="text-center hidden">
                                {item.tport}
                            </td>
                            <td class="text-center hidden">
                                {item.reqstartDt}
                            </td>
                            <td class="text-center hidden">
                                {item.etc}
                            </td>
                            <td class="text-left">
                                {item.msg}
                            </td>
                        </tr>
                    {/each}
                    {#if unitTestList.length === 0}
                        <tr>
                            <td colspan="23" class="text-center">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        {#if totalPages > 0}
            <div class="flex justify-center items-center mt-4 space-x-1">
                <button
                    class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    on:click={() => goToPage(1)}
                    disabled={currentPage === 1}
                >
                    처음
                </button>
                <button
                    class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    이전
                </button>

                {#each Array(Math.min(5, totalPages)) as _, i}
                    {@const pageNum =
                        totalPages <= 5
                            ? i + 1
                            : Math.min(
                                  Math.max(currentPage - 2, 1),
                                  totalPages - 4,
                              ) + i}
                    <button
                        class="px-3 py-1 border border-gray-300 rounded text-sm {currentPage ===
                        pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-100'}"
                        on:click={() => goToPage(pageNum)}
                    >
                        {pageNum}
                    </button>
                {/each}

                <button
                    class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    다음
                </button>
                <button
                    class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    on:click={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    마지막
                </button>

                <span class="ml-4 text-sm text-gray-600">
                    Page {currentPage} of {totalPages} (Total {unitTestList.length}
                    items)
                </span>
            </div>
        {/if}
    </div>
</div>
