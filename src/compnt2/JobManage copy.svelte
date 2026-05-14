<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";

    let loadFlag = false; //화면 로드 구분
    // 프로젝트 목록 데이터
    let projects = [];
    let projectSelectElement;
    // 업무 목록 데이터
    let jobs = [];
    let jobSelectElement;

    // 전문 테이블 데이터 (메시지 목록)
    let messages = [];

    // 선택된 전문 상태
    let selectedMessage = null;

    // 전문 필드 데이터
    let fieldList = [];

    // Search Filters
    // 검색 필터 (프로젝트 및 업무 선택)
    let selectedProject = "";
    let selectedJob = "";

    // Field Search
    // 필드 검색 조건
    let searchFieldType = "";
    let searchFieldKeyword = "";

    let commHeaders = [];   // 공통전문 목록
    let relMsgs = [];       // 연관전문 목록
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
    // 상단 전문 목록 조회
    async function searchMessages() {
        commHeaders = [];   // 공통전문 목록

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        if (!selectedJob || (selectedJob === "")) {
             messages = [];
             fieldList = [];

            alert("업무를 선택해 주세요.");
            return;
        }

        await searchCommHeader();
        await searchRelMsg();

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/list" + queryParams,
            );
            
            messages = await res.json();
            fieldList = [];
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 상단 전문 변경 핸들러 (상태 업데이트)
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }

    // 상단 전문 선택 핸들러 (필드 목록 로드)
    async function jobSelect(msg) {
        selectedMessage = msg;
        searchFieldKeyword = "";

        // Load fields for this message
        await searchFields(msg);
    }

    // 상단 전문 추가 핸들러
    function handleMessageAdd(){
        if (!selectedJob) {
            alert("업무를 선택해주세요.");
            return;
        }

        if (!Array.isArray(messages)) {
            messages = [];
        }

        const newMessages = {
            APP_ID          : selectedJob,
            MSG_ID          : "",
            COMMHD_ID       : "",
            MSG_KR_NM       : "",
            MSG_EN_NM       : "",
            REL_MSG_ID      : "",
            MSG_TYPE        : "",
            FORMAT_GB       : "",
            DIREC_GB        : "",
            TOT_LEN         : "0",
            COMMENT         : "",
            isChecked       : true,
            status          : "N", // New
        };

        messages = [...messages, newMessages];
    }

    // 상단 전문 삭제 핸들러
    async function handleMessageDelete(){
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("삭제할 전문을 선택해주세요.");
            return;
        }

        if (!confirm("선택한 전문 정보를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/jobs/message/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count}건의 전문이 삭제되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("전문 삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    }

    // 상단 전문 저장 핸들러
    async function handleMessageSave() {
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("저장할 전문을 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];
        
        messages.forEach((m, index) => {
            if (m.isChecked) {
                const hasJob = jobs.some((j) => j.APP_ID == m.APP_ID);

                if (!m.APP_ID || !hasJob) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(`${errorRows.join(", ")} 행에 업무ID가 없습니다.\n업무ID를 확인해주세요.`);

            return;
        }

        // Add confirmation dialog
        if (!confirm("선택한 전문 정보를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/jobs/message/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count}건의 전문이 저장되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("전문 저장 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    }

    // 상단 복사
    function cpydata() {
        alert("복사 버튼 클릭!!")
    }

    let messageListFileInput;
    let fieldListFileInput;

    // 상단 엑셀업로드 처리
    function handleExcelUpload() {
        messageListFileInput.click();
    }

    // 상단 엑셀업로드 처리
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
                APP_ID      : row["업무ID"] || "",
                MSG_ID      : "",
                MSG_KR_NM   : row["전문명(한글)"] || "",
                MSG_EN_NM   : row["전문명(영문)"] || "",
                COMMHD_ID   : row["공통전문"] || "",
                REL_MSG_ID  : row["연관전문"] || "",
                MSG_TYPE    : row["전문유형"] || "",
                FORMAT_GB   : row["포맷"] || "",
                DIREC_GB    : row["방향"] || "",
                TOT_LEN     : String(row["전체길이"] || "0").replace(/[^0-9]/g, ""), // 숫자만 허용
                COMMENT     : row["설명"] || "",
                isChecked   : true,
                status      : "N", // New
            }));

            messages = [...messages, ...newMessages];

            alert(`${newMessages.length}건의 전문이 업로드되었습니다.`);

            messageListFileInput.value = ""; // Reset input
        };

        reader.readAsArrayBuffer(file);
    }

    // 상단 엑셀다운로드 처리
    function handleExcelDownload() {
        const ws = utils.json_to_sheet(
            messages.map((msg) => ({
                "업무ID"            : msg.APP_ID,
                "업무명"            : msg.APPNM || "",
                "전문ID"            : msg.MSG_ID,
                "전문명(한글)"      : msg.MSG_KR_NM || "",
                "전문명(영문)"      : msg.MSG_EN_NM || "",
                "공통전문"          : msg.COMMHD_ID,
                "연관전문"          : msg.REL_MSG_ID,
                "전문유형"          : msg.MSG_TYPE,
                "포맷"              : msg.FORMAT_GB,
                "방향"              : msg.DIREC_GB,
                "전체길이"          : msg.TOT_LEN,
                "설명"              : msg.COMMENT || "",
            })),
        );

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Message_List");

        writeFile(wb, "Message_List.xlsx");
    }

    // 상단 공통전문 목록 조회
    async function searchCommHeader() {
        commHeaders = [];   // SVC/URI 목록

        if (!selectedJob) return;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/commheaderlist" + queryParams,
            );

            commHeaders = await res.json();

        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 상단 연관전문 목록 조회
    async function searchRelMsg() {
        relMsgs = [];   // 연관업무ID

        if (!selectedJob) return;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/relmsglist" + queryParams,
            );

            relMsgs = await res.json();

        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 전문필드 검색 반응형 업데이트
    $: filteredFieldList = fieldList;

    // 하단 전문필드 변경 (상태 업데이트)
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList; // Svelte reactivity trigger
    }

    // 하단 전문필드 전체 선택/해제
    let isAllFieldsChecked = false;
    $: if (filteredFieldList.length > 0) {
        isAllFieldsChecked = filteredFieldList.every((f) => f.isChecked);
    } else {
        isAllFieldsChecked = false;
    }

    // 하단 전문필드 전체 선택/해제
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }

    // 하단 전문필드 전체 선택/해제
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }

    // 하단 전문필드 검색
    function handleFieldSearchTrigger() {
        if (selectedMessage) {
            searchFields(selectedMessage);
        } else {
            alert("전문을 선택해주세요.");
        }
    }

    // 하단 전문필드 조회 함수
    async function searchFields(msg) {
        if (!msg.MSG_ID) 
            return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";

            // Add search keyword
            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/Messlist" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
            // Reset checked status or other UI states if needed
        } catch (error) {
            console.error("필드 목록 로딩 실패:", error);
            fieldList = [];
        }
    }

    // 하단 전문필드 추가
    function handleFieldAdd() {
        if (!selectedMessage) {
            alert("전문을 선택해주세요.");
            return;
        }

        if (!selectedMessage.MSG_ID) {
            alert(
                "선택된 전문이 없습니다. \n전문을 다시 선택하거나 전문 등록후 진행해 주세요.",
            );
            return;
        }

        if (!Array.isArray(fieldList)) {
            fieldList = [];
        }

        const newField = {
            APP_ID          : selectedMessage.APP_ID,
            MSG_ID          : selectedMessage.MSG_ID,
            MSGFLD_ID       : "",
            FLD_EN_NM       : "",
            FLD_KR_NM       : "",
            FLD_TYPE        : "",
            FLD_LEN         : "0",
            FLD_CMT         : "",
            FLD_SGMT        : "0",
            ST_POS          : "0",
            FLD_DEPTH       : "0",
            REPET_NUM       : "1",
            FLD_ORDER       : (fieldList.length + 1).toString(),
            ESSEN_YN        : "N",
            DEFAULT_VAL     : "",
            FLD_FORMAT      : "",
            DY_YN           : "",
            DY_KIND         : "",
            isChecked       : true,
            status          : "N", // New
        };

        fieldList = [...fieldList, newField];
    }

    // 하단 전문필드 삭제
    async function handleFieldDelete() {
        if (!selectedMessage) 
            return;

        const checkedFields = fieldList.filter((f) => f.isChecked);

        if (checkedFields.length === 0) {
            alert("삭제할 필드를 선택해주세요.");
            return;
        }

        if (!confirm(`${checkedFields.length}개의 필드를 삭제하시겠습니까?`))
            return;

        try {
            const persistedItems = checkedFields.filter(
                (f) => f.status !== "N",
            );

            if (persistedItems.length > 0) {
                await fetch($rooturl + "/jobs/field/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(persistedItems),
                });
            }

            alert("삭제되었습니다.");

            await searchFields(selectedMessage);
        } catch (error) {
            console.error("필드 삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    }

    // 하단 전문필드 저장
    async function handleFieldSave() {
        if (!selectedMessage) return;

        const checkedFields = fieldList.filter((f) => f.isChecked);

        if (checkedFields.length === 0) {
            alert("저장할 필드를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        fieldList.forEach((f, index) => {
            if (f.isChecked) {
                if (!f.FLD_EN_NM || !f.FLD_KR_NM) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(`${errorRows.join(", ")} 행에 필수 정보가 누락되었습니다.\n필드명(영문/한글)을 확인해주세요.`);

            return;
        }

        // Add confirmation dialog
        if (!confirm("선택한 필드 정보를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/jobs/field/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedFields),
            });

            const result = await res.json();

            alert(`${result.count}건의 필드가 저장되었습니다.`);

            await jobSelect(selectedMessage);
        } catch (error) {
            console.error("필드 저장 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    }

    // 하단 전문필드 엑셀다운로드
    function handleFieldExcelDownload() {
        if (!selectedMessage) {
            alert("먼저 전문을 선택해주세요.");
            return;
        }

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
            "업무ID"            : field.APP_ID,
            "전문ID"            : field.MSG_ID,
            "전문명"            : msg ? msg.MSG_KR_NM : "",
            "전문필드ID"        : field.MSGFLD_ID,
            "필드명(영문)"      : field.FLD_EN_NM,
            "필드명(한글)"      : field.FLD_KR_NM,
            "타입"              : field.FLD_TYPE,
            "자리수"            : field.FLD_LEN,
            "설명"              : field.FLD_CMT,
            "세그먼트"          : field.FLD_SGMT,
            "시작위치"          : field.ST_POS,
            "깊이"              : field.FLD_DEPTH,
            "반복횟수"          : field.REPET_NUM,
            "순서"              : field.FLD_ORDER,
            "필수여부"          : field.ESSEN_YN,
            "기본값"            : field.DEFAULT_VAL,
            "포맷/패턴"         : field.FLD_FORMAT,
            "Dynamic여부"       : field.DY_YN,
            "Dynamic종류"       : field.DY_KIND,
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "전문필드목록");
        writeFile(wb, `전문필드목록_${selectedMessage.MSG_ID}.xlsx`);
    }

    // 하단 전문필드 엑셀업로드
    function handleFieldExcelUpload() {
        if (!selectedMessage) {
            alert("먼저 전문을 선택해주세요.");
            return;
        }

        fieldListFileInput.click();
    }

    // 하단 전문필드 엑셀업로드
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
                APP_ID          : selectedMessage.APP_ID,
                MSG_ID          : selectedMessage.MSG_ID,
                MSGFLD_ID       : "",
                FLD_EN_NM       : row["필드명(영문)"] || "",
                FLD_KR_NM       : row["필드명(한글)"] || "",
                FLD_TYPE        : (row["타입"] || "STRING").toUpperCase(),
                FLD_LEN         : String(row["자리수"] || "0").replace(/[^0-9]/g, ""),
                FLD_CMT         : row["설명"] || "",
                FLD_SGMT        : row["세그먼트"] || "0",
                ST_POS          : String(row["시작위치"] || "0").replace(/[^0-9]/g, ""),
                REPET_NUM       : String(row["반복횟수"] || "1").replace(/[^0-9]/g, ""),
                FLD_ORDER       : String(row["순서"] || (fieldList.length + 1).toString(),).replace(/[^0-9]/g, ""),
                ESSEN_YN        : ["Y", "N"].includes(row["필수여부"]) ? row["필수여부"]: "N",
                DEFAULT_VAL     : row["기본값"] || "",
                FLD_FORMAT      : row["포맷/패턴"] || "",
                DY_YN         : row["Dynamic여부"] || "",
                DY_KIND         : row["Dynamic종류"] || "",
                isChecked       : true,
                status          : "N",
            }));

            fieldList = [...fieldList, ...newFields];

            alert(`${newFields.length}건의 필드가 추가되었습니다.`);
            
            fieldListFileInput.value = "";
        };

        reader.readAsArrayBuffer(file);
    }
</script>

<div class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4">
    <div class="bg-white flex-1 flex flex-col border border-gray-300 rounded shadow overflow-hidden">
        <div class="bg-white p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
            <h2 class="text-xl font-bold text-gray-700">업무전문</h2>
            <div class="flex flex-wrap items-center gap-2">
                <div class="items-center hidden">
                    <span class="text-gray-700 font-semibold px-2 text-sm">프로젝트</span>
                    <select bind:value={selectedProject}
                            bind:this={projectSelectElement}
                            on:change={searchJobs}
                            class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]">
                        <option value="">프로젝트 선택</option>
                        {#each projects as project}
                            <option value={project.PRJ_ID}>{project.PRJ_NM}</option>
                        {/each}
                    </select>
                </div>
                <div class="items-center hidden">
                    <span class="w-32 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300">
                        프로젝트
                    </span>
                    <span class="w-40 mr-1 text-sm font-bold text-left text-gray-600 px-2 py-1 border border-gray-300">
                        {projects.find((p) => p.PRJ_ID == selectedProject) ? projects.find((p) => p.PRJ_ID == selectedProject).PRJ_NM : ""}
                    </span>
                </div>
                <div class="flex items-center">
                    <span class="w-32 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300">
                        업무
                    </span>
                    <select bind:value={selectedJob}
                            bind:this={jobSelectElement}
                            on:change={searchMessages}
                            class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]">
                        <option value="">업무 선택</option>
                        {#each jobs as job}
                            <option value={job.APP_ID}>{job.APPNM}</option>
                        {/each}
                    </select>
                </div>
                <div class="flex gap-1 ml-2">
                    <button on:click={searchMessages}
                            class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition">
                        조회
                    </button>
                    <button on:click={handleMessageAdd}
                            class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition">
                        추가
                    </button>
                    <button on:click={handleMessageDelete}
                            class="bg-white hover:bg-red-50 text-red-600 font-semibold hover:text-red-700 px-3 py-1 text-xs rounded border border-red-300 hover:border-red-400 transition">
                        삭제
                    </button>
                    <button on:click={handleMessageSave}
                            class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition">
                        저장
                    </button>
<!--
                    <button on:click={cpydata}
                            class="bg-white hover:bg-amber-50 text-amber-950 font-semibold hover:text-amber-700 px-3 py-1 text-xs rounded border border-amber-300 hover:border-amber-400 transition">
                        복사
                    </button>
-->                                        
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <!-- 엑셀 버튼 (헤더로 이동) -->
                    <button on:click={handleExcelUpload}
                            class="bg-white hover:bg-green-50 text-green-600 font-semibold hover:text-green-700 px-3 py-1 text-xs rounded border border-green-300 hover:border-green-400 transition">
                        엑셀 업로드
                    </button>
                    <button on:click={handleExcelDownload}
                            class="bg-white hover:bg-green-50 text-green-600 font-semibold hover:text-green-700 px-3 py-1 text-xs rounded border border-green-300 hover:border-green-400 transition">
                        엑셀 다운로드
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 overflow-auto">
            <table class="min-w-full border-collapse text-sm whitespace-nowrap">
                <thead class="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-8">
                            <input type="checkbox" on:click={toggleAllMessages}/>
                        </th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-10">No</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-10 hidden">상태</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">업무ID</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">업무명</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">전문ID</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 180px; min-width: 180px;">전문명(한글)</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 180px; min-width: 180px;">전문명(영문)</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">공통전문</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">연관전문</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">전문유형</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">포맷</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">방향</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 80px; min-width: 80px;">전체길이</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100">설명</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    {#each messages as msg, i}
                        <tr class="hover:bg-blue-50 transition-colors border-b border-gray-200 cursor-pointer {selectedMessage === msg ? 'bg-blue-100' : ''}" on:click={() => jobSelect(msg)}>
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                <input type="checkbox" bind:checked={msg.isChecked} on:click|stopPropagation />
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                {i + 1}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center font-semibold {msg.status === 'D' ? 'text-red-500' : msg.status === 'N' ? 'text-green-600' : 'text-gray-600'} hidden">
                                {msg.status}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                <input type="text" 
                                        class="w-full bg-transparent text-center focus:outline-none" 
                                        value={msg.APP_ID} 
                                        readonly={msg.status !== "N"} 
                                        title={msg.APP_ID}
                                        on:input={(e) => {
                                            msg.APP_ID = e.currentTarget.value;
                                            handleMessageChange(msg);
                                        }}
                                />
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {jobs.find((p) => p.APP_ID == msg.APP_ID) ?.APPNM || ""}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {msg.MSG_ID}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left"
                                contenteditable="true"
                                bind:textContent={msg.MSG_KR_NM}
                                on:input={() => handleMessageChange(msg)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left"
                                contenteditable="true"
                                bind:textContent={msg.MSG_EN_NM}
                                on:input={() => handleMessageChange(msg)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                <select bind:value={msg.COMMHD_ID}
                                        on:change={() => handleMessageChange(msg)}
                                        class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]">
                                    <option value="" disabled>공통전문 선택</option>
                                    {#each commHeaders as commHeader}
                                        <option value={commHeader.COMMHD_ID}>{commHeader.COMMHD_KR_NM}</option>
                                    {/each}
                                </select>
                            </td>

                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                <select bind:value={msg.REL_MSG_ID}
                                        on:change={() => handleMessageChange(msg)}
                                        class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]">
                                    <option value="" disabled>연관전문 선택</option>
                                    {#each relMsgs as relMsg}
                                        <option value={relMsg.MSG_ID}>{relMsg.MSG_KR_NM}</option>
                                    {/each}
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <select bind:value={msg.MSG_TYPE}
                                        on:change={() => handleMessageChange(msg)}
                                        class="w-full h-full border-none focus:ring-0 bg-transparent text-center">
                                    <option value="" disabled>전문유형 선택</option>
                                    <option value="Q">요청</option>
                                    <option value="R">응답</option>
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <select bind:value={msg.FORMAT_GB}
                                        on:change={() => handleMessageChange(msg)}
                                        class="w-full h-full border-none focus:ring-0 bg-transparent text-center">
                                    <option value="" disabled>포맷 선택</option>
                                    <option value="J">JSON</option>
                                    <option value="X">XML</option>
                                    <option value="F">FIXED</option>
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <select bind:value={msg.DIREC_GB}
                                        on:change={() => handleMessageChange(msg)}
                                        class="w-full h-full border-none focus:ring-0 bg-transparent text-center">
                                    <option value="" disabled>방향 선택</option>
                                    <option value="I">IN</option>
                                    <option value="O">OUT</option>
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-right"
                                contenteditable="true"
                                bind:textContent={msg.TOT_LEN}
                                on:input={(e) => {
                                    handleMessageChange(msg);
                                    const cleaned = e.target.textContent.replace(/[^0-9]/g, "");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        msg.TOT_LEN = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                }}>
                            </td>
                            <td class="px-2 py-1 text-left" contenteditable="true" bind:textContent={msg.COMMENT} on:input={() => handleMessageChange(msg)}>
                            </td>
                        </tr>
                    {/each}
                    {#if messages.length === 0}
                        <tr>
                            <td class="px-2 py-4 text-center text-gray-500" colspan="14">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
    <div class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2">
            <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-gray-700">업무전문 필드</h3>
            </div>
            <div class="flex gap-1">
                <input type="text"
                        bind:value={searchFieldKeyword}
                        placeholder="검색어 입력"
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                         style="width: 350px; min-width: 200px;"
                />
                <button on:click={handleFieldSearchTrigger}
                        class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition">
                    조회
                </button>
                <button on:click={handleFieldAdd}
                        class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition">
                    추가
                </button>
                <button
                    on:click={handleFieldDelete}
                    class="bg-white hover:bg-red-50 text-red-600 font-semibold hover:text-red-700 px-3 py-1 text-xs rounded border border-red-300 hover:border-red-400 transition"
                >
                    삭제
                </button>
                <button
                    on:click={handleFieldSave}
                    class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition"
                >
                    저장
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <!-- Separator -->
                <button
                    on:click={handleFieldExcelUpload}
                    class="bg-white hover:bg-green-50 text-green-600 font-semibold hover:text-green-700 px-3 py-1 text-xs rounded border border-green-300 hover:border-green-400 transition"
                >
                    엑셀 업로드
                </button>
                <button
                    on:click={handleFieldExcelDownload}
                    class="bg-white hover:bg-green-50 text-green-600 font-semibold hover:text-green-700 px-3 py-1 text-xs rounded border border-green-300 hover:border-green-400 transition"
                >
                    엑셀 다운로드
                </button>
            </div>
        </div>
        <div class="flex-1 overflow-auto">
            <table class="min-w-full border-collapse text-sm whitespace-nowrap">
                <thead class="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-8">
                            <input type="checkbox" bind:checked={isAllFieldsChecked} on:click={toggleAllFields}/>
                        </th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-10">No</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 w-10 hidden">상태</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">업무ID</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">업무명</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">전문ID</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">전문명</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden">전문필드ID</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">필드명(영문)</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">필드명(한글)</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">타입</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 100px; min-width: 100px;">자리수</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden" style="width: 100px; min-width: 100px;">설명</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100 hidden" style="width: 60px; min-width: 60px;">세그먼트</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">시작위치</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">깊이</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">반복횟수</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">순서</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">필수여부</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 80px; min-width: 80px;">기본값</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 80px; min-width: 80px;">포맷/패턴</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 60px; min-width: 60px;">Dynamic여부</th>
                        <th class="border-b border-r border-gray-300 px-2 py-1 text-center font-semibold bg-gray-100" style="width: 120px; min-width: 120px;">Dynamic종류</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    {#each fieldList as field, i}
                        <tr class="hover:bg-blue-50 transition-colors border-b border-gray-200">
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                <input type="checkbox" bind:checked={field.isChecked}/>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                {i + 1}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center font-semibold {field.status === 'D' ? 'text-red-500' : field.status === 'N' ? 'text-green-600' : 'text-gray-600'} hidden">
                                {field.status}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {field.APP_ID}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {field.APPNM}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {field.MSG_ID}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left hidden">
                                {messages.find((m) => m.MSG_ID == field.MSG_ID) ?.MSG_KR_NM || ""}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden">
                                {field.MSGFLD_ID}
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left" 
                                contenteditable="true" 
                                bind:textContent={field.FLD_EN_NM} 
                                on:input={() => handleFieldChange(field)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left" 
                                contenteditable="true" 
                                bind:textContent={field.FLD_KR_NM} 
                                on:input={() => handleFieldChange(field)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <select bind:value={field.FLD_TYPE} on:change={() => handleFieldChange(field)} class="w-full h-full border-none focus:ring-0 bg-transparent text-center">
                                    <option value="" disabled>필드타입 선택</option>
                                    <option value="STRING">STRING</option>
                                    <option value="NUMBER">NUMBER</option>
                                    <option value="DECIMAL">DECIMAL</option>
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-right"
                                contenteditable="true"
                                bind:textContent={field.FLD_LEN}
                                on:input={(e) => {
                                    field.isChecked = true;
                                    const cleaned =
                                        e.target.textContent.replace(/[^0-9]/g,"");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        field.FLD_LEN = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                    handleFieldChange(field);
                                }}>
                            </td>                            
                            <td class="border-r border-gray-200 px-2 py-1 text-left hidden" 
                                contenteditable="true" 
                                bind:textContent={field.FLD_CMT} 
                                on:input={() => handleFieldChange(field)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center hidden" 
                                contenteditable="true" 
                                bind:textContent={field.FLD_SGMT}
                                on:input={(e) => {
                                    field.isChecked = true;
                                    const cleaned = e.target.textContent.replace(/[^0-9]/g, "");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        field.FLD_SGMT = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                    handleFieldChange(field);
                                }}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-right"
                                contenteditable="true"
                                bind:textContent={field.ST_POS}
                                on:input={(e) => {
                                    field.isChecked = true;
                                    const cleaned =
                                        e.target.textContent.replace(/[^0-9]/g,"");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        field.ST_POS = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                    handleFieldChange(field);
                                }}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-right"
                                contenteditable="true"
                                bind:textContent={field.FLD_DEPTH}
                                on:input={(e) => {
                                    field.isChecked = true;
                                    const cleaned =
                                        e.target.textContent.replace(/[^0-9]/g,"");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        field.FLD_DEPTH = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                    handleFieldChange(field);
                                }}>
                            </td>                            
                            <td class="border-r border-gray-200 px-2 py-1 text-right"
                                contenteditable="true"
                                bind:textContent={field.REPET_NUM}
                                on:input={(e) => {
                                    field.isChecked = true;

                                    const cleaned = e.target.textContent.replace(/[^0-9]/g,"");

                                    if (e.target.textContent !== cleaned) {
                                        e.target.textContent = cleaned;
                                        field.REPET_NUM = cleaned;

                                        const range = document.createRange();
                                        const sel = window.getSelection();

                                        range.selectNodeContents(e.target);
                                        range.collapse(false);

                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                    handleFieldChange(field);
                                }}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center">
                                <input type="number"
                                        class="w-full bg-transparent text-right focus:outline-none"
                                        value={field.FLD_ORDER}
                                        on:input={(e) => {
                                            field.FLD_ORDER = e.currentTarget.value;
                                            handleFieldChange(field);
                                        }}
                                />
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <select bind:value={field.ESSEN_YN}
                                        on:change={() => handleFieldChange(field)}
                                        class="w-full h-full border-none focus:ring-0 bg-transparent text-center">
                                    <option value="" disabled>필수여부 선택</option>
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </select>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center"
                                contenteditable="true"
                                bind:textContent={field.DEFAULT_VAL}
                                on:input={() => handleFieldChange(field)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center"
                                contenteditable="true"
                                bind:textContent={field.FLD_FORMAT}
                                on:input={() => handleFieldChange(field)}>
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-center p-0">
                                <input 
                                    type="checkbox" 
                                    bind:checked={field.DY_YN} 
                                    on:change={() => {
                                        if (!field.DY_YN) field.DY_KIND = ""; // 체크 해제 시 초기화
                                        handleFieldChange(field);
                                    }}
                                    class="w-4 h-4 cursor-pointer"
                                />
                            </td>
                            <td class="border-r border-gray-200 px-2 py-1 text-left p-0">
                                <select 
                                    bind:value={field.DY_KIND} 
                                    on:change={() => handleFieldChange(field)} 
                                    disabled={!field.DY_YN}
                                    class="w-full h-full border-none focus:ring-0 bg-transparent text-left 
                                        disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                                >
                                    <option value="" disabled={field.DY_YN}>종류 선택</option>
                                    <option value="1">1.날짜(YYYY-MM-DD)</option>
                                    <option value="2">2.시간(HH:MM:SS)</option>
                                    <option value="3">3.날짜+시간(YYYY-MM-DD HH:MM:SS)</option>
                                    <option value="4">4.일련번호(자동생성)</option>
                                    <option value="5">5.UUID(32자리)</option>
                                </select>
                            </td>
                        </tr>
                    {/each}
                    {#if fieldList.length === 0}
                        <tr>
                            <td class="px-2 py-4 text-center text-gray-500" colspan="22">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
    <input type="file" accept=".xlsx, .xls" class="hidden" bind:this={messageListFileInput} on:change={handleMessageListFileChange}/>
    <input type="file" accept=".xlsx, .xls" class="hidden" bind:this={fieldListFileInput} on:change={handleFieldListFileChange}/>
</div>
