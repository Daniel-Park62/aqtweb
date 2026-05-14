<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";
    //////////////////////////////////////////////////////////////////////////////////////////////
    //화면 로드 구분
    let loadFlag = false;

    // 프로젝트 목록 데이터
    let projects = [];
    // 프로젝트 선택 데이터
    let projectSelectElement;
    // 검색 필터 (프로젝트 선택)
    let selectedProject = "";

    // 업무 목록 데이터
    let jobs = [];
    // 업무 선택 데이터
    let jobSelectElement;
    // 검색 필터 (업무 선택)
    let selectedJob = "";

    // 상단 선택된 시나리오
    let selectedTestCase = "";
    // 상단 검색어
    let searchTestCaseKeyword = "";
    // 상단 그리드
    let messages = [];

    // 하단 좌측 검색어
    let searchTCaseKeyword = "";
    // 하단 좌측 그리드
    let dataList = [];

    // 하단 우측 검색어
    let searchSiTCaseKeyword = "";
    // 하단 우측 그리드
    let fieldList = [];

    // 상단 전체선택
    let isAllTestCaseChecked = false;
    // 하단 좌측 전체선택
    let isAllDataChecked = false;
    // 하단 우측 전체선택
    let isAllFieldsChecked = false;

    // 엑셀 관련 변수
    let fileInput;

    // 소스 맨아래 파일업로드 관련 변수
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

    // 하단 좌측 업무 목록 조회
    async function searchJobs() {
        selectedJob = "";

        // 업무 목록 데이터
        jobs = [];

        // 상단 선택된 시나리오
        selectedTestCase = "";
        // 상단 검색어
        searchTestCaseKeyword = "";
        // 상단 그리드
        messages = [];

        // 하단 좌측 검색어
        searchTCaseKeyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchSiTCaseKeyword = "";
        // 하단 우측 그리드
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
    // 상단 시나리오 목록 조회
    async function searchMessages() {
        // 하단 좌측 검색어
        searchTCaseKeyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchSiTCaseKeyword = "";
        // 하단 우측 그리드
        fieldList = [];

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";

        if (searchTestCaseKeyword) {
            queryParams += `&search_keyword=${searchTestCaseKeyword}`;
        }

        try {
            const res = await fetch(
                $rooturl + "/testSinalio/message/list" + queryParams,
            );

            messages = await res.json();
        } catch (error) {
            console.error("시나리오 목록 조회 실패:", error);
        }
    }

    // 상단 시나리오 선택
    async function jobSelect(msg) {
        selectedTestCase = msg;

        // 상단 검색조건
        searchTestCaseKeyword = "";

        // 하단 좌측 검색어
        searchTCaseKeyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchSiTCaseKeyword = "";
        // 하단 우측 그리드
        fieldList = [];

        await searchFieldsData(msg);
    }
    /////////////////////////////////////////////
    // 상단 시나리오 추가
    function handleMessageAdd() {
        if (!Array.isArray(messages)) {
            messages = [];
        }

        const newMessages = {
            SIO_ID: "",
            SIO_NM: "",
            SIO_OWNER: "",
            SIO_ACTOR: "",
            SIO_REQID: "",
            SIO_ESTTM: "",
            SIO_EXEPHASE: "",
            SIO_LASTRDT: "",
            SIO_DESC: "",
            isChecked: true,
            status: "N", // New
        };

        messages = [...messages, newMessages];
    }

    // 상단 시나리오 삭제
    async function handleMessageDelete() {
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("삭제할 시나리오를 선택해주세요.");
            return;
        }

        if (!confirm("선택한 시나리오를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testSinalio/message/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count} 건의 시나리오가 삭제되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("시나리오 삭제 실패:", error);
            alert("시나리오 삭제 중 오류가 발생했습니다.");
        }
    }

    // 상단 시나리오 저장
    async function handleMessageSave() {
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("저장할 시나리오를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        messages.forEach((m, index) => {
            if (m.isChecked) {
                if (!m.SIO_ID) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 시나리오ID는 필수 입력입니다.\n시나리오ID를 입력하세요.`,
            );

            return;
        }

        // Add confirmation dialog
        if (!confirm("선택한 시나리오를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testSinalio/message/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count} 건의 시나리오가 저장되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("시나리오 저장 실패:", error);
            alert("시나리오 저장 중 오류가 발생했습니다.");
        }
    }

    // 상단 시나리오 엑셀 업로드
    function handleExcelUpload() {
        messageListFileInput.click();
    }

    // 상단 시나리오 엑셀 업로드
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
                SIO_ID: "",
                SIO_NM: row["시나리오명"] || "",
                SIO_OWNER: row["관리자"] || "",
                SIO_ACTOR: row["수행주체"] || "",
                SIO_REQID: row["요구사항"] || "",
                SIO_ESTTM: row["예상시간"] || "",
                SIO_EXEPHASE: row["수행단계(차수)"] || "",
                SIO_LASTRDT: row["실행일자"] || "",
                SIO_DESC: row["설명"] || "",
                isChecked: true,
                status: "N", // New
            }));

            messages = [...messages, ...newMessages];

            alert(`${newMessages.length}건의 시나리오가 업로드되었습니다.`);

            messageListFileInput.value = ""; // Reset input
        };

        reader.readAsArrayBuffer(file);
    }

    // 상단 시나리오 엑셀 다운로드
    function handleExcelDownload() {
        const ws = utils.json_to_sheet(
            messages.map((msg) => ({
                시나리오ID: msg.SIO_ID,
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
        utils.book_append_sheet(wb, ws, "시나리오");

        writeFile(wb, "시나리오.xlsx");
    }

    // 상단 시나리오 전문 변경 (상태 업데이트)
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }

    // 상단 반응형 전체 선택/해제
    $: filteredTestCaseList = messages;

    // 상단 반응형 필드 전체 선택/해제
    $: if (filteredTestCaseList.length > 0) {
        isAllTestCaseChecked = filteredTestCaseList.every((f) => f.isChecked);
    } else {
        isAllTestCaseChecked = false;
    }

    // 싱단 시나리오 전체 선택/해제
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 데이터 조회
    async function searchData(msg) {
        dataList = [];

        if (!msg.SIO_ID || msg.SIO_ID === "") {
            // 하단 좌측 검색어
            searchTCaseKeyword = "";
            dataList = [];
            return;
        }

        let queryParams = msg.SIO_ID ? `?sio_id=${msg.SIO_ID}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        if (searchTCaseKeyword) {
            queryParams += `&search_keyword=${searchTCaseKeyword}`;
        }

        try {
            const res = await fetch(
                `${$rooturl}/testSinalio/testcase/list` + queryParams,
            );

            const data = await res.json();
            dataList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("테스트케이스 목록 로딩 실패:", error);
        }
    }

    // 하단 좌측 데이터 검색어 입력 후 조회
    function handleDataSearchTrigger() {
        if (selectedTestCase) {
            searchData(selectedTestCase);
        } else {
            alert("상단 시나리오를 선택해주세요.");
        }
    }

    // 하단 좌측 데이터 검색 반응형 업데이트
    $: filteredDataList = dataList;

    // 하단 좌측 반응형 필드 전체 선택/해제
    $: if (filteredDataList.length > 0) {
        isAllDataChecked = filteredDataList.every((f) => f.isChecked);
    } else {
        isAllDataChecked = false;
    }

    // 하단 좌측 필드 전체 선택/해제
    function toggleAllData(e) {
        const checked = e.target.checked;
        isAllDataChecked = checked;
        dataList = dataList.map((f) => ({ ...f, isChecked: checked }));
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 중간(▶) 시나리오 테스트케이스 저장
    async function handleMsgDatasSave() {
        const checkedDataList = dataList.filter((m) => m.isChecked);

        if (checkedDataList.length === 0) {
            alert("저장할 테스트케이스를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        dataList.forEach((m, index) => {
            if (m.isChecked) {
                if (!m.TC_ID || !m.SIO_ID) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 테스트케이스 또는 시나리오가 없습니다.\n테스트케이스 및 시나리오를 확인해주세요.`,
            );
            return;
        }

        if (!confirm("선택한 테스트케이스를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testSinalio/msgDatas/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedDataList),
            });

            const result = await res.json();

            alert(`${result.count} 건의 테스트케이스가 저장되었습니다.`);

            await jobSelect(selectedTestCase);
        } catch (error) {
            console.error("테스트케이스 저장 실패:", error);
            alert("테스트케이스 저장 중 오류가 발생했습니다.");
        }
    }

    // 하단 중간(◀) 시나리오 테스트케이스 삭제
    async function handleMsgDatasDelete() {
        const checkedFieldList = fieldList.filter((m) => m.isChecked);

        if (checkedFieldList.length === 0) {
            alert("삭제할 시나리오 테스트케이스를 선택해주세요.");
            return;
        }

        if (!confirm("선택한 시나리오 테스트케이스를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testSinalio/msgDatas/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedFieldList),
            });

            const result = await res.json();

            alert(
                `${result.count} 건의 시나리오 테스트케이스가 삭제되었습니다.`,
            );

            await jobSelect(selectedTestCase);
        } catch (error) {
            console.error("시나리오 테스트케이스 삭제 실패:", error);
            alert("시나리오 테스트케이스 삭제 중 오류가 발생했습니다.");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 우측 시나리오 테스트케이스 데이터 조회
    async function searchFieldsData(msg) {
        fieldList = [];

        if (!msg.SIO_ID || msg.SIO_ID === "") {
            fieldList = [];
            return;
        }

        try {
            let queryParams = msg.SIO_ID ? `?sio_id=${msg.SIO_ID}` : "";

            if (searchSiTCaseKeyword) {
                queryParams += `&search_keyword=${searchSiTCaseKeyword}`;
            }

            const res = await fetch(
                `${$rooturl}/testSinalio/data/list` + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        }
    }

    // 하단 우측  시나리오 테스트케이스 검색어 입력 후 조회
    function handleFieldSearchTrigger() {
        if (selectedTestCase) {
            searchFieldsData(selectedTestCase);
        } else {
            alert("상단 테스트케이스를 선택해주세요.");
        }
    }

    // 하단 우측 필드 검색 반응형 업데이트
    $: filteredFieldList = fieldList;

    // 하단 우측 반응형 필드 전체 선택/해제
    $: if (filteredFieldList.length > 0) {
        isAllFieldsChecked = filteredFieldList.every((f) => f.isChecked);
    } else {
        isAllFieldsChecked = false;
    }

    // 하단 우측 필드 전체 선택/해제
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }

    // 하단 우측 수행순서 저장
    async function handleSiTCaseSave() {
        const checkedSiTCaseList = fieldList.filter((m) => m.isChecked);

        if (checkedSiTCaseList.length === 0) {
            alert("수행순서를 저장할 시나리오 테스트케이스를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        fieldList.forEach((m, index) => {
            if (m.isChecked) {
                if (!m.SIO_ID || !m.SITC_ID) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 프로젝트명 또는 업무명이 없습니다.\n프로젝트ID, 업무ID를 확인해주세요.`,
            );

            return;
        }

        if (!confirm("선택한 시나리오 테스트케이스를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testSinalio/sitcaseord/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedSiTCaseList),
            });

            const result = await res.json();

            alert(
                `${result.count} 건의 시나리오 테스트케이스 수행순서가 저장되었습니다.`,
            );

            await searchFieldsData(selectedTestCase);
        } catch (error) {
            console.error("시나리오 테스트케이스 저장 실패:", error);
            alert("시나리오 테스트케이스 저장 중 오류가 발생했습니다.");
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 데이터 상태 업데이트 (추가 신규등록, 수정이 없기 때문에 사용하지 않음.)
    function handleDataChange(row) {
        row.isChecked = true;

        if (row.status !== "N" && row.status !== "D") {
            row.status = "U";
        }

        dataList = dataList;
    }
    // 하단 좌측 파일업로드 (하단 좌측 엑셀업로드 없기 때문에 사용하지 않음.)
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
                PRJ_ID: selectedTestCase.PRJ_ID,
                APP_ID: selectedTestCase.APP_ID,
                MSG_ID: selectedTestCase.MSG_ID,
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
    // 하단 우측 데이터 상태 업데이트 (추가 신규등록, 수정이 없기 때문에 사용하지 않음.)
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList;
    }
    // 하단 우측 파일업로드 (하단 우측 엑셀업로드 없기 때문에 사용하지 않음.)
    function handleFileChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                alert("엑셀 파일에 데이터가 없습니다.");
                fileInput.value = "";

                return;
            }

            // 3. Map Excel rows to Data Objects
            const newRows = jsonData.map((row) => {
                const prjId = row["프로젝트 ID"] || selectedProject;
                const appId = row["업무 ID"] || selectedJob;
                const msgId = row["전문 ID"] || selectedTestCaseId;

                const project = projects.find((p) => p.PRJ_ID === prjId);
                const job = jobs.find((j) => j.APP_ID === appId);
                const message =
                    messages.find((m) => m.MSG_ID === msgId) ||
                    (filteredMessages
                        ? filteredMessages.find((m) => m.MSG_ID === msgId)
                        : null);

                return {
                    PRJ_ID: prjId,
                    PRJ_NM: project ? project.PRJ_NM : row["프로젝트명"] || "",
                    APP_ID: appId,
                    APP_NM: job ? job.APPNM : row["업무명"] || "",
                    MSG_ID: msgId,
                    MSG_KR_NM: message
                        ? message.MSG_KR_NM
                        : row["전문명"] || "",
                    MSGDT_ID: "", // If empty, backend will generate
                    FIXEDLEN_VAL: row["전문데이터"] || row["content"] || "",
                    COMMENT: row["설명"] || row["comment"] || "",
                    isChecked: true,
                    status: "N", // Treat imported as New
                };
            });

            dataList = [...dataList, ...newRows];

            alert(`${newRows.length}건이 테이블에 추가되었습니다.`);

            fileInput.value = "";
        };

        reader.readAsArrayBuffer(file);
    }
    //////////////////////////////////////////////////////////////////////////////////////////
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div
        class="flex-none flex flex-col h-[calc(33vh-20px)] bg-white border border-gray-300 rounded shadow overflow-hidden"
    >
        <div
            class="bg-white p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">시나리오 등록</h2>
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
                <div class="flex gap-1 ml-2">
                    <input
                        type="text"
                        bind:value={searchTestCaseKeyword}
                        placeholder="검색어 입력"
                        class="border border-gray-300 rounded-sm px-2 py-1 font-normal text-sm focus:outline-none focus:border-blue-500"
                        style="width: 250px; min-width: 150px;"
                    />
                    <button on:click={searchMessages}> 조회 </button>
                    <button on:click={handleMessageAdd}> 추가 </button>
                    <button class="btn-delete" on:click={handleMessageDelete}>
                        삭제
                    </button>
                    <button on:click={handleMessageSave}> 저장 </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button class="btn-excel" on:click={handleExcelUpload}>
                        엑셀 업로드
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
                        <th class="text-center font-semibold bg-gray-100 w-8">
                            <input
                                type="checkbox"
                                bind:checked={isAllTestCaseChecked}
                                on:click={toggleAllMessages}
                            />
                        </th>
                        <th class="text-center w-10 hidden">No</th>
                        <th class="text-center hidden">상태</th>
                        <th
                            class="text-center"
                            style="width: 80px; min-width: 80px;">시나리오ID</th
                        >
                        <th
                            class="text-center"
                            style="width: 160px; min-width: 160px;"
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
                            class="hover:bg-blue-50 transition-colors border-b border-gray-200 cursor-pointer {selectedTestCase ===
                            msg
                                ? 'bg-blue-100'
                                : ''}"
                            on:click={() => jobSelect(msg)}
                        >
                            <td class="text-center">
                                <input
                                    type="checkbox"
                                    bind:checked={msg.isChecked}
                                    on:click|stopPropagation
                                />
                            </td>
                            <td class="text-center hidden">
                                {i + 1}
                            </td>
                            <td
                                class="text-center font-semibold {msg.status ===
                                'D'
                                    ? 'text-red-500'
                                    : msg.status === 'N'
                                      ? 'text-green-600'
                                      : 'text-gray-600'} hidden"
                            >
                                {msg.status}
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_ID}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left"
                                contenteditable="true"
                                bind:textContent={msg.SIO_NM}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_OWNER}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_ACTOR}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_REQID}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_ESTTM}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_EXEPHASE}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.SIO_LASTRDT}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left"
                                contenteditable="true"
                                bind:textContent={msg.SIO_DESC}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
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
    <div class="flex-none flex flex-row gap-0 h-[calc(54vh-20px)]">
        <div class="w-6/12 flex flex-row">
            <div class="w-11/12 flex flex-col">
                <div
                    class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                    >
                        <div class="flex items-center gap-2">
                            <h3 class="text-xl font-bold text-gray-700">
                                테스트케이스
                            </h3>
                        </div>
                        <div class="flex gap-2 ml-10">
                            <select
                                bind:value={selectedJob}
                                bind:this={jobSelectElement}
                                class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]"
                            >
                                <option value="">업무 선택</option>
                                {#each jobs as job}
                                    <option value={job.APP_ID}
                                        >{job.APPNM}</option
                                    >
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={searchTCaseKeyword}
                                placeholder="검색어 입력"
                                class="border border-gray-300 rounded-sm px-2 py-1 font-normal text-sm focus:outline-none focus:border-blue-500"
                                style="width: 180px; min-width: 180px;"
                            />
                            <button on:click={handleDataSearchTrigger}>
                                조회
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
                                            bind:checked={isAllDataChecked}
                                            on:click={toggleAllData}
                                        />
                                    </th>
                                    <th
                                        class="text-center w-10"
                                        style="width: 10px; min-width: 10px;"
                                        >No</th
                                    >
                                    <th class="text-center w-10 hidden">상태</th
                                    >
                                    <th class="text-center hidden"
                                        >프로젝트ID</th
                                    >
                                    <th class="text-center hidden">업무ID</th>
                                    <th class="text-center hidden">업무명</th>
                                    <th class="text-center hidden"
                                        >테스트케이스ID</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 200px; min-width: 200px;"
                                        >테스트케이스명</th
                                    >
                                    <th class="text-center hidden"
                                        >시나리오ID</th
                                    >
                                    <th class="text-center hidden"
                                        >시나리오테스트케이스ID</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >테스트구분</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >작성자</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 160px; min-width: 160px;"
                                        >작성일자</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >업무담당자</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >IT담당자</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >대상서버</th
                                    >
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >대상Port</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                {#each dataList as row, i}
                                    <tr>
                                        <td class="text-center">
                                            <input
                                                type="checkbox"
                                                bind:checked={row.isChecked}
                                            />
                                        </td>
                                        <td class="text-center">
                                            {i + 1}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.status}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.PRJ_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.APP_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.APPNM}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.TC_PKEY}
                                        </td>
                                        <td class="text-left">
                                            {row.TC_NAME}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.SIO_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.SITC_ID}
                                        </td>
                                        <td class="text-center">
                                            {#if row.TC_GUBUN === "0"}
                                                단위테스트
                                            {:else if row.TC_GUBUN === "1"}
                                                통합테스트
                                            {:else if row.TC_GUBUN === "2"}
                                                성능테스트
                                            {:else}
                                                기타
                                            {/if}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_WRITER}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_WRTDT}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_BUSMGR}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_ITMGR}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_SERVER}
                                        </td>
                                        <td class="text-center">
                                            {row.TC_PORT}
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
            <div
                class="w-1/12 flex flex-col justify-center items-center text-gray-900 gap-1"
            >
                <button
                    on:click={handleMsgDatasSave}
                    class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-3 py-1 text-xs rounded border border-blue-300 hover:border-blue-400 transition"
                >
                    ▶
                </button>
                <button
                    on:click={handleMsgDatasDelete}
                    class="bg-white hover:bg-red-50 text-red-600 font-semibold hover:text-red-700 px-3 py-1 text-xs rounded border border-red-300 hover:border-red-400 transition"
                >
                    ◀
                </button>
            </div>
        </div>
        <div class="w-6/12 flex flex-col">
            <div
                class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
            >
                <div
                    class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                >
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-bold text-gray-700">
                            시나리오 테스트케이스
                        </h3>
                    </div>
                    <div class="flex gap-1">
                        <input
                            type="text"
                            bind:value={searchSiTCaseKeyword}
                            placeholder="검색어 입력"
                            class="border border-gray-300 rounded-sm px-2 py-1 font-normal text-sm focus:outline-none focus:border-blue-500"
                            style="width: 250px; min-width: 150px;"
                        />
                        <button on:click={handleFieldSearchTrigger}>
                            조회
                        </button>
                        <button on:click={handleSiTCaseSave}> 저장 </button>
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
                                    class="text-center w-10 hidden"
                                    style="width: 10px; min-width: 10px;">No</th
                                >
                                <th class="text-center w-10 hidden">상태</th>
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
                                <th class="text-center">작성자</th>
                                <th
                                    class="text-center"
                                    style="width: 160px; min-width: 160px;"
                                    >작성일자</th
                                >
                                <th class="text-center">업무담당자</th>
                                <th class="text-center">IT담당자</th>
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
                            {#each fieldList as field, i}
                                <tr>
                                    <td class="text-center">
                                        <input
                                            type="checkbox"
                                            bind:checked={field.isChecked}
                                        />
                                    </td>
                                    <td class="text-center hidden">
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
                                    <td class="text-center">
                                        {field.TC_ID}
                                    </td>
                                    <td class="text-left">
                                        {field.TC_NAME}
                                    </td>
                                    <td class="text-center">
                                        <input
                                            type="number"
                                            bind:value={field.SITC_ORD}
                                            on:input={() =>
                                                (field.isChecked = true)}
                                            placeholder="순서입력"
                                            class="border border-gray-300 rounded-sm px-2 py-0 focus:outline-none focus:border-blue-500 font-normal text-sm text-right"
                                            style="width: 80px; min-width: 80px;"
                                        />
                                    </td>
                                    <td class="text-center">
                                        {#if field.TC_GUBUN === "0"}
                                            단위테스트
                                        {:else if field.TC_GUBUN === "1"}
                                            통합테스트
                                        {:else if field.TC_GUBUN === "2"}
                                            성능테스트
                                        {/if}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_WRITER}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_WRTDT}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_BUSMGR}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_ITMGR}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_SERVER}
                                    </td>
                                    <td class="text-center">
                                        {field.TC_PORT}
                                    </td>
                                    <td class="text-center">
                                        {field.SITC_STDT}
                                    </td>
                                    <td class="text-center">
                                        {field.SITC_EDDT}
                                    </td>
                                    <td class="text-center">
                                        {field.SITC_DURTM}
                                    </td>
                                    <td class="text-center">
                                        {#if field.SITC_RESULT === "1"}
                                            정상
                                        {:else if field.SITC_RESULT === "2"}
                                            실패
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
    <input
        type="file"
        accept=".xlsx, .xls"
        class="hidden"
        bind:this={fileInput}
        on:change={handleFileChange}
    />
</div>
