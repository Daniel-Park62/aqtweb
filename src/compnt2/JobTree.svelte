<script>
    // @ts-nocheck

    import { onMount, tick } from "svelte";
    import { rooturl } from "../aqtstore";

    // --- 데이터 상태 ---
    let projects = [];
    let jobs = [];
    let messages = []; // 의미에 맞게 변수명 변경 (allMessages -> messages)

    let projectAll = [];
    let jobAll = [];
    let messageAll = [];

    // 필터 상태
    let selectedProject = "";
    let selectedJob = "";
    let selectedMessageId = "";

    // UI 참조
    let projectSelectElement;
    let jobSelectElement;

    // 트리 구조 상태
    let treeData = [];

    // 우측 그리드 상태
    let selectedNode = null; // { type: 'message', id: ... , name: ... }
    let gridData = [];
    let gridColumns = [];
    let isLoading = false;
    let isLoad = false;

    onMount(async () => {
        await searchProjects();
        await searchJobs();
        await searchMessages();

        isLoad = true;
    });

    // 프로젝트 목록 조회
    async function searchProjects() {
        try {
            const projectRes = await fetch($rooturl + "/common/project/list");
            projects = await projectRes.json();

            if (!isLoad) projectAll = projects;
            // 프로젝트만으로 초기 트리 구성하지 않음 (조회 버튼 클릭 시 구성)
        } catch (error) {
            console.error("프로젝트 목록 로딩 실패:", error);
        }
    }

    // 업무 목록 조회
    async function searchJobs() {
        const found = projects.find((p) => {
            selectedProject = p.PRJ_ID;
        });

        const queryParams = selectedProject ? `?prj_id=${selectedProject}` : "";

        try {
            const jobRes = await fetch(
                $rooturl + "/common/job/list" + queryParams,
            );
            jobs = await jobRes.json();

            if (!isLoad) jobAll = jobs;

            if (!selectedProject) {
                selectedJob = "";
                jobs = [];
                selectedMessageId = "";
                messages = [];
            }
        } catch (error) {
            console.error("업무 목록 로딩 실패:", error);
        }
    }

    // 전문 목록 조회
    async function searchMessages() {
        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/list" + queryParams,
            );

            messages = await res.json();

            if (!isLoad) messageAll = messages;

            if (!selectedJob) {
                selectedMessageId = "";
                messages = [];
            }
        } catch (error) {
            console.error("전문 목록 로딩 실패:", error);
        }
    }

    // 조회 버튼 액션 (선택된 항목으로 트리/그리드 업데이트 or 리프레시)
    async function handleSearch() {
        // 선택 상자가 즉시 조회를 트리거하므로, 이 버튼은 '새로고침' 또는 트리의 상태를 확실히 하는 용도로 사용됩니다.

        // 1. 트리 구성
        buildTree();
        await tick();

        // 2. 현재는 특정 전문이 선택된 경우 해당 전문을 선택하도록 합니다.
        if (selectedMessageId) {
            // 트리에서 전문 노드 찾아서 선택
            // 트리 업데이트가 비동기가 아니면(fetch 후 대부분 동기) 바로 찾음
            const targetNode = findNode("message", selectedMessageId);

            if (targetNode) {
                selectMessage(targetNode);
            }
        }
    }

    function findNode(type, id) {
        for (const proj of treeData) {
            if (type === "project" && proj.id === id) return proj;

            for (const job of proj.children) {
                if (type === "job" && job.id === id) return job;

                for (const msg of job.children) {
                    if (type === "message" && msg.id === id) return msg;
                }
            }
        }

        return null;
    }

    function buildTree() {
        // 현재 로드된 프로젝트, 업무, 전문을 기반으로 계층 구조 생성
        // 'jobs'가 비어 있으면(아직 로드 안됨), 서버에 존재하더라도 프로젝트 노드의 자식은 비어있음.
        // 이는 '검색' 동작과 일치함.
        // projectAll.filter((proj) => proj.PRJ_ID === selectedProject);
        const project = selectedProject
            ? projectAll.filter((proj) => proj.PRJ_ID === selectedProject)
            : projectAll;
        const job = selectedJob
            ? jobAll.filter((job) => job.APP_ID === selectedJob)
            : jobAll;
        const message = selectedMessageId
            ? messageAll.filter((msg) => msg.MSG_ID === selectedMessageId)
            : messageAll;

        treeData = project.map((proj) => {
            // 현재 프로젝트에 속하고 로드된 업무만 포함
            // selectedProject가 설정된 경우, 해당 프로젝트의 업무만 로드 되었을 가능성이 높음.
            const projJobs = job.filter((j) => j.PRJ_ID === proj.PRJ_ID); // 속성 이름 확인

            const jobNodes = projJobs.map((job) => {
                // 전문도 마찬가지
                const jobMsgs = message.filter(
                    (m) => m.PRJ_ID === job.PRJ_ID && m.APP_ID === job.APP_ID,
                );

                const children = jobMsgs.map((msg) => ({
                    id: msg.MSG_ID,
                    name: msg.MSG_KR_NM || msg.messageNameKr,
                    type: "message",
                    projectId: proj.PRJ_ID,
                    jobId: job.APP_ID,
                }));

                // 업무가 선택되었거나, 검색된 전문이 포함되어 있으면 열기
                const isOpen =
                    job.APP_ID === selectedJob ||
                    (selectedMessageId &&
                        children.some((c) => c.id === selectedMessageId));

                return {
                    id: job.APP_ID,
                    name: job.APPNM,
                    type: "job",
                    isOpen: isOpen, // 선택된 경우 자동 열기
                    children: children,
                };
            });

            const isSelectedProject = proj.PRJ_ID === selectedProject;

            return {
                id: proj.PRJ_ID,
                name: proj.PRJ_NM,
                type: "project",
                isOpen: isSelectedProject, // 선택된 경우 자동 열기
                children: jobNodes,
            };
        });
    }

    function toggleNode(node) {
        node.isOpen = !node.isOpen;
        treeData = treeData; // 반응성 트리거
    }

    function selectMessage(node) {
        if (node.type !== "message") return;

        selectedNode = node;
        loadGridData(node);
    }

    async function loadGridData(node) {
        isLoading = true;

        try {
            // JobDataManage와 동일하게 쿼리 파라미터 스타일 사용
            const res = await fetch(
                `${$rooturl}/jobs/field/listMess?msg_id=${node.id}&prj_id=${node.projectId}&app_id=${node.jobId}`,
            );
            const data = await res.json();

            if (data.length > 0) {
                // JobDataManage 리턴 구조는 객체 배열(평탄화됨).
                // 이전 코드의 dynamicData 부분은 제거하고 JobDataManage 구조에 맞춤.
                // JobDataManage 테이블 컬럼: 체크박스, 상태, PRJ_ID, PRJ_NM, APP_ID, APP_NM, MSG_ID, MSG_NM, MSGDT_ID, content, comment
                // 여기서 관련 컬럼 표시.
                // 표준 컬럼 + 내용/설명 선택
                gridData = data;
            } else {
                gridData = [];
            }
        } catch (error) {
            console.error(error);
            gridData = [];
        } finally {
            isLoading = false;
        }
    }
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <!-- Top Filter Section -->
    <div class="bg-white border border-gray-300 rounded shadow overflow-hidden">
        <div
            class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">업무전문 Layout</h2>
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
                        {#each jobs as job}
                            <option value={job.APP_ID}>{job.APPNM}</option>
                        {/each}
                    </select>
                </div>

                <!-- Message Select -->
                <div class="flex items-center">
                    <span class="text-gray-700 font-semibold px-2 text-sm"
                        >전문</span
                    >
                    <select
                        bind:value={selectedMessageId}
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[150px]"
                    >
                        <option value="">전문 선택</option>
                        {#each messages as msg}
                            <option value={msg.MSG_ID}>{msg.MSG_KR_NM}</option>
                        {/each}
                    </select>
                </div>

                <button
                    on:click={handleSearch}
                    class="bg-white hover:bg-blue-50 text-blue-600 font-semibold hover:text-blue-700 px-4 py-1 text-sm rounded border border-blue-300 hover:border-blue-400 transition ml-2"
                >
                    조회
                </button>
            </div>
        </div>
    </div>

    <!-- Main Content: Tree & Grid -->
    <div class="flex-1 flex gap-4 overflow-hidden">
        <!-- Left Panel: Tree View (30%) -->
        <div
            class="w-[30%] shrink-0 bg-white border border-gray-300 rounded shadow flex flex-col"
        >
            <div class="p-3 border-b border-gray-200 bg-gray-100 font-bold">
                업무전문 목록
            </div>
            <div class="flex-1 overflow-auto p-2">
                {#each treeData as proj}
                    <!-- Level 1: Project -->
                    <div class="mb-1">
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                            on:click={() => toggleNode(proj)}
                        >
                            <span class="mr-2 text-gray-500">
                                {#if proj.isOpen}
                                    ▼
                                {:else}
                                    ▶
                                {/if}
                            </span>
                            <span class="font-semibold text-blue-700">
                                📁 {proj.name}
                            </span>
                        </div>

                        {#if proj.isOpen}
                            <div class="ml-4 border-l border-gray-300 pl-2">
                                {#each proj.children as job}
                                    <!-- Level 2: Job -->
                                    <div class="mb-1">
                                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                                        <div
                                            class="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                                            on:click={() => toggleNode(job)}
                                        >
                                            <span class="mr-2 text-gray-500">
                                                {#if job.isOpen}
                                                    ▼
                                                {:else}
                                                    ▶
                                                {/if}
                                            </span>
                                            <span
                                                class="font-medium text-gray-700"
                                            >
                                                📂 {job.name}
                                            </span>
                                        </div>

                                        {#if job.isOpen}
                                            <div
                                                class="ml-4 border-l border-gray-300 pl-2"
                                            >
                                                {#each job.children as msg}
                                                    <!-- Level 3: Message (Leaf) -->
                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <div
                                                        class="flex items-center cursor-pointer p-1 rounded {selectedNode?.id ===
                                                        msg.id
                                                            ? 'bg-blue-100 text-blue-800 font-semibold'
                                                            : 'hover:bg-gray-100 text-gray-600'}"
                                                        on:click={() =>
                                                            selectMessage(msg)}
                                                    >
                                                        <span class="mr-2"
                                                            >📄</span
                                                        >
                                                        <span>{msg.name}</span>
                                                        <span
                                                            class="text-xs text-gray-400 ml-2"
                                                            >({msg.id})</span
                                                        >
                                                    </div>
                                                {/each}
                                                {#if job.children.length === 0}
                                                    <div
                                                        class="text-xs text-gray-400 italic p-1"
                                                    >
                                                        (전문 없음)
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                                {#if proj.children.length === 0}
                                    <div
                                        class="text-xs text-gray-400 italic p-1"
                                    >
                                        (업무 없음)
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Right Panel: Data Grid (70%) -->
        <div
            class="flex-1 min-w-0 bg-white border border-gray-300 rounded shadow flex flex-col"
        >
            <div
                class="p-3 border-b border-gray-200 bg-gray-100 font-bold flex justify-between items-center"
            >
                <span>
                    업무전문 필드
                    {#if selectedNode}
                        <span class="text-blue-600 ml-2"
                            >- {selectedNode.name} ({selectedNode.id})</span
                        >
                    {/if}
                </span>
                <div class="text-xs text-gray-500">
                    {#if selectedNode}
                        {gridData.length}건 조회됨
                    {/if}
                </div>
            </div>

            <div class="flex-1 overflow-auto p-0 relative">
                {#if !selectedNode}
                    <div
                        class="absolute inset-0 flex items-center justify-center text-gray-400"
                    >
                        좌측 트리에서 전문을 선택해주세요.
                    </div>
                {:else if isLoading}
                    <div
                        class="absolute inset-0 flex items-center justify-center text-blue-500"
                    >
                        데이터 로딩 중...
                    </div>
                {:else if gridData.length === 0}
                    <div
                        class="absolute inset-0 flex items-center justify-center text-gray-400"
                    >
                        데이터가 없습니다.
                    </div>
                {:else}
                    <table
                        class="min-w-[2000px] border-collapse text-sm whitespace-nowrap"
                    >
                        <thead
                            class="bg-gray-50 text-gray-700 sticky top-0 shadow"
                        >
                            <tr>
                                <th class="w-10 hidden">전문필드ID</th>
                                <th style="width: 100px; min-width: 100px;">
                                    필드명(영문)
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    필드명(한글)
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    필드타입
                                </th>
                                <th style="width: 200px; min-width: 200px;">
                                    필드설명
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    세그먼트
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    시작위치
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    필드길이
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    반복횟수
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    순서
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    필수여부
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    기본값
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    포맷/패턴
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    코드셋
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    마스킹여부
                                </th>
                                <th style="width: 100px; min-width: 100px;">
                                    비고
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each gridData as field, i}
                                <tr
                                    class="hover:bg-blue-50 transition-colors border-b border-gray-200"
                                >
                                    <td class="text-center hidden">
                                        {field.MSGFLD_ID}
                                    </td>
                                    <td class="text-left">
                                        {field.FLD_EN_NM}
                                    </td>
                                    <td class="text-left">
                                        {field.FLD_KR_NM}
                                    </td>
                                    <td class="text-center">
                                        {field.FLD_TYPE}
                                    </td>
                                    <td class="text-left">
                                        {field.FLD_CMT}
                                    </td>
                                    <td class="text-center">
                                        {field.FLD_SGMT}
                                    </td>
                                    <td class="text-right">
                                        {field.ST_POS}
                                    </td>
                                    <td class="text-right">
                                        {field.FLD_LEN}
                                    </td>
                                    <td class="text-right">
                                        {field.REPET_NUM}
                                    </td>
                                    <td class="text-center">
                                        {field.FLD_ORDER}
                                    </td>
                                    <td class="text-center">
                                        {field.ESSEN_YN}
                                    </td>
                                    <td class="text-center">
                                        {field.DEFAULT_VAL}
                                    </td>
                                    <td class="text-center">
                                        {field.FLD_FORMAT}
                                    </td>
                                    <td class="text-center">
                                        {field.FLD_CDSET}
                                    </td>
                                    <td class="text-center">
                                        {field.MASK_YN}
                                    </td>
                                    <td class="text-left">
                                        {field.META_CONV_RULE}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom Scrollbar for Tree View */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    ::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #bbb;
    }
</style>
