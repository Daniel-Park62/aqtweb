<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";

    let loadFlag = false; //화면 로드 구분

    // 프로젝트 목록 데이터
    let projects = [];
    // 프로젝트 선택 데이터
    let projectSelectElement;
    // 검색 필터 (프로젝트 선택)
    let selectedProject = "";

    // 업무 목록 데이터
    let jobs = [];
    let jobSelectElement;
    // 검색 필터 (업무 선택)
    let selectedJob = "";

    // 전문 테이블 데이터 (메시지 목록)
    let messages = [];
    // 선택된 전문 상태
    let selectedMessage = null;

    // 하단 좌측 그리드 데이터
    let dataList = [];
    // 하단 우측 전문 필드 데이터
    let fieldList = [];

    // 필드 검색 조건
    let searchDatagubun = "1";
    let searchFieldType = "";
    let searchFieldKeyword = "";
    let searchDataKeyword = "";

    let isAllFieldsChecked = false;
    let messageListFileInput;
    let fieldListFileInput;

    // 컴포넌트 마운트 시 초기 데이터 로드
    onMount(async () => {
        await searchProjects();
        await searchJobs();

        loadFlag = true;
    });

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

    // 상단 전문 목록 조회
    async function searchMessages() {
        selectedMessage = null;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        if (!selectedJob || selectedJob === "") {
            messages = [];
            fieldList = [];
            dataList = [];

            alert("업무를 선택해 주세요.");
            return;
        }

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/list" + queryParams,
            );

            messages = await res.json();
            fieldList = [];
            dataList = [];
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 상단 전문 선택 핸들러 (필드 목록 로드)
    async function jobSelect(msg) {
        selectedMessage = msg;
        searchFieldKeyword = "";
        searchDataKeyword = "";

        // 하단 좌측 데이터 조회 함수
        await searchData(msg);
        // 하단 우측 필드 및 필드별 데이터 공백 조회 함수
        await searchFields(msg);
    }

    // 싱단 전문 전체 선택/해제 토글 핸들러
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }

    // 상단 엑셀 다운로드 핸들러
    function handleExcelDownload() {
        const ws = utils.json_to_sheet(
            messages.map((msg) => ({
                업무ID: msg.APP_ID,
                전문ID: msg.MSG_ID,
                "전문명(한글)": msg.MSG_KR_NM,
                "전문명(영문)": msg.MSG_EN_NM,
                공통전문: msg.COMMHD_ID,
                연관전문: msg.REL_MSG_ID,
                전문유형: msg.MSG_TYPE,
                포맷: msg.FORMAT_GB,
                방향: msg.DIREC_GB,
                전체길이: msg.TOT_LEN,
                설명: msg.COMMENT,
            })),
        );

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "전문리스트");

        writeFile(wb, "전문리스트.xlsx");
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 필드 검색 트리거 핸들러
    function handleDataSearchTrigger() {
        if (selectedMessage) {
            searchData(selectedMessage);
        } else {
            alert("전문을 선택해주세요.");
        }
    }

    // 하단 좌측 데이터 조회 함수
    async function searchData(msg) {
        dataList = [];

        if (!msg.MSG_ID || msg.MSG_ID === "") {
            dataList = [];
            return;
        }

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";

            if (searchDataKeyword) {
                queryParams += `&search_keyword=${searchDataKeyword}`;
            }

            const res = await fetch(`${$rooturl}/jobs/data/list` + queryParams);

            const data = await res.json();
            dataList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        }
    }

    // 하단 좌측 데이터 선택 핸들러 (필드 목록 로드)
    async function jobDataSelect(row) {
        searchFieldKeyword = "";
        fieldList = [];
        selectedMessage = row;

        // 하단 좌측 데이터 조회 함수
        await searchFieldsData(row);
    }

    // 하단 좌측 필드 변경 핸들러 (상태 업데이트)
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList; // Svelte reactivity trigger
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 우측 필드 및 필드별 양식+데이터 조회 함수
    async function searchFieldsData(msg) {
        fieldList = [];

        if (!msg.MSG_ID) return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";
            queryParams += msg.MSGDT_ID ? `&msgdt_id=${msg.MSGDT_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/listdata" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 데이터 조회 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측 필드 및 필드별 양식 조회 함수
    async function searchFields(msg) {
        fieldList = [];

        if (!msg.MSG_ID) return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/list" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 목록 로딩 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측 필드 검색 트리거 핸들러
    function handleFieldSearchTrigger() {
        if (selectedMessage) {
            if (!selectedMessage.MSGDT_ID || selectedMessage.MSGDT_ID === "") {
                searchFields(selectedMessage);
            } else {
                searchFieldsData(selectedMessage);
            }
        } else {
            alert("전문을 선택해주세요.");
        }
    }

    // 하단 우측 필드 전체 선택/해제 토글 핸들러
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }

    // 하단 우측 필드별 데이터 저장 핸들러
    async function handleFieldDataSave() {
        if (!selectedMessage) return;

        isAllFieldsChecked = true;

        // 체크된 필드만 저장하는 경우
        // const checkedFields = fieldList.filter((f) => f.isChecked);
        // if (checkedFields.length === 0) {
        //    alert("저장할 필드를 선택해주세요.");
        //    return;
        //}
        // 체크와 상관없이 모든 필드 저장하는 경우(fixed 길이로 합쳐서 저장하기 때문에 모든 필드 저장해야 함.)
        const checkedFields = fieldList.filter(
            (f) => (f.isChecked = isAllFieldsChecked),
        );

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];
        const FIXEDLEN_VAL = "";

        fieldList.forEach((f, index) => {
            if (f.isChecked) {
                const hasProject = projects.some((p) => p.PRJ_ID === f.PRJ_ID);
                const hasJob = jobs.some((j) => j.APP_ID === f.APP_ID);
                const hasMessage = messages.some((m) => m.MSG_ID === f.MSG_ID);

                if (
                    !f.PRJ_ID ||
                    !f.APP_ID ||
                    !f.MSG_ID ||
                    !hasProject ||
                    !hasJob ||
                    !hasMessage ||
                    !f.FIXED_VAL
                ) {
                    errorRows.push(index + 1); // 1-based index
                }
            }

            if (f.FLD_TYPE === "STRING") {
                f.FIXED_VAL = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else {
                f.FIXED_VAL = f.FIXED_VAL.toString().padStart(f.FLD_LEN, "0");
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 필수 정보인 입력자료가 누락되었습니다.\n입력자료를 확인해주세요.`,
            );
            return;
        }

        if (!confirm("선택한 필드 데이터를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/jobs/field/savedata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedFields),
            });

            const result = await res.json();

            //alert(`${result.count}건 필드의 단건 데이터가 저장되었습니다.`);
            alert(`단건 데이터가 저장되었습니다.`);

            await jobSelect(selectedMessage);
        } catch (error) {
            console.error("단건 데이터 저장 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    }

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
    // 하단 좌측 전문데이터 엑셀 다운로드 핸들러
    function handleDataExcelDownload() {
        if (filteredDataList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const project = projects.find(
            (p) => p.PRJ_ID == selectedMessage.PRJ_ID,
        );

        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);
        const msg = messages.find((m) => m.MSG_ID == selectedMessage.MSG_ID);

        const dataToExport = filteredDataList.map((row) => ({
            업무ID: row.APP_ID,
            전문ID: row.MSG_ID,
            전문데이터ID: row.MSGDT_ID,
            "서비스/URI": row.SVC_URI,
            프로토콜: row.PROTOCOL_GB,
            Method: row.METHOD,
            Header: row.HEADER_VAL,
            전문데이터: row.FIXEDLEN_VAL,
            "파라메터(GET)": row.PARAM_VAL,
            소스IP: row.srcip,
            소스PORT: row.srcport,
            원본목적지IP: row.o_dstip,
            원본목적지PORT: row.o_dstport,
            목적지IP: row.dstip,
            목적지PORT: row.dstport,
            원본구분: row.origin,
            응답코드: row.rcode,
            수신Header: row.RHEADER_VAL,
            수신전문데이터: row.RFIXEDLEN_VAL,
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "전문데이터");
        writeFile(wb, `전문데이터_${selectedMessage.MSG_ID}.xlsx`);
    }

    // 하단 우측 필드별 데이터 엑셀 다운로드 핸들러
    function handleFieldExcelDownload() {
        if (filteredFieldList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const project = projects.find(
            (p) => p.PRJ_ID == selectedMessage.PRJ_ID,
        );

        const job = jobs.find((j) => j.APP_ID == selectedMessage.APP_ID);
        const msg = messages.find((m) => m.MSG_ID == selectedMessage.MSG_ID);

        const dataToExport = filteredFieldList.map((field) => ({
            업무ID: field.APP_ID,
            전문ID: field.MSG_ID,
            전문필드ID: field.MSGFLD_ID,
            전문자료ID: field.MSGDT_ID,
            "필드명(영문)": field.FLD_EN_NM,
            "필드명(한글)": field.FLD_KR_NM,
            필드설명: field.FLD_CMT,
            타입: field.FLD_TYPE,
            길이: field.FLD_LEN,
            필수여부: field.ESSEN_YN,
            "포맷/패턴": field.FLD_FORMAT,
            입력자료: field.FIXED_VAL,
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "전문 필드별 데이터");
        writeFile(wb, `전문필드별데이터_${selectedMessage.MSG_ID}.xlsx`);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////
    // 상단 전문 파일 선택시 처리 핸들러 (현재는 미사용)
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

    // 상단 전문 변경 핸들러 (상단 check box 상태 업데이트) : hidden 으로 가려져 사용되고 있지 않음
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }

    // 하단 우측 필드별 데이터 파일 선택시 처리 핸들러 (현재는 미사용)
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
</script>

<!-- container mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen -->
<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div
        class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
    >
        <div
            class="bg-white p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">전문데이터 조회</h2>
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
                <!-- Job Select -->
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
                        {#each getAppid() as job}
                            <option value={job.appid}>{job.appname}</option>
                        {/each}
                        <!--
                        {#each jobs as job}
                            <option value={job.APP_ID}>{job.APPNM}</option>
                        {/each}
                        -->
                    </select>
                </div>

                <div class="flex gap-1 ml-2">
                    <button class=" transition" on:click={searchMessages}>
                        조회
                    </button>
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
                        <th class="w-8 hidden">
                            <input
                                type="checkbox"
                                on:click={toggleAllMessages}
                            />
                        </th>
                        <th class="w-10">No</th>
                        <th class="w-10 hidden">상태</th>
                        <th class="w-10 hidden">업무ID</th>
                        <th class="w-10 hidden">전문ID</th>
                        <th class="text-center">전문명(한글)</th>
                        <th class="text-center">전문명(영문)</th>
                        <th class="text-center">공통전문</th>
                        <th class="text-center">연관전문</th>
                        <th class="text-center">전문유형</th>
                        <th class="text-center">포맷</th>
                        <th class="text-center">방향</th>
                        <th class="text-center">전체길이</th>
                        <th class="text-left">설명</th>
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
                            <td class="text-center">
                                {i + 1}
                            </td>
                            <td class="text-center hidden">
                                {msg.status}
                            </td>
                            <td class="text-center hidden">
                                {msg.APP_ID}
                            </td>
                            <td class="text-center hidden">
                                {msg.MSG_ID}
                            </td>
                            <td class="text-center">
                                {msg.MSG_KR_NM}
                            </td>
                            <td class="text-center">
                                {msg.MSG_EN_NM}
                            </td>
                            <td class="text-center">
                                {msg.COMMHD_ID}
                            </td>
                            <td class="text-center">
                                {msg.REL_MSG_ID}
                            </td>
                            <td class="text-center">
                                {#if msg.MSG_TYPE === "Q"}
                                    요청
                                {:else if msg.MSG_TYPE === "R"}
                                    응답
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-center">
                                {#if msg.FORMAT_GB === "J"}
                                    JSON
                                {:else if msg.FORMAT_GB === "X"}
                                    XML
                                {:else if msg.FORMAT_GB === "F"}
                                    FIXED
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-center">
                                {#if msg.DIREC_GB === "I"}
                                    IN
                                {:else if msg.DIREC_GB === "O"}
                                    OUT
                                {:else}
                                    기타
                                {/if}
                            </td>
                            <td class="text-right">
                                {msg.TOT_LEN}
                            </td>
                            <td class="px-2 py-1 text-left font-normal text-sm">
                                {msg.COMMENT}
                            </td>
                        </tr>
                    {/each}
                    {#if messages.length === 0}
                        <tr>
                            <td
                                class="px-2 py-4 text-center text-gray-500 font-normal text-sm"
                                colspan="14"
                            >
                                데이터가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
    <div class="flex-1 flex flex-row gap-4 h-[calc(40vh-20px)]">
        <div class="w-1/2 flex flex-col">
            <div
                class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
            >
                <div
                    class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                >
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-bold text-gray-700">
                            전문데이터
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
                                    style="width: 10px; min-width: 10px;"
                                >
                                    No
                                </th>
                                <th class="text-center w-10 hidden">상태</th>
                                <th class="text-center w-10 hidden">업무ID</th>
                                <th class="text-center w-10 hidden">전문ID</th>
                                <th class="text-center w-10 hidden"
                                    >전문데이터ID</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
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
                                    style="width: 200px; min-width: 200px;"
                                    >전문데이터</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 120px; min-width: 120px;"
                                    >Header</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 120px; min-width: 120px;"
                                    >파라메터(GET)</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >소스IP</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >소스PORT</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본목적지IP</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본목적지PORT</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >목적지IP</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >목적지PORT</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본구분</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >응답코드</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 120px; min-width: 120px;"
                                    >수신Header</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 120px; min-width: 120px;"
                                    >수신전문데이터</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            {#each dataList as row, i}
                                <tr
                                    class="hover:bg-blue-50 transition-colors border-b border-gray-200 cursor-pointer"
                                    on:click={() => jobDataSelect(row)}
                                >
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
                                        {row.MSG_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {row.MSGDT_ID}
                                    </td>
                                    <td class="text-center">
                                        {row.SVC_URI}
                                    </td>
                                    <td class="text-center">
                                        {#if row.PROTOCOL_GB === "0"}
                                            TCP
                                        {:else if row.PROTOCOL_GB === "1"}
                                            HTTP
                                        {:else if row.PROTOCOL_GB === "2"}
                                            UDP
                                        {:else if row.PROTOCOL_GB === "3"}
                                            TMAX
                                        {:else}
                                            기타
                                        {/if}
                                    </td>
                                    <td class="text-center">
                                        {row.METHOD}
                                    </td>
                                    <td class="text-left">
                                        {row.FIXEDLEN_VAL}
                                    </td>
                                    <td class="text-left">
                                        {row.HEADER_VAL}
                                    </td>
                                    <td class="text-left">
                                        {row.PARAM_VAL}
                                    </td>
                                    <td class="text-center">
                                        {row.srcip}
                                    </td>
                                    <td class="text-center">
                                        {row.srcport}
                                    </td>
                                    <td class="text-center">
                                        {row.o_dstip}
                                    </td>
                                    <td class="text-center">
                                        {row.o_dstport}
                                    </td>
                                    <td class="text-center">
                                        {row.dstip}
                                    </td>
                                    <td class="text-center">
                                        {row.dstport}
                                    </td>
                                    <td class="text-center">
                                        {#if row.origin === "0"}
                                            자동생성
                                        {:else if row.origin === "1"}
                                            수작업
                                        {:else}
                                            기타
                                        {/if}
                                    </td>
                                    <td class="text-center">
                                        {row.rcode}
                                    </td>
                                    <td class="text-left">
                                        {row.RHEADER_VAL}
                                    </td>
                                    <td class="text-left">
                                        {row.RFIXEDLEN_VAL}
                                    </td>
                                </tr>
                            {/each}
                            {#if dataList.length === 0}
                                <tr>
                                    <td
                                        class="px-2 py-4 text-center text-gray-500 font-normal text-sm"
                                        colspan="22"
                                    >
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
                            전문필드별 데이터
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
                <!-- Data Table -->
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
                                    style="width: 6px; min-width: 6px;"
                                >
                                    No
                                </th>
                                <th class="w-10 hidden">상태</th>
                                <th class="w-10 hidden">PKEY</th>
                                <th class="w-10 hidden">프로젝트 ID</th>
                                <th class="w-10 hidden">업무ID</th>
                                <th class="w-10 hidden">전문ID</th>
                                <th class="w-10 hidden">전문필드ID</th>
                                <th class="w-10 hidden">전문자료ID</th>
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >필드명(영문)</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 100px; min-width: 100px;"
                                    >필드명(한글)</th
                                >
                                <th class="text-center hidden">필드설명</th>
                                <th class="text-center hidden">타입</th>
                                <th class="text-center hidden">길이</th>
                                <th class="text-center hidden">필수여부</th>
                                <th class="text-center hidden">포맷/패턴</th>
                                <th
                                    class="text-center"
                                    style="width: 300px; min-width: 300px;"
                                    >입력자료</th
                                >
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
                                        {field.PKEY}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.PRJ_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.APP_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.MSG_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.MSGFLD_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.MSGDT_ID}
                                    </td>
                                    <td class="text-left">
                                        {field.FLD_EN_NM}
                                    </td>
                                    <td class="text-left">
                                        {field.FLD_KR_NM}
                                    </td>
                                    <td class="text-left hidden">
                                        {field.FLD_CMT}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.FLD_TYPE}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.FLD_LEN}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.ESSEN_YN}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.FLD_FORMAT}
                                    </td>
                                    <td
                                        class="border-r border-gray-200 px-2 py-1 text-left font-normal text-sm"
                                        contenteditable="false"
                                        bind:textContent={field.FIXED_VAL}
                                        on:keydown={(e) => {
                                            // 1. 현재 길이가 10자 이상인지 확인
                                            // 2. 허용키(백스페이스, 삭제, 화살표, 탭 등)가 아닌지 확인
                                            // 3. 단축키(Ctrl+C, Ctrl+V 등)가 아닌지 확인
                                            if (
                                                field.FIXED_VAL &&
                                                field.FIXED_VAL.length >=
                                                    field.FLD_LEN &&
                                                ![
                                                    "Backspace",
                                                    "Delete",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "Tab",
                                                    "Home",
                                                    "End",
                                                ].includes(e.key) &&
                                                !e.ctrlKey &&
                                                !e.metaKey
                                            ) {
                                                e.preventDefault(); // 입력 차단
                                            }
                                        }}
                                        on:input={() => {
                                            // 붙여넣기 등으로 10자가 넘어갔을 경우를 대비해 자르기
                                            if (
                                                field.FIXED_VAL.length >
                                                field.FLD_LEN
                                            ) {
                                                field.FIXED_VAL =
                                                    field.FIXED_VAL.slice(
                                                        0,
                                                        field.FLD_LEN,
                                                    );
                                            }
                                            handleFieldChange(field);
                                        }}
                                    >
                                    </td>
                                </tr>
                            {/each}
                            {#if fieldList.length === 0}
                                <tr>
                                    <td
                                        class="px-2 py-4 text-center text-gray-500 font-normal text-sm"
                                        colspan="22"
                                    >
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
