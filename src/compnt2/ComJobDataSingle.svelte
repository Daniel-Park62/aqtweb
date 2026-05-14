<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import { read, utils, writeFile } from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";

    let loadFlag = false; //화면 로드 구분
    // 프로젝트 목록
    let projects = [];
    let projectSelectElement;
    let selectedProject = ""; // 검색필터 (프로젝트선택)
    // 업무 목록
    let jobs = [];
    let jobSelectElement;
    let selectedJob = ""; // 검색필터 (업무선택)
    // 상단 좌측 전문목록
    let messages = [];
    let selectedMessage = null;
    // 상단 우측 데이터 목록
    let dataList = [];
    // 하단 좌측 공통필드데이터 목록
    let commList = [];
    // 하단 우측 업무필드데이터 목록
    let fieldList = [];
    // 필드 검색 조건
    let searchMessKeyword = "";
    let searchDataKeyword = "";
    let searchCommKeyword = "";
    let searchFieldKeyword = "";

    let commDataTitle = "송신항목별 데이터";
    let messDataTitle = "전문(공통+업무)필드별 데이터";

    let isAllFieldsChecked = false;
    let isAllCommsChecked = false;
    // 현재 사용하지 않는
    let messageListFileInput;
    let fieldListFileInput;

    let svcUris = []; // SVC/URI 목록

    // 컴포넌트 마운트 시 초기 데이터 로드
    onMount(async () => {
        await searchProjects();
        await searchJobs();
        await searchSvcUri();

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
        commList = [];
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

    // 상단 송신항목별데이터, 공통+업무전문데이터 저장
    async function handleFieldDataSave() {
        if (!selectedMessage) return;

        isAllFieldsChecked = true;
        isAllCommsChecked = true;

        // 체크와 상관없이 모든 필드 저장하는 경우(fixed 길이로 합쳐서 저장하기 때문에 모든 필드 저장해야 함.)
        const checkedComms = commList.filter(
            (f) => (f.isChecked = isAllCommsChecked),
        );
        const checkedFields = fieldList.filter(
            (f) => (f.isChecked = isAllFieldsChecked),
        );

        const errorRows = [];
        let FIXEDLENVAL = "";
        let SVCURI = "";
        let PROTOCOLGB_VAL = "";
        let METHOD_VAL = "";
        let HEADERVAL_VAL = "";
        let PARAMVAL_VAL = "";
        let srcip_val = "";
        let srcport_val = 0;
        let odstip_val = "";
        let odstport_val = 0;
        let dstip_val = "";
        let dstport_val = 0;
        let origin_val = "";
        let svccnt = 0;

        commList.forEach((f, index) => {
            if (svccnt == 0) {
                SVCURI = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 1) {
                PROTOCOLGB_VAL = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 2) {
                METHOD_VAL = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 3) {
                HEADERVAL_VAL = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 4) {
                PARAMVAL_VAL = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 5) {
                srcip_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 6) {
                srcport_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 7) {
                odstip_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 8) {
                odstport_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 9) {
                dstip_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 10) {
                dstport_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else if (svccnt == 11) {
                origin_val = f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else {
                alert("송신항목 인덱스 범위를 벗어났습니다!!!!!");
            }

            svccnt++;
        });

        fieldList.forEach((f, index) => {
            if (f.isChecked) {
                const hasJob = jobs.some((j) => j.APP_ID === f.APP_ID);
                const hasMessage = messages.some((m) => m.MSG_ID === f.MSG_ID);

                //if (!f.APP_ID || !f.MSG_ID || !hasJob || !hasMessage || !f.FIXED_VAL) {
                if (!f.APP_ID || !f.MSG_ID || !hasJob || !hasMessage) {
                    errorRows.push(index + 1); // 1-based index
                }
            }

            if (f.FLD_TYPE === "STRING") {
                FIXEDLENVAL = FIXEDLENVAL + f.FIXED_VAL.padEnd(f.FLD_LEN, " ");
            } else {
                FIXEDLENVAL =
                    FIXEDLENVAL +
                    f.FIXED_VAL.toString().padStart(f.FLD_LEN, "0");
            }
        });

        fieldList.forEach((g, ind) => {
            g.FIXEDLENVAL = FIXEDLENVAL;
            g.SVC_URI = SVCURI;
            g.PROTOCOL_GB = PROTOCOLGB_VAL;
            g.METHOD = METHOD_VAL;
            g.HEADER_VAL = HEADERVAL_VAL;
            g.PARAM_VAL = PARAMVAL_VAL;
            g.srcip = srcip_val;
            g.srcport = srcport_val;
            g.o_dstip = odstip_val;
            g.o_dstport = odstport_val;
            g.dstip = dstip_val;
            g.dstport = dstport_val;
            g.origin = origin_val;
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
            alert("단건 데이터 저장 중 오류가 발생했습니다.");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 좌측 전문 목록 조회
    async function searchMessages() {
        selectedMessage = null;

        commDataTitle = "송신항목별 데이터";
        messDataTitle = "전문(공통+업무)필드별 데이터";

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        if (!selectedJob || selectedJob === "") {
            messages = [];
            commList = [];
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
            commList = [];
            fieldList = [];
            dataList = [];
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 상단 좌측 전문 선택
    async function jobSelect(msg) {
        selectedMessage = msg;
        searchMessKeyword = "";
        searchDataKeyword = "";
        searchCommKeyword = "";
        searchFieldKeyword = "";

        commDataTitle = "송신항목별 데이터(신규)";
        messDataTitle = "전문(공통+업무)필드별 데이터(신규)";

        svcUris = []; // SVC/URI 목록

        // 서비스/URI 목록 조회
        await searchSvcUri();
        // 상단 우측 데이터 조회
        await searchData(msg);
        // 하단 좌측 공통데이터 공백 조회 함수
        await searchComm(msg);
        // 하단 우측 업무데이터 공백 조회 함수
        await searchFields(msg);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 좌측 전문 필드 검색
    function handleMessSearchTrigger() {
        if (selectedJob) {
            searchMess(selectedJob);
        } else {
            alert("업무를 선택해주세요.");
        }
    }

    // 상단 좌측 전문 조회
    async function searchMess(msg) {
        messages = [];

        if (!selectedJob || selectedJob === "") {
            messages = [];
            return;
        }

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        if (searchMessKeyword) {
            queryParams += `&search_keyword=${searchMessKeyword}`;
        }

        if (!selectedJob || selectedJob === "") {
            searchMessKeyword = "";
            searchDataKeyword = "";
            searchCommKeyword = "";
            searchFieldKeyword = "";

            messages = [];
            dataList = [];
            commList = [];
            fieldList = [];

            return;
        }

        try {
            const res = await fetch(
                `${$rooturl}/jobs/message/list` + queryParams,
            );
            const data = await res.json();
            messages = Array.isArray(data) ? data : [];

            dataList = [];
            commList = [];
            fieldList = [];

            searchDataKeyword = "";
            searchCommKeyword = "";
            searchFieldKeyword = "";
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            messages = [];
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 우측 데이터 검색
    function handleDataSearchTrigger() {
        if (selectedMessage) {
            searchData(selectedMessage);
        } else {
            alert("전문을 선택해주세요.");
        }
    }

    // 상단 우측 데이터 조회
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

    // 상단 우측 데이터 선택 (필드 목록 + 입력자료 조회)
    async function jobDataSelect(row) {
        searchFieldKeyword = "";
        commList = [];
        fieldList = [];
        selectedMessage = row;

        commDataTitle = "송신항목별 데이터(수정)";
        messDataTitle = "전문(공통+업무)필드별 데이터(수정)";
        svcUris = []; // SVC/URI 목록

        // 서비스/URI 목록 조회
        await searchSvcUri();
        await searchCommData(row);
        await searchFieldsData(row);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측, 우측 필드 변경 (상태 업데이트)
    function handleFieldChange(field) {
        field.isChecked = true;

        if (field.status !== "N" && field.status !== "D") {
            field.status = "U";
        }

        fieldList = fieldList; // Svelte reactivity trigger
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 공통데이터 양식+입력자료 조회
    async function searchCommData(msg) {
        commList = [];

        if (!msg.MSG_ID) return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";
            queryParams += msg.MSGDT_ID ? `&msgdt_id=${msg.MSGDT_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/listcomm" + queryParams,
            );

            const data = await res.json();
            commList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("공통 필드 데이터 조회 실패:", error);
            commList = [];
        }
    }

    // 하단 좌측 공통데이터 양식만 조회
    async function searchComm(msg) {
        commList = [];

        if (!msg.MSG_ID) return;

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.MSG_ID ? `&msg_id=${msg.MSG_ID}` : "";

            if (searchFieldKeyword) {
                queryParams += `&search_keyword=${searchFieldKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/listcommfield" + queryParams,
            );

            const data = await res.json();
            commList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("공통 필드 목록 조회 실패:", error);
            commList = [];
        }
    }

    // 하단 좌측 공통데이터 조회
    function handleCommSearchTrigger() {
        if (selectedMessage) {
            if (!selectedMessage.MSGDT_ID || selectedMessage.MSGDT_ID === "") {
                searchComm(selectedMessage);
            } else {
                searchCommData(selectedMessage);
            }
        } else {
            alert("전문을 선택해주세요.");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 우측 필드별 양식+입력자료 조회
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
                $rooturl + "/jobs/field/listMessdata" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 데이터 조회 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측 필드별 양식만 조회
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
                $rooturl + "/jobs/field/listMess" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("필드 목록 로딩 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측 업무데이터 조회
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
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 필드 검색 반응형 업데이트 (Client-side filtering of loaded fields)
    $: filteredFieldList = fieldList;

    // 하단 우측 필드 전체 선택/해제
    $: if (filteredFieldList.length > 0) {
        isAllFieldsChecked = filteredFieldList.every((f) => f.isChecked);
    } else {
        isAllFieldsChecked = false;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 서비스/URI 목록 조회
    async function searchSvcUri() {
        svcUris = []; // SVC/URI 목록

        if (!selectedJob) return;

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/svcurilist" + queryParams,
            );

            svcUris = await res.json();
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 싱단 좌측 전문 전체 선택/해제 토글 핸들러 (미사용)
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }
    // 상단 전문 변경 핸들러 (상단 check box 상태 업데이트) (미사용)
    function handleMessageChange(msg) {
        msg.isChecked = true;

        if (msg.status !== "N" && msg.status !== "D") {
            msg.status = "U";
        }
    }
    // 상단 좌측 전문 파일 선택시 처리 핸들러 (미사용)
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
    // 하단 우측 필드별 데이터 파일 선택시 처리 핸들러 (미사용)
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
    // 하단 우측 필드 전체 선택/해제 토글 핸들러(미사용)
    function toggleAllFields(e) {
        const checked = e.target.checked;
        isAllFieldsChecked = checked;
        fieldList = fieldList.map((f) => ({ ...f, isChecked: checked }));
    }
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div
        class="bg-white p-4 border border-gray-300 flex flex-wrap justify-between items-center gap-2"
    >
        <h2 class="text-xl font-bold text-gray-700">신규등록/수정</h2>
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
                        <option value={project.PRJ_ID}>{project.PRJ_NM}</option>
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
                <button on:click={searchMessages}> 조회 </button>
                <button on:click={handleFieldDataSave}> 저장 </button>
            </div>
        </div>
    </div>
    <div class="flex-1 flex flex-row gap-4 h-[calc(40vh-20px)]">
        <div class="w-1/2 flex flex-col">
            <div
                class="p-4 border border-gray-300 bg-white flex flex-wrap justify-between items-center gap-2"
            >
                <div class="flex items-center gap-2">
                    <h3 class="text-xl font-bold text-gray-700">전문 Layout</h3>
                </div>
                <div class="flex gap-1">
                    <input
                        type="text"
                        bind:value={searchMessKeyword}
                        placeholder="검색어 입력"
                        class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm"
                        style="width: 250px; min-width: 150px;"
                    />
                    <button on:click={handleMessSearchTrigger}> 조회 </button>
                </div>
            </div>
            <div class="flex-1 border border-gray-300 overflow-auto">
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
                            <th
                                class="text-center"
                                style="width: 60px; min-width: 60px;">구분</th
                            >
                            <th class="text-center w-10 hidden">상태</th>
                            <th class="text-center hidden">업무ID</th>
                            <th class="text-center hidden">전문ID</th>
                            <th
                                class="text-center"
                                style="width: 160px; min-width: 160px;"
                                >전문명(한글)</th
                            >
                            <th
                                class="text-center"
                                style="width: 160px; min-width: 160px;"
                                >전문명(영문)</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;"
                                >전문유형</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;">포맷</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;">방향</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;"
                                >전체길이</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;"
                                >공통전문</th
                            >
                            <th
                                class="text-center"
                                style="width: 80px; min-width: 80px;"
                                >연관전문</th
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
                                <td class="text-center">
                                    {i + 1}
                                </td>
                                <td class="text-center">
                                    <button
                                        class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-2 py-0 text-xs rounded border border-blue-300 hover:border-blue-400 transition"
                                    >
                                        신규
                                    </button>
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
                                <td class="text-center p-0">
                                    {#if msg.MSG_TYPE === "Q"}
                                        요청
                                    {:else if msg.MSG_TYPE === "R"}
                                        응답
                                    {:else}
                                        기타
                                    {/if}
                                </td>
                                <td class="text-center p-0">
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
                                <td class="text-center p-0">
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
                                <td class="text-right">
                                    {msg.COMMHD_ID}
                                </td>
                                <td class="text-right">
                                    {msg.REL_MSG_ID}
                                </td>
                            </tr>
                        {/each}
                        {#if messages.length === 0}
                            <tr>
                                <td
                                    class="px-2 py-4 text-center text-gray-500"
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
        <div class="w-1/2 flex flex-col">
            <div
                class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
            >
                <div
                    class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                >
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-bold text-gray-700">
                            전문 데이터
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
                                <th
                                    class="text-center"
                                    style="width: 60px; min-width: 60px;"
                                    >구분</th
                                >
                                <th class="text-center w-10 hidden">상태</th>
                                <th class="text-center hidden">업무ID</th>
                                <th class="text-center hidden">전문ID</th>
                                <th class="text-center hidden">전문데이터ID</th>
                                <th
                                    class="text-center"
                                    style="width: 40px; min-width: 40px;"
                                    >서비스/URI</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 30px; min-width: 30px;"
                                    >프로토콜</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 30px; min-width: 30px;"
                                    >Method</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 300px; min-width: 300px;"
                                    >전문데이터</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 80px; min-width: 80px;"
                                    >Header</th
                                >
                                <th
                                    class="text-left"
                                    style="width: 80px; min-width: 80px;"
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
                                    >소스Port</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본목적지IP</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본목적지Port</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >목적지IP</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >목적지Port</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >원본구분</th
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
                                    <td class="text-center">
                                        <button
                                            class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-2 py-0 text-xs rounded border border-blue-300 hover:border-blue-400 transition"
                                        >
                                            수정
                                        </button>
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
                                    <td class="text-center p-0">
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
                                    <td class="text-center">
                                        {row.HEADER_VAL}
                                    </td>
                                    <td class="text-center">
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
                                </tr>
                            {/each}
                            {#if dataList.length === 0}
                                <tr>
                                    <td
                                        class="px-2 py-4 text-center text-gray-500"
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
                            {commDataTitle}
                        </h3>
                    </div>
                    <div class="flex gap-1"></div>
                </div>
                <div class="flex-1 overflow-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th class="text-center w-8 hidden">
                                    <input
                                        type="checkbox"
                                        bind:checked={isAllCommsChecked}
                                        on:click={toggleAllFields}
                                    />
                                </th>
                                <th
                                    class="text-center"
                                    style="width: 6px; min-width: 6px;">No</th
                                >
                                <th class="text-center w-10 hidden">상태</th>
                                <th class="text-center hidden">업무ID</th>
                                <th class="text-center hidden">전문ID</th>
                                <th class="text-center hidden">전문필드ID</th>
                                <th class="text-center hidden">전문자료ID</th>
                                <th class="text-center hidden">필드명(영문)</th>
                                <th
                                    class="text-center"
                                    style="width: 120px; min-width: 120px;"
                                    >필드명(한글)</th
                                >
                                <th class="text-center hidden">필드설명</th>
                                <th class="text-center hidden">타입</th>
                                <th class="text-center hidden">길이</th>
                                <th class="text-center hidden">필수여부</th>
                                <th class="text-center hidden">포맷/패턴</th>
                                <th
                                    class="text-center"
                                    style="width: 500px; min-width: 500px;"
                                    >입력자료</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            {#each commList as comm, i}
                                <tr
                                    class="hover:bg-blue-50 transition-colors border-b border-gray-200"
                                >
                                    <td class="text-center hidden">
                                        <input
                                            type="checkbox"
                                            bind:checked={comm.isChecked}
                                        />
                                    </td>
                                    <td class="text-center">
                                        {i + 1}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.status}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.APP_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.MSG_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.MSGFLD_ID}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.MSGDT_ID}
                                    </td>
                                    <td class="text-left hidden">
                                        {comm.FLD_EN_NM}
                                    </td>
                                    <td class="text-left">
                                        {comm.FLD_KR_NM}
                                    </td>
                                    <td class="text-left hidden">
                                        {comm.FLD_CMT}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.FLD_TYPE}
                                    </td>
                                    <td class="text-right hidden">
                                        {comm.FLD_LEN}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.ESSEN_YN}
                                    </td>
                                    <td class="text-center hidden">
                                        {comm.FLD_FORMAT}
                                    </td>
                                    {#if comm.FLD_KR_NM === "서비스/URI"}
                                        <td class="text-left">
                                            <select
                                                bind:value={comm.FIXED_VAL}
                                                class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                                            >
                                                <option value="" disabled>
                                                    서비스/URI 선택
                                                </option>
                                                {#each svcUris as svcUri}
                                                    <option
                                                        value={svcUri.SVC_URI}
                                                    >
                                                        {svcUri.SVC_URI}
                                                    </option>
                                                {/each}
                                            </select>
                                        </td>
                                    {:else if comm.FLD_KR_NM === "프로토콜"}
                                        <td class="text-left">
                                            <select
                                                bind:value={comm.FIXED_VAL}
                                                class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                                            >
                                                <option value="" disabled
                                                    >프로토콜 선택</option
                                                >
                                                <option value="0">TCP</option>
                                                <option value="1">HTTP</option>
                                                <option value="2">UDP</option>
                                                <option value="3">TMAX</option>
                                            </select>
                                        </td>
                                    {:else if comm.FLD_KR_NM === "Method"}
                                        <td class="text-left">
                                            <select
                                                bind:value={comm.FIXED_VAL}
                                                class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                                            >
                                                <option value="" disabled
                                                    >Method 선택</option
                                                >
                                                <option value="GET">GET</option>
                                                <option value="POST"
                                                    >POST</option
                                                >
                                                <option value="PUT">PUT</option>
                                                <option value="PATCH"
                                                    >PATCH</option
                                                >
                                                <option value="DELETE"
                                                    >DELETE</option
                                                >
                                                <option value="HEAD"
                                                    >HEAD</option
                                                >
                                            </select>
                                        </td>
                                    {:else if comm.FLD_KR_NM === "원본구분"}
                                        <td class="text-left">
                                            <select
                                                bind:value={comm.FIXED_VAL}
                                                class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                                            >
                                                <option value="" disabled
                                                    >원본구분 선택</option
                                                >
                                                <option value="0"
                                                    >자동생성</option
                                                >
                                                <option value="1">수작업</option
                                                >
                                            </select>
                                        </td>
                                    {:else}
                                        <td
                                            class="text-left"
                                            contenteditable="true"
                                            bind:textContent={comm.FIXED_VAL}
                                            on:input={() => {
                                                handleFieldChange(comm);
                                            }}
                                        >
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                            {#if fieldList.length === 0}
                                <tr>
                                    <td
                                        class="px-2 py-4 text-center text-gray-500"
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
                            {messDataTitle}
                        </h3>
                    </div>
                    <div class="flex gap-1"></div>
                </div>
                <!-- Data Table -->
                <div class="flex-1 overflow-auto">
                    <table
                        class="min-w-full border-collapse text-sm whitespace-nowrap"
                    >
                        <thead
                            class="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm"
                        >
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
                                <th class="text-center w-10 hidden">상태</th>
                                <th class="text-center hidden">업무ID</th>
                                <th class="text-center hidden">전문ID</th>
                                <th class="text-center hidden">전문필드ID</th>
                                <th class="text-center hidden">전문자료ID</th>
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >필드명(영문)</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 80px; min-width: 80px;"
                                    >필드명(한글)</th
                                >
                                <th class="text-center hidden">필드설명</th>
                                <th
                                    class="text-center"
                                    style="width: 60px; min-width: 60px;"
                                    >타입</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 40px; min-width: 40px;"
                                    >길이</th
                                >
                                <th
                                    class="text-center"
                                    style="width: 50px; min-width: 50px;"
                                    >필수여부</th
                                >
                                <th class="text-center hidden">포맷/패턴</th>
                                <th class="text-center hidden">서비스/URI</th>
                                <th class="text-center hidden">프로토콜</th>
                                <th class="text-center hidden">Method</th>
                                <th class="text-center hidden">Header</th>
                                <th class="text-center hidden">파라메터(GET)</th
                                >
                                <th class="text-center hidden">소스IP</th>
                                <th class="text-center hidden">소스Port</th>
                                <th class="text-center hidden">원본목적지IP</th>
                                <th class="text-center hidden"
                                    >원본목적지Port</th
                                >
                                <th class="text-center hidden">목적지IP</th>
                                <th class="text-center hidden">목적지Port</th>
                                <th class="text-center hidden">원본구분</th>
                                <th
                                    class="text-center"
                                    style="width: 200px; min-width: 200px;"
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
                                    <td class="text-center">
                                        {field.FLD_TYPE}
                                    </td>
                                    <td class="text-right">
                                        {field.FLD_LEN}
                                    </td>
                                    <td class="text-center">
                                        {field.ESSEN_YN}
                                    </td>
                                    <td class="text-center hidden">
                                        {field.FLD_FORMAT}
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.SVC_URI}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.PROTOCOL_GB}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.METHOD}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.HEADER_VAL}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.PARAM_VAL}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.FIXEDLENVAL}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.srcip}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.srcport}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.o_dstip}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.o_dstport}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.dstip}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.dstport}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-center hidden"
                                        contenteditable="true"
                                        bind:textContent={field.origin}
                                        on:input={() => {
                                            handleMessageChange(msg);
                                            msg.isChecked = true;
                                        }}
                                    >
                                    </td>
                                    <td
                                        class="text-left"
                                        contenteditable="true"
                                        bind:textContent={field.FIXED_VAL}
                                        on:keydown={(e) => {
                                            // 1. 현재 길이가 길이 이상인지 확인
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
                                            // 붙여넣기 등으로 길이가 넘어갔을 경우를 대비해 자르기
                                            if (
                                                field.FLD_LEN &&
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
                                        class="px-2 py-4 text-center text-gray-500"
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
