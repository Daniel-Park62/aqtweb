<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { read, utils, writeFile } from "xlsx";
    import { rooturl } from "../aqtstore";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";

    // 프로젝트 목록 데이터
    let projects = [];
    let projectSelectElement;

    // 업무 목록 데이터
    let jobs = [];
    let jobSelectElement;
    let messages = []; // 전문 목록
    let svcUris = []; // SVC/URI 목록
    let dataList = []; // 그리드 데이터
    let isLoading = false;

    // 필터 상태
    let selectedProject = "";
    let selectedJob = "";
    let selectedMessageId = "";
    let filteredMessages = [];

    onMount(async () => {
        try {
            await searchProjects();
            await searchJobs();
            await searchMessages();
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        }
    });

    // 프로젝트 목록 조회
    async function searchProjects() {
        try {
            const projectRes = await fetch($rooturl + "/common/project/list");
            projects = await projectRes.json();
        } catch (error) {
            console.error("프로젝트 목록 로딩 실패:", error);
        }
    }

    // 업무 목록 조회
    async function searchJobs() {
        selectedJob = "";
        jobs = [];

        selectedMessageId = "";
        messages = [];
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

    // 전문 목록 조회
    async function searchMessages() {
        selectedMessageId = "";
        messages = [];
        dataList = [];

        if (!selectedJob) return;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        await searchSvcUri();

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/list" + queryParams,
            );

            messages = await res.json();
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 서비스/URI 목록 조회
    async function searchSvcUri() {
        svcUris = []; // SVC/URI 목록

        if (!selectedJob) return;

        let queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";
        queryParams += selectedJob ? `&app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/svcurilist" + queryParams,
            );

            svcUris = await res.json();
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 조회
    async function datsSearch() {
        dataList = [];
        isLoading = true;

        if (!selectedMessageId || selectedMessageId === "") {
            dataList = [];

            alert("업무 및 전문을 선택해 주세요.");
            return;
        }

        await searchSvcUri();

        try {
            let queryParams = selectedProject
                ? `?prj_id=${selectedProject}`
                : "";
            queryParams += selectedJob ? `&app_id=${selectedJob}` : "";
            queryParams += selectedMessageId
                ? `&msg_id=${selectedMessageId}`
                : "";

            const res = await fetch(`${$rooturl}/jobs/data/list` + queryParams);
            dataList = await res.json();
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        } finally {
            isLoading = false;
        }
    }

    // 추가
    function handleAdd() {
        if (!selectedMessageId) {
            alert("추가할 전문데이터의 업무, 전문을 상단에서 선택해주세요.");
            return;
        }

        const newRow = {
            PKEY: "",
            PRJ_ID: selectedProject,
            APP_ID: selectedJob,
            MSG_ID: selectedMessageId,
            PRJ_NM: projectSelectElement?.selectedOptions[0]?.text || "",
            APP_NM: jobs.find((j) => j.APP_ID === selectedJob)?.APPNM || "",
            MSG_KR_NM:
                filteredMessages.find((m) => m.MSG_ID === selectedMessageId)
                    ?.MSG_KR_NM || "",
            isChecked: true,
            status: "N",
            content: "",
            SVC_URI: "",
            FIXEDLEN_VAL: "",
            COMMENT: "",
        };

        dataList = [...dataList, newRow];
    }

    // 삭제
    async function handleDelete() {
        const checked = dataList.filter((d) => d.isChecked);

        if (checked.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        if (confirm(`${checked.length}건을 삭제하시겠습니까?`)) {
            // N -> 즉시 제거, R/U -> API Call
            const toRemove = new Set(checked.filter((d) => d.status === "N"));
            const toDelete = checked.filter((d) => d.status !== "N");

            try {
                if (toDelete.length > 0) {
                    await fetch(`${$rooturl}/jobs/data/delete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(toDelete),
                    });
                }

                // 화면 update
                dataList = dataList.filter(
                    (d) => !toRemove.has(d) && !toDelete.includes(d),
                );

                alert("삭제되었습니다.");
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    }

    // 저장
    async function handleSave() {
        const saveItems = dataList.filter(
            (d) => d.status === "N" || d.status === "U" || d.isChecked,
        );

        if (saveItems.length === 0) {
            alert("저장할 변경사항이 없습니다.");
            return;
        }

        if (confirm(`${saveItems.length}건을 저장하시겠습니까?`)) {
            try {
                const res = await fetch(`${$rooturl}/jobs/data/save`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(saveItems),
                });

                const result = await res.json();
                alert(`${result.count}건을 저장했습니다.`);

                datsSearch();
            } catch (error) {
                console.error("저장 실패:", error);
                alert("저장 중 오류가 발생했습니다.");
            }
        }
    }

    // 파일업로드
    function fileupload() {
        if (!selectedMessageId) {
            alert("업로드할 전문데이터의 업무, 전문을 상단에서 선택해주세요.");
            return;
        }

        fileInput.click();
    }

    // 전체 선택
    let isAllChecked = false;

    function toggleAll(e) {
        const checked = e.target.checked;
        isAllChecked = checked;
        dataList = dataList.map((d) => ({ ...d, isChecked: checked }));
    }

    // 개별 체크 -> 전체 선택 상태 업데이트
    $: {
        if (dataList.length > 0) {
            isAllChecked = dataList.every((d) => d.isChecked);
        } else {
            isAllChecked = false;
        }
    }

    // 엑셀 관련 변수
    let fileInput;

    function handleExcelUploadTrigger() {
        if (!selectedMessageId) {
            alert("업로드할 전문데이터의 업무, 전문을 상단에서 선택해주세요.");
            return;
        }

        fileInput.click();
    }

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
                const msgId = row["전문 ID"] || selectedMessageId;

                const project = projects.find((p) => p.PRJ_ID === prjId);
                const job = jobs.find((j) => j.APP_ID === appId);
                const message =
                    messages.find((m) => m.MSG_ID === msgId) ||
                    (filteredMessages
                        ? filteredMessages.find((m) => m.MSG_ID === msgId)
                        : null);

                return {
                    APP_ID: appId,
                    MSG_ID: msgId,
                    MSGDT_ID: "",
                    PROTOCOL_GB: row["프로토콜"],
                    METHOD: row["Method"],
                    SVC_URI: row["서비스/URI"],
                    HEADER_VAL: row["Header"],
                    PARAM_VAL: row["파라메터"],
                    FIXEDLEN_VAL: row["전문데이터"] || "",
                    COMMENT: row["설명"] || "",
                    srcip: row["소스IP"],
                    srcport: row["소스port"],
                    o_dstip: row["원본목적지IP"],
                    o_dstport: row["원본목적지port"],
                    dstip: row["목적지IP"],
                    dstport: row["목적지port"],
                    origin: row["원본구분"],
                    rcode: row["응답코드"],
                    RHEADER_VAL: row["수신Header"],
                    RFIXEDLEN_VAL: row["수신전문데이터"],
                    isChecked: true,
                    status: "N",
                };
            });

            dataList = [...dataList, ...newRows];

            alert(`${newRows.length}건이 테이블에 추가되었습니다.`);

            fileInput.value = "";
        };
        reader.readAsArrayBuffer(file);
    }

    function handleExcelDownload() {
        if (dataList.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const exportData = dataList.map((row) => {
            const project = projects.find((p) => p.PRJ_ID === row.PRJ_ID);
            const job = jobs.find((j) => j.APP_ID === row.APP_ID);

            const flat = {
                업무ID: row.APP_ID,
                전문ID: row.MSG_ID,
                전문데이터ID: row.MSGDT_ID,
                프로토콜: row.PROTOCOL_GB,
                Method: row.METHOD,
                "서비스/URI": row.SVC_URI,
                Header: row.HEADER_VAL,
                파라메터: row.PARAM_VAL,
                전문데이터: row.FIXEDLEN_VAL,
                설명: row.COMMENT,
                소스IP: row.srcip,
                소스port: row.srcport || 0,
                원본목적지IP: row.o_dstip,
                원본목적지port: row.o_dstport || 0,
                목적지IP: row.dstip,
                목적지port: row.dstport || 0,
                원본구분: row.origin,
                응답코드: row.rcode || 0,
                수신Header: row.RHEADER_VAL,
                수신전문데이터: row.RFIXEDLEN_VAL,
            };

            return flat;
        });

        const ws = utils.json_to_sheet(exportData);
        const wb = utils.book_new();

        utils.book_append_sheet(wb, ws, "JobData");
        writeFile(wb, "JobData.xlsx");
    }
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <!-- Top Pane: Filter & Actions -->
    <div class="bg-white border border-gray-300 rounded shadow overflow-hidden">
        <!-- Header Section -->
        <div
            class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">전문업로드</h2>
            <div class="flex flex-wrap items-center gap-2">
                <!-- Project Select -->
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
                        class="w-40 mr-1 text-sm font-bold text-left text-gray-600 bg-white px-2 py-1 border border-gray-300"
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
                        class="w-24 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
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

                <!-- Message Select -->
                <div class="flex items-center">
                    <span
                        class="w-24 mr-1 text-sm font-bold text-right text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300"
                    >
                        전문
                    </span>
                    <select
                        bind:value={selectedMessageId}
                        on:change={datsSearch}
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[150px]"
                    >
                        <option value="">전문 선택</option>
                        {#each messages as msg}
                            <option value={msg.MSG_ID}>{msg.MSG_KR_NM}</option>
                        {/each}
                    </select>
                </div>

                <div class="flex gap-1 ml-2">
                    <button on:click={datsSearch}> 조회 </button>
                    <button on:click={handleAdd}> 추가 </button>
                    <button class="btn-delete" on:click={handleDelete}>
                        삭제
                    </button>
                    <button on:click={handleSave}> 저장 </button>
                    <button on:click={fileupload}> 파일업로드 </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button
                        class="btn-excel"
                        on:click={handleExcelUploadTrigger}
                    >
                        엑셀 업로드
                    </button>
                    <button class="btn-excel" on:click={handleExcelDownload}>
                        엑셀 다운로드
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Table Section -->
    <div
        class="flex-1 overflow-auto bg-white border border-gray-300 rounded shadow"
    >
        <table class="min-w-full">
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            on:change={toggleAll}
                            checked={isAllChecked}
                        />
                    </th>
                    <th class="text-center w-10 hidden"> 상태 </th>
                    <th class="text-center hidden"> 업무ID </th>
                    <th class="text-center hidden"> 전문ID </th>
                    <th class="text-center hidden"> 전문데이터ID </th>
                    <th
                        class="text-center"
                        style="width: 80px; min-width: 80px;"
                    >
                        프로토콜
                    </th>
                    <th
                        class="text-center"
                        style="width: 80px; min-width: 80px;"
                    >
                        Method
                    </th>
                    <th
                        class="text-center"
                        style="width: 80px; min-width: 80px;"
                    >
                        서비스/URI
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        Header
                    </th>
                    <th
                        class="text-left"
                        style="width: 200px; min-width: 200px;"
                    >
                        파라메터
                    </th>
                    <th
                        class="text-left"
                        style="width: 200px; min-width: 200px;"
                    >
                        전문데이터
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        설명
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        소스IP
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        소스port
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        원본목적지IP
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        원본목적지port
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        목적지IP
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        목적지port
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        원본구분
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        응답코드
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        수신Header
                    </th>
                    <th
                        class="text-left"
                        style="width: 100px; min-width: 100px;"
                    >
                        수신전문데이터
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white">
                {#if isLoading}
                    <tr>
                        <td colspan="100" class="text-center py-4"
                            >조회할 전문데이터의 업무, 전문을 선택해주세요.</td
                        >
                    </tr>
                {:else if dataList.length === 0}
                    <tr>
                        <td colspan="100" class="text-center py-4 text-gray-500"
                            >데이터가 없습니다.</td
                        >
                    </tr>
                {:else}
                    {#each dataList as row}
                        <tr
                            class="hover:bg-blue-50 transition-colors border-b border-gray-200 {row.isChecked
                                ? 'bg-blue-100'
                                : ''}"
                        >
                            <td class="text-center">
                                <input
                                    type="checkbox"
                                    bind:checked={row.isChecked}
                                />
                            </td>
                            <td
                                class="text-center font-semibold
                                     {row.status === 'N'
                                    ? 'text-green-600'
                                    : row.status === 'D'
                                      ? 'text-red-500'
                                      : 'text-gray-600'} hidden"
                            >
                                {row.status}
                            </td>
                            <td class="text-center hidden">
                                {row.APP_ID || ""}
                            </td>
                            <td class="text-center hidden">
                                {row.MSG_ID || ""}
                            </td>
                            <td class="text-center hidden">
                                {row.MSGDT_ID || ""}
                            </td>
                            <td class="text-center p-0">
                                <select
                                    bind:value={row.PROTOCOL_GB}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[80px]"
                                >
                                    <option value="" disabled
                                        >프로토콜 선택</option
                                    >
                                    <option value="0">0.TCP</option>
                                    <option value="1">1.HTTP</option>
                                    <option value="2">2.UDP</option>
                                    <option value="3">3.TMAX</option>
                                </select>
                            </td>
                            <td class="text-center p-0">
                                <select
                                    bind:value={row.METHOD}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[80px]"
                                >
                                    <option value="" disabled
                                        >Method 선택</option
                                    >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="HEAD">HEAD</option>
                                </select>
                            </td>
                            <td class="text-center">
                                <select
                                    bind:value={row.SVC_URI}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                                >
                                    <option value="" disabled
                                        >서비스/URI 선택</option
                                    >
                                    {#each svcUris as svcUri}
                                        <option value={svcUri.SVC_URI}
                                            >{svcUri.SVC_URI}</option
                                        >
                                    {/each}
                                </select>
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.HEADER_VAL}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.PARAM_VAL}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.FIXEDLEN_VAL}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.COMMENT}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.srcip}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.srcport}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.o_dstip}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.o_dstport}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.dstip}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.dstport}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td class="text-center p-0">
                                <select
                                    bind:value={row.origin}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[80px]"
                                >
                                    <option value="" disabled
                                        >원본구분 선택</option
                                    >
                                    <option value="0">0.자동생성</option>
                                    <option value="1">1.수작업</option>
                                </select>
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.rcode}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.RHEADER_VAL}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left p-0"
                                contenteditable="true"
                                bind:textContent={row.RFIXEDLEN_VAL}
                                on:input={() => {
                                    if (row.status === "R") row.status = "U";
                                    row.isChecked = true;
                                }}
                            >
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
    <input
        type="file"
        bind:this={fileInput}
        on:change={handleFileChange}
        class="hidden"
        accept=".xlsx, .xls"
    />
</div>
