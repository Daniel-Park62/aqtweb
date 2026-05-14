<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";
    //////////////////////////////////////////////////////////////////////////////////////////////
    let loadFlag = false; //화면 로드 구분

    // 프로젝트 선택 데이터
    let projectSelectElement;
    // 프로젝트 선택
    let selectedProject = "";
    // 프로젝트 목록 데이터
    let projects = [];

    // 업무 선택 데이터
    let jobSelectElement;
    // 업무 선택
    let selectedJob = "";
    // 업무 목록 데이터
    let jobs = [];

    // 상단 검색어
    let searchTestCaseKeyword = "";
    // 상단 선택 데이터
    let selectedMessage = "";
    // 상단 그리드
    let messages = [];

    // 하단 좌측 검색어
    let searchFieldKeyword = "";
    // 하단 좌측 그리드
    let dataList = [];

    // 하단 우측 검색어
    let searchDataKeyword = "";
    // 하단 우측 그리드
    let fieldList = [];

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
    // 상단 시나리오 목록 조회
    async function searchMessages() {
        selectedMessage = null;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";

        if (searchTestCaseKeyword) {
            queryParams += `&search_keyword=${searchTestCaseKeyword}`;
        }

        try {
            const res = await fetch(
                $rooturl + "/testSinalio/message/list" + queryParams,
            );

            messages = await res.json();
            fieldList = [];
            dataList = [];
        } catch (error) {
            console.error("시나리오 목록 로딩 실패:", error);
        }
    }

    // 상단 시나리오 선택
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
                시나리오ID: msg.SIO_ID || "",
                시나리오명: msg.SIO_NM || "",
                관리자: msg.SIO_OWNER || "",
                수행주체: msg.SIO_ACTOR || "",
                요구사항: msg.SIO_REQID || "",
                예상시간: msg.SIO_ESTTM || "",
                "수행단계(차수)": msg.SIO_EXEPHASE || "",
                실행일자: msg.SIO_LASTRDT || "",
                설명: msg.SIO_DESC || "",
            })),
        );

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "시나리오리스트");

        writeFile(wb, "시나리오리스트.xlsx");
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 시나리오별 테스트케이스 검색어 입력 후 조회
    function handleDataSearchTrigger() {
        if (selectedMessage) {
            searchData(selectedMessage);
        } else {
            alert("시나리오를 선택해주세요.");
        }
    }

    // 하단 좌측 시나리오별 테스트케이스 조회
    async function searchData(msg) {
        dataList = [];

        if (!msg.SIO_ID || msg.SIO_ID === "") {
            dataList = [];
            return;
        }

        try {
            let queryParams = msg.SIO_ID ? `?sio_id=${msg.SIO_ID}` : "";

            if (searchDataKeyword) {
                queryParams += `&search_keyword=${searchDataKeyword}`;
            }

            const res = await fetch(
                `${$rooturl}/testSinalio/data/list` + queryParams,
            );

            const data = await res.json();
            dataList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        }
    }

    // 하단 좌측 시나리오별 테스트케이스 데이터 선택 (선택된 검색조건 데이터의 하단 우측 테스트케이스 데이터 조회)
    async function jobDataSelect(row) {
        searchFieldKeyword = "";
        fieldList = [];
        selectedMessage = row;

        // 하단 좌측 데이터 조회 함수
        await searchFieldsData(row);
    }

    // 하단 좌측 엑셀 다운로드
    function handleDataExcelDownload() {
        if (filteredDataList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const project = projects.find(
            (p) => p.PRJ_ID == selectedMessage.PRJ_ID,
        );
        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);

        const dataToExport = filteredDataList.map((row) => ({
            시나리오ID: row.SIO_ID || "",
            시나리오테스트케이스ID: row.SITC_ID || "",
            테스트케이스ID: row.TC_ID || "",
            테스트케이스명: row.TC_NAME || "",
            수행순서: row.SITC_ORD || 0,
            테스트구분:
                row.TC_GUBUN === "0"
                    ? "단위테스트"
                    : row.TC_GUBUN === "1"
                      ? "통합테스트"
                      : row.TC_GUBUN === "2"
                        ? "성능테스트"
                        : "",
            작성자: row.TC_WRITER || "",
            작성일자: row.TC_WRTDT || "",
            업무담당자: row.TC_BUSMGR || "",
            IT담당자: row.TC_ITMGR || "",
            대상서버: row.TC_SERVER || "",
            대상포트: row.TC_PORT || 0,
            시작시간: row.SITC_STDT || "",
            종료시간: row.SITC_EDDT || "",
            소요시간: row.SITC_DURTM || "",
            수행결과:
                row.SITC_RESULT === "1"
                    ? "정상"
                    : row.SITC_RESULT === "2"
                      ? "실패"
                      : "",
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "데이터검색조건");
        writeFile(wb, `데이터검색조건.xlsx`);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 우측 테스트케이스 데이터 조회
    async function searchFieldsData(msg) {
        fieldList = [];

        if (!msg.SIO_ID) return;

        try {
            let queryParams = msg.SIO_ID ? `?sio_id=${msg.SIO_ID}` : "";
            queryParams += msg.SITC_ID ? `&stic_id=${msg.SITC_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/testSinalio/field/listdata" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 데이터 조회 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측 테스트케이스 데이터 검색어 조회
    function handleFieldSearchTrigger() {
        if (selectedMessage) {
            searchFieldsData(selectedMessage);
        } else {
            alert("시나리오를 선택해주세요.");
        }
    }

    // 하단 우측 엑셀 다운로드
    function handleFieldExcelDownload() {
        if (filteredFieldList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const project = projects.find(
            (p) => p.PRJ_ID == selectedMessage.PRJ_ID,
        );
        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);

        const dataToExport = filteredFieldList.map((field) => ({
            시나리오ID: field.SIO_ID || "",
            시나리오테스트케이스ID: field.SITC_ID || "",
            시나리오데이터ID: field.SITCD_ID || "",
            "서비스/URI": field.SVC_URI || "",
            프로토콜:
                field.PROTOCOL_GB === "0"
                    ? "TCP"
                    : field.PROTOCOL_GB === "1"
                      ? "HTTP"
                      : field.PROTOCOL_GB === "2"
                        ? "UDP"
                        : field.PROTOCOL_GB === "3"
                          ? "TMAX"
                          : "",
            Method: field.METHOD || "",
            전문데이터: field.FIXEDLEN_VAL || "",
            송신시간: field.TC_SENDDT || "",
            수신시간: field.TC_RECEIVEDT || "",
            수행시간: field.TC_TIMETAKEN || "",
            결과:
                field.TCDT_RESULT === "1"
                    ? "정상"
                    : field.TCDT_RESULT === "2"
                      ? "실패"
                      : "",
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
            원본생성:
                field.origin === "0"
                    ? "자동생성"
                    : field.origin === "1"
                      ? "수작업등록"
                      : "",
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "테스트케이스 전문 데이터");
        writeFile(wb, `테스트케이스전문데이터.xlsx`);
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////
    // 상단 시나리오 변경
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }

    // 싱단 시나리오 전체 선택/해제
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }
    /////////////////////////////////////////////////
    // 하단 좌측 검색 반응형 업데이트
    $: filteredDataList = dataList;

    // 하단 좌측 검색 상태 업데이트
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList; // Svelte reactivity trigger
    }
    /////////////////////////////////////////////////
    // 하단 우측 검색 반응형 업데이트 (Client-side filtering of loaded fields)
    $: filteredFieldList = fieldList;

    // 하단 우측 전체 선택/해제
    $: if (filteredFieldList.length > 0) {
        isAllFieldsChecked = filteredFieldList.every((f) => f.isChecked);
    } else {
        isAllFieldsChecked = false;
    }

    // 하단 우측 테스트케이스 데이터 전체 선택/해제
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }
    /////////////////////////////////////////////////
    // 엑셀업로드(사용하지 않음)
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
                PKEY: "",
                PRJ_ID: row["프로젝트 ID"] || "",
                APP_ID: row["업무그룹ID"] || "",
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

    // 엑셀업로드(사용하지 않음)
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
                PRJ_ID: selectedMessage.PRJ_ID,
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
            <h2 class="text-xl font-bold text-gray-700">시나리오 조회</h2>
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
                <div class="items-center hidden">
                    <span class="text-gray-700 font-semibold px-2 text-sm"
                        >업무</span
                    >
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
                        <th class="text-center w-10 hidden">No</th>
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">시나리오ID</th
                        >
                        <th
                            class="text-center"
                            style="width: 180px; min-width: 180px;"
                            >시나리오명</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">관리자</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">수행주체</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">요구사항</th
                        >
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">예상시간</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >수행단계(차수)</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">실행일자</th
                        >
                        <th
                            class="text-left"
                            style="width: 300px; min-width: 300px;">설명</th
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
                            <td class="text-center hidden">
                                {i + 1}
                            </td>
                            <td class="text-center">
                                {msg.SIO_ID}
                            </td>
                            <td class="text-left">
                                {msg.SIO_NM}
                            </td>
                            <td class="text-center">
                                {msg.SIO_OWNER}
                            </td>
                            <td class="text-center">
                                {msg.SIO_ACTOR}
                            </td>
                            <td class="text-center">
                                {msg.SIO_REQID}
                            </td>
                            <td class="text-center">
                                {msg.SIO_ESTTM}
                            </td>
                            <td class="text-center">
                                {msg.SIO_EXEPHASE}
                            </td>
                            <td class="text-center">
                                {msg.SIO_LASTRDT}
                            </td>
                            <td class="text-left">
                                {msg.SIO_DESC}
                            </td>
                        </tr>
                    {/each}
                    {#if messages.length === 0}
                        <tr>
                            <td class="text-center" colspan="14">
                                데이터가 없습니다.
                            </td>
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
                            시나리오별 테스트케이스
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
                                    class="text-center hidden"
                                    style="width: 10px; min-width: 10px;">No</th
                                >
                                <th class="text-center hidden">상태</th>
                                <th class="text-center hidden">시나리오ID</th>
                                <th class="text-center hidden"
                                    >시나리오테스트케이스ID</th
                                >
                                <th class="text-center">테스트케이스ID</th>
                                <th
                                    class="text-center"
                                    style="width: 200px; min-width: 200px;"
                                    >테스트케이스명</th
                                >
                                <th class="text-center">수행순서</th>
                                <th class="text-center">테스트구분</th>
                                <th class="text-center hidden">작성자</th>
                                <th class="text-center hidden">작성일자</th>
                                <th class="text-center hidden">업무담당자</th>
                                <th class="text-center hidden">IT담당자</th>
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >대상서버</th
                                >
                                <th class="text-center">대상포트</th>
                                <th class="text-center">시작시간</th>
                                <th class="text-center">종료시간</th>
                                <th class="text-center">소요시간</th>
                                <th class="text-center">수행결과</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            {#each dataList as row, i}
                                <tr on:click={() => jobDataSelect(row)}>
                                    <td class="text-center hidden">
                                        {i + 1}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.status}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.SIO_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.SITC_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.TC_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.TC_NAME}
                                    </td>
                                    <td class="text-center">
                                        {row.SITC_ORD}
                                    </td>
                                    <td class="text-center">
                                        {#if row.TC_GUBUN === "0"}
                                            단위테스트
                                        {:else if row.TC_GUBUN === "1"}
                                            통합테스트
                                        {:else if row.TC_GUBUN === "2"}
                                            성능테스트
                                        {/if}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_WRITER}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_WRTDT}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_BUSMGR}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.TC_ITMGR}
                                    </td>
                                    <td class="text-center">
                                        {row.TC_SERVER}
                                    </td>
                                    <td class="text-center">
                                        {row.TC_PORT}
                                    </td>
                                    <td class="text-center">
                                        {row.SITC_STDT}
                                    </td>
                                    <td class="text-center">
                                        {row.SITC_EDDT}
                                    </td>
                                    <td class="text-center">
                                        {row.SITC_DURTM}
                                    </td>
                                    <td class="text-center">
                                        {#if row.SITC_RESULT === "1"}
                                            정상
                                        {:else if row.SITC_RESULT === "2"}
                                            실패
                                        {/if}
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
                                <th class="text-center w-8 hidden">
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
                                <th class="text-center hidden">시나리오ID</th>
                                <th class="text-center hidden"
                                    >시나리오테스트케이스ID</th
                                >
                                <th class="text-center hidden"
                                    >시나리오데이터ID</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
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
                                <th
                                    class="text-left"
                                    style="width: 300px; min-width: 300px;"
                                    >전문데이터</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 160px; min-width: 160px;"
                                    >송신시간</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 160px; min-width: 160px;"
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
                                    style="width: 200px; min-width: 200px;"
                                    >Header</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 200px; min-width: 200px;"
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
                                    <td class="text-center hidden">
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
                                        {field.SIO_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.SITC_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.SITCD_ID}
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
