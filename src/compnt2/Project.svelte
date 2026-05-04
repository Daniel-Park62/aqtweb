<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import { rooturl } from "../aqtstore";
    import * as XLSX from "xlsx";

    let projects = [];
    let businessItems = [];
    let isLoading = false;
    let errorMessage = "";
    let selectedProject = "";
    let jobs = [];

    let currentProject = {
        prj_id: "",
        prj_nm: "",
        enc_val: "",
        tcode: "",
        proto_col: "",
        compr_yn:"",
        fail_cond: "",
        diffc_cond: "",
        virtual_col1: "",
        virtual_col2: "",
        virtual_type1: "varchar(100)",
        virtual_type2: "varchar(100)",
        virtual_expr1: "varchar(100) cast('' as char(100)) charset utf8mb4",
        virtual_expr2: "varchar(100) cast('' as char(100)) charset utf8mb4",
    };

    // Filters for Bottom Grid
    let searchType = "all";
    let searchKeyword = "";
    let selectedIds = new Set();

    // Pagination State
    let currentPage = 1;
    let itemsPerPage = 9;

    $: totalPages = Math.ceil(businessItems.length / itemsPerPage);
    $: paginatedList = businessItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    // Top Select Selection
    let selectedTopProjectId = "";
    
    onMount(() => {
        handleTopSelectChange();
    });

    // 상단 프로젝트 정보 조회 (프로젝트 select box 리스트)
    async function loadMetadata() {
        try {
            const projectRes = await fetch($rooturl + "/project/list");
            projects = await projectRes.json();

        } catch (error) {
            console.error("메타데이터 로딩 실패:", error);
        }
    }

    // 상단 프로젝트 Select box 변경시 조회
    async function handleTopSelectChange() {
        await loadMetadata();

        const found = projects.find((p) => {
            p.PRJ_ID == selectedProject
            selectedProject = p.PRJ_ID;            
        });
        
        if (!selectedProject || selectedProject === "") {
            resetForm();
            await fetchBusinessItems();
        } else {
            const found = projects.find((p) => p.PRJ_ID == selectedProject);

            if (found) {
                await loadMetadata();
                await handleGridRowClick(found);
                await handleTopSearch(); 
            } else {
                resetForm();
                await fetchBusinessItems();
            }

        }
    }

    // 상단 프로젝트(Project) 조회
    async function fetchProjects() {
        try {
            isLoading = true;

            const res = await fetch(
                `${$rooturl}/project/list?keyword=${searchKeyword}`,
            );

            if (res.ok) {
                projects = await res.json();
            } else {
                console.error("Failed to fetch projects");
                projects = []; 
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            isLoading = false;
        }
    }

    // 하단 업무(business) 조회
    async function fetchBusinessItems() {
        try {
            isLoading = true;

            let url = `${$rooturl}/project/business/list?type=${searchType}&keyword=${searchKeyword}`;

            if (selectedProject && selectedProject !== "") {
                url += `&projectId=${selectedProject}`;
            }

            if (!searchKeyword && (!selectedProject || selectedProject === "")) {
                businessItems = [];
                isLoading = false;
                return;
            }

            const res = await fetch(url);

            if (res.ok) {
                businessItems = await res.json();
                currentPage = 1;
            } else {
                console.error("Failed to fetch business items");
                businessItems = [];
            }
        } catch (error) {
            console.error("Error fetching business items:", error);
        } finally {
            isLoading = false;
        }
    }

    function handleGridRowClick(project) {
        if (project.isNew) 
            return;

        currentProject = {
            prj_id      : project.PRJ_ID,
            prj_nm      : project.PRJ_NM,
            enc_val     : project.ENC_VAL,
            tcode       : project.TCODE,
            proto_col   : project.PROTO_COL,
            compr_yn    : project.COMPR_YN,
            fail_cond   : project.FAIL_COND,
            diffc_cond  : project.DIFFC_COND,
            virtual_col1: project.VIRT_COL1,
            virtual_col2: project.VIRT_COL2,
            virtual_type1: project.VIRT_TYPE1,
            virtual_type2: project.VIRT_TYPE2,
            virtual_expr1: project.VIRT_EXPR1,
            virtual_expr2: project.VIRT_EXPR2,
        };
    }

    function resetForm() {
        currentProject = {
            prj_id          : "",
            prj_nm          : "",
            enc_val         : "",
            tcode           : "",
            proto_col       : "",
            compr_yn        : "",
            fail_cond       : "",
            diffc_cond      : "",
            virtual_col1    : "",
            virtual_col2    : "",
            virtual_type1   : "varchar(100)",
            virtual_type2   : "varchar(100)",
            virtual_expr1   : "varchar(100) cast('' as char(100)) charset utf8mb4",
            virtual_expr2   : "varchar(100) cast('' as char(100)) charset utf8mb4",
        };
    }

    // 상단 프로젝트 조회 버튼
    async function handleTopSearch() {
        searchKeyword = "";

        if (!selectedProject || selectedProject === "") {
            resetForm();
            await fetchBusinessItems();
        }

        if (selectedProject && selectedProject !== "") {
            const found = projects.find((p) => p.PRJ_ID == selectedProject);

            if (found) {
                handleGridRowClick(found);
            }
        }

        await fetchBusinessItems(); // Refresh grid list
    }

    // 상단 프로젝트 저장 버튼
    async function handleTopSave() {
        if (!currentProject.prj_nm) {
            alert("프로젝트명은 필수입니다.");
            return;
        }

        if (!confirm("프로젝트 정보를 저장하시겠습니까?")) 
            return;

        try {
            const res = await fetch(`${$rooturl}/project/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProject),
            });

            if (res.ok) {
                alert("저장 되었습니다.");

                await loadMetadata();
                await handleTopSearch(); 
            } else {
                const text = await res.text();

                alert(`저장 실패: ${text}`);
                // alert(JSON.stringify(currentProject));
            }
        } catch (error) {
            console.error(error);

            alert("저장 중 오류가 발생했습니다.");
        }
    }

    // 상단 가상컬럼1 적용 버튼
    async function handleTopapp1() {
        if (!confirm("가상컬럼1 을 수정하시겠습니까?")) 
            return;

        try {
            const res = await fetch(`${$rooturl}/project/saveapp1`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProject),
            });

            if (res.ok) {
                alert("가상컬럼1이 수정 되었습니다.");

                await loadMetadata();
                await handleTopSearch(); 
            } else {
                const text = await res.text();

                alert(`가상컬럼1 수정 실패: ${text}`);
                // alert(JSON.stringify(currentProject));
            }
        } catch (error) {
            console.error(error);

            alert("가상컬럼1 수정 중 오류가 발생했습니다.");
        }
    }

    // 상단 가상컬럼1 적용 버튼
    async function handleTopapp2() {
        if (!confirm("가상컬럼2 을 수정하시겠습니까?")) 
            return;

        try {
            const res = await fetch(`${$rooturl}/project/saveapp2`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProject),
            });

            if (res.ok) {
                alert("가상컬럼2가 수정 되었습니다.");

                await loadMetadata();
                await handleTopSearch(); 
            } else {
                const text = await res.text();

                alert(`가상컬럼2 수정 실패: ${text}`);
                // alert(JSON.stringify(currentProject));
            }
        } catch (error) {
            console.error(error);

            alert("가상컬럼2 생성 중 오류가 발생했습니다.");
        }
    }

    // 하단 grid check box 전체 체크
    function toggleAll(event) {
        if (event.target.checked) {
            selectedIds = new Set(
                businessItems.map((p) => p.APP_ID || p._tempId),
            );
        } else {
            selectedIds = new Set();
        }
        selectedIds = selectedIds;
    }

    // 하단 grid check box 단건 체크
    function toggleOne(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        selectedIds = selectedIds;
    }

    // 하단 grid 추가
    async function handleGridAdd() {
        const newRow = {
            state      : "I",
            APP_ID      : "",
            APPNM       : "",
            MAIN_MGR    : "",
            GUBUN       : 1,
            SCNT        : "",
            HOST_IP     : "",
            HOST_PORT   : 0,
            isNew       : true,
            _tempId     : `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        businessItems = [newRow, ...businessItems];
        currentPage = 1;

        selectedIds.add(newRow._tempId);
        selectedIds = selectedIds;
    }

    // 하단 grid 삭제
    async function handleGridDelete() {
        if (selectedIds.size === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`))
            return;

        try {
            const savedIds = [];
            const unsavedIds = [];

            for (let id of selectedIds) {
                if (String(id).startsWith("new_")) {
                    unsavedIds.push(id);
                } else {
                    savedIds.push(id);
                }
            }

            for (let id of savedIds) {
                await fetch(`${$rooturl}/project/business/delete/${id}`, {
                    method: "DELETE",
                });
            }

            businessItems = businessItems.filter(
                (item) => !selectedIds.has(item.APP_ID) && !selectedIds.has(item._tempId),
            );

            alert("삭제 되었습니다.");

            selectedIds = new Set();
        } catch (e) {
            console.error(e);
            alert(" 삭제 중 오류 발생하였습니다!!! \n 관리자에게 문의하시기 바랍니다.");
        }
    }

    // 하단 grid 저장
    async function handleGridSave() {
        if (!confirm("업무 정보 변경사항을 저장하시겠습니까?")) return;

        try {
            for (let item of businessItems) {

                if (!item.APP_ID) {
                    alert("업무코드는 필수 입력입니다. 업무코드를 입력하세요.");
                    return;
                } else {
                    const payload = {
                        state       : item.state,
                        app_id      : item.APP_ID,
                        appnm       : item.APPNM,
                        main_mgr    : item.MAIN_MGR,
                        gubun       : item.GUBUN || 1,
                        scnt        : item.SCNT,
                        host_ip     : item.HOST_IP,
                        host_port   : item.HOST_PORT,
                    };

                    await fetch(`${$rooturl}/project/business/save`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                }
            }

            alert("저장을 완료하였습니다.");
            selectedIds = new Set();
        } catch (error) {
            console.error(error);
            alert(" 저장 중 오류 발생하였습니다!!! \n 관리자에게 문의하시기 바랍니다.");
        }
    }

    // 하단 grid 조회
    async function handleGridSearch() {
        await fetchBusinessItems();
    }

</script>

<div class="container mx-auto p-4 lg:p-8 bg-gray-50 flex flex-col h-[calc(100vh-4.8rem)] gap-4">
    <div class="bg-white shadow border border-gray-300 p-4 mb-0">
        <div class="flex justify-end mb-2 space-x-2">
            <div class="flex space-x-2 mr-auto items-start">
                <h2 class="text-lg font-bold text-gray-700 px-5">프로젝트/업무</h2>
            </div>
            <div class="items-center hidden">
                <span class="w-32 mr-1 text-sm font-bold text-right bg-gray-200 px-2 py-1 border border-gray-300">프로젝트</span>
                <select on:change={handleTopSelectChange} bind:value={selectedProject} 
                        class="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]">
                    {#each projects as project}
                        <option value={project.PRJ_ID}>{project.PRJ_NM}</option>
                    {/each}
                </select>
            </div>
            <button on:click={handleTopSave}
                class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded transition">
                저장
            </button>
        </div>
        <div class="py-2"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <input type="text" class="flex-1 border border-gray-300 py-1 px-2 bg-gray-100 text-gray-500 hidden" placeholder="프로젝트 ID 자동생성" disabled bind:value={currentProject.prj_id}/>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">프로젝트명</label>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2" placeholder="프로젝트명 입력" bind:value={currentProject.prj_nm} />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">기본 인코딩</label>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2" placeholder="기본인코딩(예:MS949) 입력" bind:value={currentProject.enc_val} />
            </div>
            <div class="items-center space-x-1 hidden">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">테스트 ID</label>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2" placeholder="테스트 ID 입력" bind:value={currentProject.tcode} />
            </div>
            <!-- Row 2 -->
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">프로토콜</label>
                <select class="flex-1 border border-gray-300 py-1 px-2" bind:value={currentProject.proto_col}>
                    <option value="" disabled selected>프로토콜을 선택하세요</option>                    
                    <option value="0">0:TCP</option>
                    <option value="1">1:HTTP</option>
                    <option value="2">2:UDP</option>
                    <option value="3">3:TMAX</option>
                </select>
            </div>
            <div class="items-center space-x-1 hidden">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">압축여부</label>
                <select class="flex-1 border border-gray-300 py-1 px-2" bind:value={currentProject.compr_yn}>
                    <option value="" disabled selected>옵션을 선택하세요</option>                    
                    <option value="0">0:압축아님</option>
                    <option value="1">1:압축</option>
                </select>
            </div>
        </div>
        <div class="py-1"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">실패조건</label>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="실패조건 (예: if(rcode > 399, 2, if(rcode > 199, 1, 0))) 입력"
                    bind:value="{currentProject.fail_cond}"
                />
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">원본차이조건</label>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2"
                    placeholder="원본차이조건 (예: AND (a.rcode <> b.rcode or a.rcode > 399 or b.rcode > 399)) 입력"
                    bind:value={currentProject.diffc_cond}/>
            </div>
        </div>
        <div class="py-3"></div>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-x-4 gap-y-2 text-sm">
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">가상컬럼1</label>
                <input type="text" class="border border-gray-300 py-1 px-2" placeholder="가상컬럼1 입력" bind:value={currentProject.virtual_col1}/>
                <input type="text" class="border border-gray-300 py-1 px-2" placeholder="varchar(100)" bind:value={currentProject.virtual_type1}/>
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2"
                        placeholder="varchar(100) cast('' as char(100)) charset utf8mb4"
                        bind:value={currentProject.virtual_expr1}/>
                <button on:click={handleTopapp1}
                    class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded transition">
                    적용
                </button>
            </div>
            <div class="flex items-center space-x-1">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="w-32 font-bold bg-gray-100 py-1 px-2 border border-gray-300 block text-right">가상컬럼2</label>
                <input type="text" class="border border-gray-300 py-1 px-2" placeholder="가상컬럼2 입력" bind:value={currentProject.virtual_col2}/>
                <input type="text" class="border border-gray-300 py-1 px-2" placeholder="varchar(100)" bind:value={currentProject.virtual_type2} />
                <input type="text" class="flex-1 border border-gray-300 py-1 px-2"
                        placeholder="varchar(100) cast('' as char(100)) charset utf8mb4"
                        bind:value={currentProject.virtual_expr2}
                />
                <button on:click={handleTopapp2}
                    class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded transition">
                    적용
                </button>
            </div>
        </div>
    </div>
    <div class="bg-white p-2 shadow border border-gray-300">
        <div class="flex justify-between items-center mb-4">
            <div class="space-x-2">
                <h2 class="text-lg font-bold text-gray-700 px-5">업무</h2>
            </div>
            <div class="flex space-x-2 items-center">
                <select class="border border-gray-300 rounded px-2 py-1 text-sm" bind:value={searchType}>
                    <option value="all">전체</option>
                    <option value="APPNM">업무명</option>
                    <option value="MAIN_MGR">담당자</option>
                    <option value="HOST_IP">HOST IP</option>
                    <option value="HOST_PORT">PORT</option>
                </select>
                <input type="text" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="필드명 입력" bind:value={searchKeyword}/>
                <button on:click={handleGridSearch} class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded">
                    조회
                </button>
                <button on:click={handleGridAdd} class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded">
                    추가
                </button>
                <button on:click={handleGridDelete} class="bg-white hover:bg-gray-100 text-red-600 border border-red-600 px-3 py-1 text-sm rounded">
                    삭제
                </button>
                <button on:click={handleGridSave} class="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-3 py-1 text-sm rounded">
                    저장
                </button>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-300 text-xs text-center whitespace-nowrap">
                <thead class="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                        <th class="border border-gray-300 px-2 py-1 w-8"><input type="checkbox" on:change={toggleAll} /></th>
                        <th class="border border-gray-300 px-2 py-1 hidden" style="width: 150px; min-width: 150px;">상태</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 150px; min-width: 150px;">업무코드</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 150px; min-width: 150px;">업무명</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 150px; min-width: 150px;">주담당자</th>
                        <th class="border border-gray-300 px-2 py-1 hidden" style="width: 100px; min-width: 100px;">구분</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 100px; min-width: 100px;">대상서비스수</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 150px; min-width: 150px;">Host IP</th>
                        <th class="border border-gray-300 px-2 py-1" style="width: 100px; min-width: 100px;">Port</th>
                    </tr>
                </thead>
                <tbody class="bg-whit">
                    {#each paginatedList as item}
                        <tr class="hover:bg-blue-50">
                            <td class="border border-gray-300 px-2 py-1 text-center">
                                <input type="checkbox" checked={selectedIds.has(item.APP_ID || item._tempId)} on:change={() => toggleOne(item.APP_ID || item._tempId)}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1 disabled:opacity-50 hidden">
                                {item.state}
                            </td>
                            <td class="border border-gray-300 px-2 py-1 disabled:opacity-50">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-center" bind:value={item.APP_ID} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-center" bind:value={item.APPNM} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-center" bind:value={item.MAIN_MGR} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1 hidden">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-right" bind:value={item.GUBUN} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-right" bind:value={item.SCNT} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-center" bind:value={item.HOST_IP} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                            <td class="border border-gray-300 px-2 py-1">
                                <input type="text" class="w-full border-none bg-transparent focus:ring-1 text-center" bind:value={item.HOST_PORT} on:input={() => {toggleOne(item.APP_ID || item._tempId)}}/>
                            </td>
                        </tr>
                    {/each}
                    {#if businessItems.length === 0}
                        <tr>
                            <td colspan="16" class="text-center py-4 border border-gray-300">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
        {#if totalPages > 1}
            <div class="flex justify-center items-center mt-4 space-x-1">
                <button class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                        on:click={() => goToPage(1)} disabled={currentPage === 1} >
                    처음
                </button>
                <button class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                        on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1} >
                    이전
                </button>

                {#each Array(Math.min(5, totalPages)) as _, i}
                    {@const pageNum = totalPages <= 5 ? i + 1 : Math.min(Math.max(currentPage - 2, 1),totalPages - 4,) + i}
                    <button class="px-3 py-1 border border-gray-300 rounded text-sm {currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}"
                            on:click={() => goToPage(pageNum)} >
                        {pageNum}
                    </button>
                {/each}

                <button class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                        on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} >
                    다음
                </button>
                <button class="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                        on:click={() => goToPage(totalPages)} disabled={currentPage === totalPages} >
                    마지막
                </button>

                <span class="ml-4 text-sm text-gray-600"> 
                    Page {currentPage} of {totalPages} (Total {businessItems.length} items)
                </span>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Add any custom styles here if needed */
</style>
