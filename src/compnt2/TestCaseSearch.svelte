<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";
    //////////////////////////////////////////////////////////////////////////////////////////////
    let loadFlag = false; //화면 로드 구분
    // 프로젝트 목록 데이터
    let projects = [];
    // 프로젝트 선택 데이터
    let projectSelectElement;
    // 업무 목록 데이터
    let jobs = [];
    // 업무 선택 데이터
    let jobSelectElement;
    // 테스트케이스 데이터
    let messages = [];
    // 테스트케이스 선택 데이터
    let selectedMessage = "";
    // 하단 좌측 그리드 데이터
    let dataList = [];
    // 하단 우측 전문 필드 데이터
    let fieldList = [];
    // 검색 필터 (프로젝트 선택)
    let selectedProject = "";
    // 검색 필터 (업무 선택)
    let selectedJob = "";
    // 필드 검색 조건
    let searchTestCaseKeyword = "";
    let searchFieldKeyword = "";
    let searchDataKeyword = "";

    let isAllFieldsChecked = false;
    let messageListFileInput;
    let fieldListFileInput;
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 컴포넌트 마운트 시 초기 데이터 로드
    onMount(async () => {
        await searchProjects();
        await searchJobs();

        loadFlag = true;
    });
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 프로젝트 목록 조회
    async function searchProjects() {
        try {
            const projectRes = await fetch($rooturl + "/common/project/list");
            projects = await projectRes.json();
        } catch (error) {
            console.error("프로젝트 목록 로딩 실패:", error);
        }
    }

    // 상단 업무 목록 조회
    async function searchJobs() {
        selectedJob = "";
        jobs = [];
        messages = [];
        fieldList = [];
        dataList = [];

        const found = projects.find((p) => {
            selectedProject = p.PRJ_ID;
        });

        if (!selectedProject) return;

        const queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";

        try {
            const jobRes = await fetch(
                $rooturl + "/common/job/list" + queryParams,
            );

            jobs = await jobRes.json();
        } catch (error) {
            console.error("업무 목록 로딩 실패:", error);
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 테스트케이스 목록 조회
    async function searchMessages() {
        selectedMessage = null;

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        if (searchTestCaseKeyword) {
            queryParams += `&search_keyword=${searchTestCaseKeyword}`;
        }

        if (!selectedJob || selectedJob === "") {
            messages = [];
            fieldList = [];
            dataList = [];

            alert("업무를 선택해 주세요.");

            return;
        }

        try {
            const res = await fetch(
                $rooturl + "/testCase/message/list" + queryParams,
            );

            messages = await res.json();
            fieldList = [];
            dataList = [];
        } catch (error) {
            console.error("테스트케이스 목록 로딩 실패:", error);
        }
    }

    // 상단 테스트케이스 선택 (필드 목록 로드)
    async function jobSelect(msg) {
        selectedMessage = msg;
        searchFieldKeyword = "";
        searchDataKeyword = "";
        searchTestCaseKeyword = "";

        // 하단 좌측 데이터 검색조건 조회
        await searchData(msg);
        // 하단 우측 테스트케이스 데이터 조회
        await searchFieldsData(msg);
    }

    // 상단 엑셀 다운로드
    function handleExcelDownload() {
        const ws = utils.json_to_sheet(
            messages.map((msg) => ({
                업무ID: msg.APP_ID || "",
                업무명: msg.APPNM || "",
                테스트케이스ID: msg.TC_ID || "",
                테스트케이스명: msg.TC_NAME || "",
                테스트구분: msg.TC_GUBUN || "",
                작성자: msg.TC_WRITER || "",
                작성일자: msg.TC_WRTDT || "",
                업무담당자: msg.TC_BUSMGR || "",
                IT담당자: msg.TC_ITMGR || "",
                대상서버: msg.TC_SERVER || "",
                대상포트: msg.TC_PORT || 0,
                type: msg.type || "",
                테스트종료일: msg.endDate || "",
                tdir: msg.tdir || "",
                thost: msg.thost || "",
                tport: msg.tport || 0,
                encval: msg.encval || "",
                pro: msg.pro || "",
                svc_cnt: msg.svc_cnt || 0,
                fsvc_cnt: msg.fsvc_cnt || 0,
                data_cnt: msg.data_cnt || 0,
                scnt: msg.scnt || 0,
                fcnt: msg.fcnt || 0,
                주비교테스트: msg.cmpCode || "",
                환경파일위치: msg.tenv || "",
            })),
        );

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "테스트케이스리스트");

        writeFile(wb, "테스트케이스리스트.xlsx");
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 데이터 검색조건 검색어 입력 후 조회
    function handleDataSearchTrigger() {
        if (selectedMessage) {
            searchData(selectedMessage);
        } else {
            alert("테스트케이스를 선택해주세요.");
        }
    }

    // 하단 좌측 데이터 검색조건 조회
    async function searchData(msg) {
        dataList = [];

        if (!msg.TC_ID || msg.TC_ID === "") {
            dataList = [];
            return;
        }

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.TC_ID ? `&tc_id=${msg.TC_ID}` : "";

            if (searchDataKeyword) {
                queryParams += `&search_keyword=${searchDataKeyword}`;
            }

            const res = await fetch(
                `${$rooturl}/testCase/data/list` + queryParams,
            );

            const data = await res.json();
            dataList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        }
    }

    // 하단 좌측 데이터 검색조건 선택 (검색조건에 해당하는 내용 조회)
    async function jobDataSelect(row) {
        searchFieldKeyword = "";
        fieldList = [];
        selectedMessage = row;

        // 하단 좌측 데이터 조회 함수
        await searchFieldsData(row);
    }

    // 하단 좌측 데이터 검색조건 엑셀 다운로드
    function handleDataExcelDownload() {
        if (filteredDataList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);
        const msg = messages.find((m) => m.MSG_ID == selectedMessage.MSG_ID);

        const dataToExport = filteredDataList.map((row) => ({
            업무ID: row.APP_ID || "",
            테스트케이스ID: row.TC_ID || "",
            테스트케이스명: row.TC_NAME || "",
            검색조건ID: row.SEARCH_ID || "",
            전문ID: row.MSG_ID || "",
            전문명: row.MSG_KR_NM || "",
            전문필드ID1: row.MSGFLD01_ID || "",
            전문필드명1: row.MSGFLD01_NM || "",
            검색어1: row.SEARCH01_NM || "",
            전문필드ID2: row.MSGFLD02_ID || "",
            전문필드명2: row.MSGFLD02_NM || "",
            검색어2: row.SEARCH02_NM || "",
            전문필드ID3: row.MSGFLD03_ID || "",
            전문필드명3: row.MSGFLD03_NM || "",
            검색어3: row.SEARCH03_NM || "",
            전문필드ID4: row.MSGFLD04_ID || "",
            전문필드명4: row.MSGFLD04_NM || "",
            검색어4: row.SEARCH04_NM || "",
            조회건수: row.SEARCH_CNT || 0,
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "데이터검색조건");
        writeFile(wb, `데이터검색조건_${selectedMessage.SEARCH_ID}.xlsx`);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 우측 테스트케이스 데이터 조회
    async function searchFieldsData(msg) {
        fieldList = [];

        if (!msg.TC_ID) return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.TC_ID ? `&tc_id=${msg.TC_ID}` : "";
            queryParams += msg.SEARCH_ID ? `&search_id=${msg.SEARCH_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/testCase/field/listdata" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 데이터 조회 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측  테스트케이스 데이터 검색 조회
    function handleFieldSearchTrigger() {
        if (selectedMessage) {
            searchFieldsData(selectedMessage);
        } else {
            alert("테스트케이스를 선택해주세요.");
        }
    }

    // 하단 우측 테스트케이스 데이터 엑셀 다운로드
    function handleFieldExcelDownload() {
        if (filteredFieldList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);
        const msg = messages.find((m) => m.TC_ID == selectedMessage.TC_ID);

        const dataToExport = filteredFieldList.map((field) => ({
            업무ID: field.APP_ID || "",
            테스트케이스ID: field.TC_ID || "",
            테스트케이스명: field.TC_NAME || "",
            테스트케이스데이터ID: field.TCDT_ID || "",
            "검색조건 ID": field.SEARCH_ID || "",
            "서비스/URI": field.SVC_URI || "",
            프로토콜: field.PROTOCOL_GB || "",
            Method: field.METHOD || "",
            전문ID: field.MSG_ID || "",
            전문데이터: field.FIXEDLEN_VAL || "",
            송신시간: field.TC_SENDDT || "",
            수신시간: field.TC_RECEIVEDT || "",
            수행시간: field.TC_TIMETAKEN || 0,
            결과: field.TC_RESULT || "",
            응답코드: field.TC_RESPCODE || 0,
            오류내역: field.TC_ERRLOG || "",
            Header: field.HEADER_VAL || "",
            "파라메터(GET)": field.PARAM_VAL || "",
            소스ip: field.srcip || "",
            소스port: field.srcport || 0,
            원본목적지ip: field.o_dstip || "",
            원본목적지port: field.o_dstport || 0,
            목적지ip: field.dstip || "",
            목적지port: field.dstport || 0,
            원본생성: field.origin || "",
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "테스트케이스 전문 데이터");
        writeFile(wb, `테스트케이스전문데이터_${selectedMessage.TC_ID}.xlsx`);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 데이터 검색 반응형 업데이트 (Client-side filtering of loaded fields)
    $: filteredDataList = dataList;

    // 필드 검색 반응형 업데이트 (Client-side filtering of loaded fields)
    $: filteredFieldList = fieldList;

    // 하단 우측 필드 전체 선택/해제
    $: if (filteredFieldList.length > 0) {
        isAllFieldsChecked = filteredFieldList.every((f) => f.isChecked);
    } else {
        isAllFieldsChecked = false;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
    // 상단 테스트케이스 변경 (상단 check box 상태 업데이트)
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }

    // 싱단 전문 전체 선택/해제 (상단 check box 선택/해제)
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }

    // 하단 좌측 데이터 검색조건 상태 업데이트
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList; // Svelte reactivity trigger
    }

    // 하단 우측 필드 전체 선택/해제
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }

    // 상단 전문 파일 선택시 처리 핸들러 (사용하지 않음)
    function handleMessageListFileChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);

            const newMessages = jsonData.map((row) => ({
                APP_ID: row["업무ID"] || "",
                MSG_ID: "", // 업로드 시 PK이므로 항상 비워둠 (row["전문ID"] ignored for new insert)
                MSG_KR_NM: row["전문명(한글)"] || "",
                MSG_EN_NM: row["전문명(영문)"] || "",
                MSG_TYPE: row["전문유형"] || "",
                FORMAT_GB: row["포맷"] || "",
                DIREC_GB: row["방향"] || "",
                TOT_LEN: String(row["전체길이"] || "0").replace(/[^0-9]/g, ""), // 숫자만 허용
                COMMENT: row["설명"] || "",
                isChecked: true,
                status: "N", // New
            }));

            messages = [...messages, ...newMessages];

            alert(`${newMessages.length}건의 전문이 업로드되었습니다.`);

            messageListFileInput.value = ""; // Reset input
        };

        reader.readAsArrayBuffer(file);
    }

    // 하단 우측 필드별 데이터 파일 선택시 처리 핸들러 (사용하지 않음)
    function handleFieldListFileChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);

            const newFields = jsonData.map((row) => ({
                APP_ID: selectedMessage.APP_ID,
                MSG_ID: selectedMessage.MSG_ID,
                MSGFLD_ID: "",
                FLD_EN_NM: row["필드명(영문)"] || "",
                FLD_KR_NM: row["필드명(한글)"] || "",
                FLD_TYPE: (row["필드타입"] || "STRING").toUpperCase(),
                FLD_LEN: String(row["필드길이"] || "0").replace(/[^0-9]/g, ""),
                ESSEN_YN: ["Y", "N"].includes(row["필수여부"])
                    ? row["필수여부"]
                    : "N",
                IN_DATA: "",
            }));

            // 중복 확인 없이 무조건 추가 (사용자 요청 - Append)
            fieldList = [...fieldList, ...newFields];
            // allFieldList 업데이트가 필요하다면 함께 처리 (여기서는 fieldList가 메인으로 보임)
            // allFieldList = [...allFieldList, ...newFields];

            alert(`${newFields.length}건의 필드가 추가되었습니다.`);

            fieldListFileInput.value = "";
        };

        reader.readAsArrayBuffer(file);
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div
        class="flex-none flex flex-col h-[calc(37vh-20px)] bg-white border border-gray-300 rounded shadow overflow-hidden"
    >
        <div
            class="bg-white p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">테스트케이스 조회</h2>
            <div class="flex flex-wrap items-center gap-2">
                <div class="items-center hidden">
                    <span class="text-gray-700 font-semibold px-2 text-sm"
                        >프로젝트</span
                    >
                    <select
                        bind:value={selectedProject}
                        bind:this={projectSelectElement}
                        on:change={searchJobs}
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]"
                    >
                        <option value="">프로젝트 선택</option>
                        {#each projects as project}
                            <option value={project.PRJ_ID}
                                >{project.PRJ_NM}</option
                            >
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
                        {projects.find((p) => p.PRJ_ID == selectedProject)
                            ? projects.find((p) => p.PRJ_ID == selectedProject)
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
                        bind:value={selectedJob}
                        bind:this={jobSelectElement}
                        on:change={searchMessages}
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]"
                    >
                        <option value="">업무 선택</option>
                        <!--
                        {#each jobs as job}
                            <option value={job.APP_ID}>{job.APPNM}</option>
                        {/each}
                        -->
                        {#each getAppid() as job}
                            <option value={job.appid}>{job.appname}</option>
                        {/each}
                    </select>
                </div>
                <div class="flex gap-1 ml-12">
                    <input
                        type="text"
                        bind:value={searchTestCaseKeyword}
                        placeholder="검색어 입력"
                        class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm"
                        style="width: 250px; min-width: 150px;"
                    />
                    <button on:click={searchMessages}> 조회 </button>
                    <button class="btn-excel" on:click={handleExcelDownload}>
                        엑셀 다운로드
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 overflow-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th class="text-center w-8 hidden">
                            <input
                                type="checkbox"
                                on:click={toggleAllMessages}
                            />
                        </th>
                        <th class="text-center w-10">No</th>
                        <th class="text-center hidden">상태</th>
                        <th class="text-center hidden">업무ID</th>
                        <th class="text-center hidden">업무명</th>
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >테스트케이스ID</th
                        >
                        <th
                            class="text-center"
                            style="width: 200px; min-width: 200px;"
                            >테스트케이스명</th
                        >
                        <th
                            class="text-center"
                            style="width: 140px; min-width: 130px;"
                            >테스트구분</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">작성자</th
                        >
                        <th
                            class="text-center"
                            style="width: 140px; min-width: 140px;">작성일자</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >업무담당자</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">IT담당자</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">대상서버</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">대상포트</th
                        >
                        <th
                            class="text-center"
                            style="width: 120px; min-width: 120px;">type</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;"
                            >테스트종료일</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">tdir</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">thost</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">tport</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">encval</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">pro</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">svc_cnt</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">fsvc_cnt</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">data_cnt</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">scnt</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">fcnt</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;"
                            >주비교테스트</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;"
                            >환경파일위치</th
                        >
                    </tr>
                </thead>
                <tbody class="bg-white">
                    {#each messages as msg, i}
                        <tr
                            class="hover:bg-blue-50 transition-colors border-b border-gray-200 cursor-pointer {selectedMessage ===
                            msg
                                ? 'bg-blue-100'
                                : ''}"
                            on:click={() => jobSelect(msg)}
                        >
                            <td class="text-center hidden">
                                <input
                                    type="checkbox"
                                    bind:checked={msg.isChecked}
                                    on:click|stopPropagation
                                />
                            </td>
                            <td class="text-center font-normal text-sm">
                                {i + 1}
                            </td>
                            <td class="text-center font-normal text-sm hidden">
                                {msg.status}
                            </td>
                            <td class="text-center font-normal text-sm hidden">
                                {msg.APP_ID}
                            </td>
                            <td class="text-center font-normal text-sm hidden">
                                {msg.APPNM}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_ID}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_NAME}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {#if msg.TC_GUBUN === "0"}
                                    요청
                                {:else if msg.TC_GUBUN === "1"}
                                    응답
                                {/if}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_WRITER}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_WRTDT}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_BUSMGR}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_ITMGR}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_SERVER}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.TC_PORT}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {#if msg.type === "1"}
                                    배치테스트
                                {:else if msg.type === "2"}
                                    실시간
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.endDate}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.tdir}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.thost}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.tport}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.encval}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.pro}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.svc_cnt}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.fsvc_cnt}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.data_cnt}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.scnt}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.fcnt}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.cmpCode}
                            </td>
                            <td class="text-center font-normal text-sm">
                                {msg.tenv}
                            </td>
                        </tr>
                    {/each}
                    {#if messages.length === 0}
                        <tr>
                            <td colspan="14"> 데이터가 없습니다. </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
    <div class="flex-none flex flex-row gap-4 h-[calc(50vh-20px)]">
        <div class="w-1/2 flex flex-col">
            <div
                class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
            >
                <div
                    class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                >
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-bold text-gray-700">
                            데이터 검색조건
                        </h3>
                    </div>
                    <div class="flex gap-1">
                        <input
                            type="text"
                            bind:value={searchDataKeyword}
                            placeholder="검색어 입력"
                            class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm"
                            style="width: 250px; min-width: 150px;"
                        />
                        <button on:click={handleDataSearchTrigger}>
                            조회
                        </button>
                        <button
                            class="btn-excel"
                            on:click={handleDataExcelDownload}
                        >
                            엑셀 다운로드
                        </button>
                    </div>
                </div>
                <div class="flex-1 overflow-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th
                                    class="text-center w-10"
                                    style="width: 10px; min-width: 10px;">No</th
                                >
                                <th class="text-center w-10 hidden">상태</th>
                                <th class="text-center hidden">업무ID</th>
                                <th class="text-center hidden">
                                    테스트케이스ID
                                </th>
                                <th class="text-center hidden">
                                    테스트케이스명
                                </th>
                                <th class="text-center hidden">검색조건ID</th>
                                <th class="text-center hidden">전문ID</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >전문명</th
                                >
                                <th class="text-center hidden">전문필드ID1</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >전문필드명1</th
                                >
                                <th class="text-center">검색어1</th>
                                <th class="text-center hidden">전문필드ID2</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >전문필드명2</th
                                >
                                <th class="text-center">검색어2</th>
                                <th class="text-center hidden">전문필드ID3</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >전문필드명3</th
                                >
                                <th class="text-center">검색어3</th>
                                <th class="text-center hidden">전문필드ID4</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >전문필드명4</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >검색어4</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >조회건수</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            {#each dataList as row, i}
                                <tr on:click={() => jobDataSelect(row)}>
                                    <td class="text-center">
                                        {i + 1}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.status}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.APP_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_NAME}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.SEARCH_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSG_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.MSG_KR_NM}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSGFLD01_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.MSGFLD01_NM}
                                    </td>
                                    <td class="text-center">
                                        {row.SEARCH01_NM}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSGFLD02_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.MSGFLD02_NM}
                                    </td>
                                    <td class="text-center">
                                        {row.SEARCH02_NM}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSGFLD03_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.MSGFLD03_NM}
                                    </td>
                                    <td class="text-center">
                                        {row.SEARCH03_NM}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSGFLD04_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.MSGFLD04_NM}
                                    </td>
                                    <td class="text-center">
                                        {row.SEARCH04_NM}
                                    </td>
                                    <td class="text-center">
                                        {row.SEARCH_CNT}
                                    </td>
                                </tr>
                            {/each}
                            {#if dataList.length === 0}
                                <tr>
                                    <td class="text-center" colspan="22">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="w-1/2 flex flex-col">
            <div
                class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
            >
                <div
                    class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                >
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-bold text-gray-700">
                            테스트케이스 데이터
                        </h3>
                    </div>
                    <div class="flex gap-1">
                        <input
                            type="text"
                            bind:value={searchFieldKeyword}
                            placeholder="검색어 입력"
                            class="border border-gray-300 rounded-sm px-2 py-1 font-normal text-sm focus:outline-none focus:border-blue-500"
                            style="width: 250px; min-width: 150px;"
                        />
                        <button on:click={handleFieldSearchTrigger}>
                            조회
                        </button>
                        <button
                            class="btn-excel"
                            on:click={handleFieldExcelDownload}
                        >
                            엑셀 다운로드
                        </button>
                    </div>
                </div>
                <div class="flex-1 overflow-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th class="text-center w-8">
                                    <input
                                        type="checkbox"
                                        bind:checked={isAllFieldsChecked}
                                        on:click={toggleAllFields}
                                    />
                                </th>
                                <th
                                    class="text-center"
                                    style="width: 6px; min-width: 6px;">No</th
                                >
                                <th class="text-center hidden">상태</th>
                                <th class="text-center hidden">업무ID</th>
                                <th class="text-center hidden"
                                    >테스트케이스ID</th
                                >
                                <th class="text-center hidden"
                                    >테스트케이스명</th
                                >
                                <th class="text-center hidden"
                                    >테스트케이스데이터ID</th
                                >
                                <th class="text-center hidden">검색조건 ID</th>
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >서비스/URI</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >프로토콜</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >Method</th
                                >
                                <th class="text-center hidden">전문ID</th>
                                <th
                                    class="text-left"
                                    style="width: 300px; min-width: 300px;"
                                    >전문데이터</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >송신시간</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >수신시간</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 60px; min-width: 60px;"
                                    >수행시간</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 60px; min-width: 60px;"
                                    >결과</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 60px; min-width: 60px;"
                                    >응답코드</th
                                >
                                <th class="text-center hidden">오류내역</th>
                                <th
                                    class="text-center"
                                    style="width: 160px; min-width: 160px;"
                                    >Header</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 160px; min-width: 160px;"
                                    >파라메터(GET)</th
                                >
                                <th class="text-center">소스ip</th>
                                <th class="text-center">소스port</th>
                                <th class="text-center">원본목적지ip</th>
                                <th class="text-center">원본목적지port</th>
                                <th class="text-center">목적지ip</th>
                                <th class="text-center">목적지port</th>
                                <th class="text-center">원본생성</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            {#each fieldList as field, i}
                                <tr>
                                    <td class="text-center">
                                        <input
                                            type="checkbox"
                                            bind:checked={field.isChecked}
                                        />
                                    </td>
                                    <td class="text-center">
                                        {i + 1}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.status}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.APP_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.TC_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.TC_NAME}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.TCDT_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.SEARCH_ID}
                                    </td>
                                    <td class="text-center">
                                        {field.SVC_URI}
                                    </td>
                                    <td class="text-center">
                                        {#if field.PROTOCOL_GB === "0"}
                                            TCP
                                        {:else if field.PROTOCOL_GB === "1"}
                                            HTTP
                                        {:else if field.PROTOCOL_GB === "2"}
                                            UDP
                                        {:else if field.PROTOCOL_GB === "3"}
                                            TMAX
                                        {:else}
                                            기타
                                        {/if}
                                    </td>
                                    <td class="text-center">
                                        {field.METHOD}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.MSG_ID}
                                    </td>
                                    <td class="text-left">
                                        {field.FIXEDLEN_VAL}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_SENDDT}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_RECEIVEDT}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_TIMETAKEN}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_RESULT}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_RESPCODE}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.TC_ERRLOG}
                                    </td>
                                    <td class="text-left">
                                        {field.HEADER_VAL}
                                    </td>
                                    <td class="text-left">
                                        {field.PARAM_VAL}
                                    </td>
                                    <td class="text-center">
                                        {field.srcip}
                                    </td>
                                    <td class="text-center">
                                        {field.srcport}
                                    </td>
                                    <td class="text-center">
                                        {field.o_dstip}
                                    </td>
                                    <td class="text-center">
                                        {field.o_dstport}
                                    </td>
                                    <td class="text-center">
                                        {field.dstip}
                                    </td>
                                    <td class="text-center">
                                        {field.dstport}
                                    </td>
                                    <td class="text-center">
                                        {#if field.origin === "0"}
                                            자동생성
                                        {:else if field.origin === "1"}
                                            수작업
                                        {:else}
                                            기타
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                            {#if fieldList.length === 0}
                                <tr>
                                    <td class="text-center" colspan="22">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <input
            type="file"
            accept=".xlsx, .xls"
            class="hidden"
            bind:this={messageListFileInput}
            on:change={handleMessageListFileChange}
        />
        <input
            type="file"
            accept=".xlsx, .xls"
            class="hidden"
            bind:this={fieldListFileInput}
            on:change={handleFieldListFileChange}
        />
    </div>
</div>
