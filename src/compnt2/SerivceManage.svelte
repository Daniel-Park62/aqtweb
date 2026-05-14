<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import * as XLSX from "xlsx";
    import { getAppid, aqtConfig } from "../lib/Common.svelte";

    // Top Form Data
    let currentHeader = {
        job: "",
    };

    // 프로젝트
    let projects = [];
    let searchProjectId = "";
    // 업무
    let businesses = [];
    let searchAppId = "";
    // 서비스
    let searchType = "all";
    let searchKeyword = "";

    // 서비스 그리드 자료
    let jobServiceList = [];
    let selectedIds = new Set();

    // Pagination State
    let currentPage = 1;
    let itemsPerPage = 12;

    // excel upload input
    let fileInput;

    $: totalPages = Math.ceil(jobServiceList.length / itemsPerPage);
    $: paginatedList = jobServiceList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    onMount(async () => {
        handleSearchProjectChangeTop();
    });

    // 프로젝트 리스트
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

    // 업무 리스트
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

    // 프로젝트 선택
    async function handleSearchProjectChangeTop() {
        searchAppId = "";
        jobServiceList = [];
        businesses = [];
        resetForm();

        await fetchProjects();

        const found = projects.find((p) => {
            searchProjectId = p.PRJ_ID;
        });

        await fetchBusinesses();

        return;
    }

    // 업무선택(조회)
    async function handleSearchJobChange() {
        await handleTopSearch();
        return;
    }

    // 서비스 조회
    async function handleTopSearch() {
        if (!searchProjectId || !searchAppId) {
            jobServiceList = [];
            //businesses = [];
            resetForm();

            alert("업무를 선택해 주세요.");
            return;
        }

        searchKeyword = "";
        searchType = "all";

        // 서비스 조회
        await fetchjobServices();

        try {
            const res = await fetch(
                `${$rooturl}/jobService/detail?app_id=${searchAppId}`,
            );

            if (res.ok) {
                const data = await res.json();

                if (data) {
                    currentHeader = {
                        job: data.APP_ID,
                    };
                } else {
                    resetForm();

                    currentHeader.job = searchAppId;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 서비스 조회
    async function fetchjobServices() {
        if (!searchProjectId || !searchAppId) {
            alert("상단에서 프로젝트와 업무를 선택해 주세요.");
            return;
        }

        try {
            const params = new URLSearchParams({
                type: searchType,
                keyword: searchKeyword,
                app_id: searchAppId,
            });

            const res = await fetch(
                `${$rooturl}/jobService/list?${params.toString()}`,
            );

            if (res.ok) {
                jobServiceList = await res.json();
                currentPage = 1; // Reset to first page on search
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 업무초기화
    function resetForm() {
        currentHeader = {
            job: "",
        };
    }

    // 전체체크
    function toggleAll(event) {
        if (event.target.checked) {
            selectedIds = new Set(jobServiceList.map((item) => item.SVC_ID));
        } else {
            selectedIds = new Set();
        }
        selectedIds = selectedIds;
    }

    // 개별체크
    function toggleOne(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        selectedIds = selectedIds;
    }

    // 그리드 추가
    function handleGridAdd() {
        if (!searchAppId) {
            alert("상단 업무를 먼저 선택해 주세요.");
            return;
        }

        const project = projects.find((p) => p.PRJ_ID == searchProjectId);
        const newItem = {
            SVC_ID: "",
            APP_ID: searchAppId,
            SVC_URI: "",
            SVC_KR_NM: "",
            SVC_EN_NM: "",
            SVC_KIND: "",
            SVC_MGR: "",
            CUMCNT: "",
            isNew: true,
        };

        jobServiceList = [newItem, ...jobServiceList];
        //selectedIds.add(nextPkey);
        //selectedIds = selectedIds;
        currentPage = 1; // Jump to first page to see the new row
    }

    // 그리드 삭제
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
                        `${$rooturl}/jobService/delete/${id}`,
                        {
                            method: "DELETE",
                        },
                    );

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(`Failed to delete SVC_ID ${id}: ${text}`);
                    }
                }
            }

            alert("삭제되었습니다.");

            selectedIds = new Set();
            fetchjobServices();
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다.");
        }
    }

    // 그리드 저장
    async function handleGridSave() {
        const itemsToSave = jobServiceList.filter((item) =>
            selectedIds.has(item.SVC_ID),
        );

        if (itemsToSave.length === 0) {
            alert("저장할 항목을 선택해주세요.");
            return;
        }

        if (!confirm(`선택한 ${itemsToSave.length}건을 저장하시겠습니까?`)) {
            return;
        }

        try {
            const res = await fetch(`${$rooturl}/jobService/saveList`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemsToSave),
            });

            if (res.ok) {
                alert("리스트가 저장되었습니다.");

                selectedIds = new Set();

                fetchjobServices();
            } else {
                const text = await res.text();

                alert(`리스트 저장 실패: ${text}`);
            }
        } catch (error) {
            console.error(error);
            alert("리스트 저장 중 오류가 발생했습니다.");
        }
    }

    // 그리드 엑셀다운로드
    function handleExcelDownload() {
        const itemsToExport = jobServiceList.map((item) => {
            const { SVC_ID, APP_ID, ...rest } = item;

            return rest;
        });

        const ws = XLSX.utils.json_to_sheet(itemsToExport);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "jobServiceList");
        XLSX.writeFile(wb, "jobServiceList.xlsx");
    }
</script>

<div
    class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4"
>
    <div class="bg-white border border-gray-300 rounded shadow overflow-hidden">
        <div
            class="p-4 border-b border-gray-200 flex justify-between items-center gap-2"
        >
            <h2 class="text-xl font-bold text-gray-700">서비스/URI</h2>
            <div class="flex justify-between space-x-2 mr-4">
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
                        {#each businesses.filter((b) => searchProjectId) as biz}
                            <option value={biz.APP_ID}>{biz.APPNM}</option>
                        {/each}
                        -->
                        {#each getAppid() as biz}
                            <option value={biz.appid}>{biz.appname}</option>
                        {/each}
                    </select>
                </div>
                <button on:click={handleSearchJobChange}> 조회 </button>
            </div>
        </div>
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm"
        >
            <!-- hidden 업무 ID -->
            <input
                type="text"
                class="flex-1 border border-gray-300 bg-gray-100 py-1 px-2 text-gray-500 hidden"
                bind:value={currentHeader.job}
            />
        </div>
    </div>
    <div class="bg-white p-4 shadow border border-gray-300">
        <div class="flex justify-between items-center mb-4">
            <div class="flex space-x-2 mr-auto items-start">
                <h2 class="text-lg font-bold text-gray-700 px-5">
                    서비스/URI 정보
                </h2>
            </div>
            <div class="flex space-x-2 items-center">
                <select
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    bind:value={searchType}
                >
                    <option value="all">전체</option>
                    <option value="SVC_KR_NM">서비스명(한글)</option>
                    <option value="SVC_EN_NM">서비스명(영문)</option>
                    <option value="SVC_URI">서비스 URI</option>
                </select>
                <input
                    type="text"
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="필드명 입력"
                    bind:value={searchKeyword}
                />
                <button on:click={fetchjobServices}> 조회 </button>
                <button on:click={handleGridAdd}> 추가 </button>
                <button class="btn-delete" on:click={handleGridDelete}>
                    삭제
                </button>
                <button on:click={handleGridSave}> 저장 </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button class="btn-excel" on:click={handleExcelDownload}>
                    엑셀다운로드
                </button>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th class="w-8"
                            ><input type="checkbox" on:change={toggleAll} /></th
                        >
                        <th class="text-center hidden">업무ID</th>
                        <th class="text-center hidden">서비스ID</th>
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >서비스/URI</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >서비스명(한글)</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >서비스명(영문)</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">프로토콜</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;"
                            >서비스담당자</th
                        >
                        <th
                            class="text-center"
                            style="width: 100px; min-width: 100px;">누적건수</th
                        >
                    </tr>
                </thead>
                <tbody class="bg-white">
                    {#each paginatedList as item (item.SVC_ID)}
                        <tr class="hover:bg-blue-50 cursor-pointer">
                            <td class="text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(item.SVC_ID)}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                            <td class="text-center hidden">
                                {item.APP_ID}
                            </td>
                            <td class="text-center hidden">
                                {item.SVC_ID}
                            </td>
                            <td class="text-center">
                                <input
                                    type="text"
                                    class="w-full bg-transparent border-none text-center outline-none"
                                    bind:value={item.SVC_URI}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                            <td class="text-center">
                                <input
                                    type="text"
                                    class="w-full bg-transparent border-none text-center outline-none"
                                    bind:value={item.SVC_KR_NM}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                            <td class="text-center">
                                <input
                                    type="text"
                                    class="w-full bg-transparent border-none text-center outline-none"
                                    bind:value={item.SVC_EN_NM}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                            <td class="text-center">
                                <select
                                    class="w-full bg-transparent border-none text-left outline-none"
                                    bind:value={item.SVC_KIND}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                >
                                    <option value="">프로토콜 선택</option>
                                    <option value="1">TCP</option>
                                    <option value="2">HTTP</option>
                                    <option value="3">UDP</option>
                                    <option value="4">TMAX</option>
                                </select>
                            </td>
                            <td class="text-center">
                                <input
                                    type="text"
                                    class="w-full bg-transparent border-none text-center outline-none"
                                    bind:value={item.SVC_MGR}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                            <td class="text-center">
                                <input
                                    type="text"
                                    class="w-full bg-transparent border-none text-center outline-none"
                                    bind:value={item.CUMCNT}
                                    on:change={() => toggleOne(item.SVC_ID)}
                                />
                            </td>
                        </tr>
                    {/each}
                    {#if jobServiceList.length === 0}
                        <tr>
                            <td
                                colspan="23"
                                class="text-center py-4 border border-gray-300"
                                >데이터가 없습니다.</td
                            >
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
        {#if totalPages > 1}
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
                    Page {currentPage} of {totalPages} (Total {jobServiceList.length}
                    items)
                </span>
            </div>
        {/if}
    </div>
</div>
