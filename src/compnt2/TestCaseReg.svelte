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

    // 상단 선택된 테스트케이스
    let selectedTestCase = "";
    // 상단 검색조건
    let searchTestCaseKeyword = "";
    // 상단 그리드
    let messages = [];

    // 조회건수
    let cnt = 10;
    const MIN_VALUE = 0;
    const MAX_VALUE = 1000;
    // 하단 좌측 검색조건
    let searchCountKeyword = cnt;
    // 하단 좌측 전문
    let selectedMessage = "";
    let selectMessages = [];
    // 하단 좌측 전문필드
    let selectedMessageField01 = "";
    let selectMessagesField01 = [];
    let searchField01Keyword = "";
    let selectedMessageField02 = "";
    let selectMessagesField02 = [];
    let searchField02Keyword = "";
    let selectedMessageField03 = "";
    let selectMessagesField03 = [];
    let searchField03Keyword = "";
    let selectedMessageField04 = "";
    let selectMessagesField04 = [];
    let searchField04Keyword = "";
    // 하단 좌측 그리드
    let dataList = [];

    // 하단 우측 검색조건
    let searchDataKeyword = "";
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
    // 상단 프로젝트 목록 조회 (최초 상단 프로젝트 조회)
    async function searchProjects() {
        try {
            const projectRes = await fetch($rooturl + "/common/project/list");
            projects = await projectRes.json();
        } catch (error) {
            console.error("프로젝트 목록 로딩 실패:", error);
        }
    }

    // 상단 업무 목록 조회 (최초 상단 업무목록 조회)
    async function searchJobs() {
        selectedJob = "";

        // 업무 목록 데이터
        jobs = [];

        // 상단 선택된 테스트케이스
        selectedTestCase = "";
        // 상단 검색조건
        searchTestCaseKeyword = "";
        // 상단 그리드
        messages = [];

        // 하단 좌측 조회건수 검색조건
        searchCountKeyword = cnt;
        // 하단 좌측 전문 검색조건
        selectedMessage = "";
        selectMessages = [];
        // 하단 좌측 전문필드 검색조건
        selectedMessageField01 = "";
        selectMessagesField01 = [];
        searchField01Keyword = "";
        selectedMessageField02 = "";
        selectMessagesField02 = [];
        searchField02Keyword = "";
        selectedMessageField03 = "";
        selectMessagesField03 = [];
        searchField03Keyword = "";
        selectedMessageField04 = "";
        selectMessagesField04 = [];
        searchField04Keyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchDataKeyword = "";
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 상단 테스트케이스 목록 조회
    async function searchMessages() {
        // 하단 좌측 조회건수
        searchCountKeyword = cnt;
        // 하단 좌측 전문
        selectedMessage = "";
        selectMessages = [];
        // 하단 좌측 전문필드 4개 순서대로
        selectedMessageField01 = "";
        selectMessagesField01 = [];
        searchField01Keyword = "";
        selectedMessageField02 = "";
        selectMessagesField02 = [];
        searchField02Keyword = "";
        selectedMessageField03 = "";
        selectMessagesField03 = [];
        searchField03Keyword = "";
        selectedMessageField04 = "";
        selectMessagesField04 = [];
        searchField04Keyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchDataKeyword = "";
        // 하단 우측 그리드
        fieldList = [];

        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        if (searchTestCaseKeyword) {
            queryParams += `&search_keyword=${searchTestCaseKeyword}`;
        }

        if (!selectedJob || selectedJob === "") {
            // 상단 선택된 테스트케이스
            selectedTestCase = "";
            // 상단 검색조건
            searchTestCaseKeyword = "";
            // 상단 그리드
            messages = [];

            // 하단 좌측 조회건수
            searchCountKeyword = cnt;
            // 하단 좌측 전문
            selectedMessage = "";
            selectMessages = [];
            // 하단 좌측 전문필드 4개 순서대로
            selectedMessageField01 = "";
            selectMessagesField01 = [];
            searchField01Keyword = "";
            selectedMessageField02 = "";
            selectMessagesField02 = [];
            searchField02Keyword = "";
            selectedMessageField03 = "";
            selectMessagesField03 = [];
            searchField03Keyword = "";
            selectedMessageField04 = "";
            selectMessagesField04 = [];
            searchField04Keyword = "";
            // 하단 좌측 그리드
            dataList = [];

            // 하단 우측 검색조건
            searchDataKeyword = "";
            // 하단 우측 그리드
            fieldList = [];

            alert("업무를 선택해 주세요.");

            return;
        }

        try {
            const res = await fetch(
                $rooturl + "/testCase/message/list" + queryParams,
            );

            messages = await res.json();

            await searchMessagesList();
            // let msgfld = "";
            // await searchFieldsList(msgfld);
        } catch (error) {
            console.error("테스트케이스 목록 조회 실패:", error);
        }
    }

    // 상단 테스트케이스 조회자료 선택
    async function jobSelect(msg) {
        selectedTestCase = msg;

        // 상단 검색조건
        searchTestCaseKeyword = "";

        // 하단 좌측 조회건수
        searchCountKeyword = cnt;
        // 하단 좌측 전문
        selectedMessage = "";
        selectMessages = [];
        // 하단 좌측 전문필드 4개 순서대로
        selectedMessageField01 = "";
        selectMessagesField01 = [];
        searchField01Keyword = "";
        selectedMessageField02 = "";
        selectMessagesField02 = [];
        searchField02Keyword = "";
        selectedMessageField03 = "";
        selectMessagesField03 = [];
        searchField03Keyword = "";
        selectedMessageField04 = "";
        selectMessagesField04 = [];
        searchField04Keyword = "";
        // 하단 좌측 그리드
        dataList = [];

        // 하단 우측 검색조건
        searchDataKeyword = "";
        // 하단 우측 그리드
        fieldList = [];

        await searchMessagesList();
        // let msgfld = "";
        // await searchFieldsList(msgfld);
        await searchFieldsData(msg);
    }
    ///////////////////////////////////////////////
    // 상단 테스트케이스 추가
    function handleMessageAdd() {
        if (!selectedJob) {
            alert("업무를 선택해주세요.");
            return;
        }

        if (!Array.isArray(messages)) {
            messages = [];
        }

        const newMessages = {
            APP_ID: selectedJob,
            TC_ID: "",
            TC_NAME: "",
            TC_GUBUN: "",
            TC_WRITER: "",
            TC_WRTDT: "",
            TC_BUSMGR: "",
            TC_ITMGR: "",
            TC_SERVER: "",
            TC_PORT: "",
            type: "",
            endDate: "",
            tdir: "",
            encval: "",
            pro: "",
            svc_cnt: 0,
            fsvc_cnt: 0,
            data_cnt: 0,
            scnt: 0,
            fcnt: 0,
            cmpCode: "",
            tenv: "",
            isChecked: true,
            status: "N", // New
        };

        messages = [...messages, newMessages];
    }

    // 상단 테스트케이스 삭제
    async function handleMessageDelete() {
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("삭제할 테스트케이스를 선택해주세요.");
            return;
        }

        if (!confirm("선택한 테스트케이스를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testCase/message/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count} 건의 테스트케이스가 삭제되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("테스트케이스 삭제 실패:", error);
            alert("테스트케이스 삭제 중 오류가 발생했습니다.");
        }
    }

    // 상단 테스트케이스 저장
    async function handleMessageSave() {
        const checkedMessages = messages.filter((m) => m.isChecked);

        if (checkedMessages.length === 0) {
            alert("저장할 테스트케이스를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        messages.forEach((m, index) => {
            if (m.isChecked) {
                const hasJob = jobs.some((j) => j.APP_ID == m.APP_ID);

                if (!m.APP_ID || !hasJob || !m.TC_ID) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 테스트케이스ID는 필수 입력입니다.\n테스트케이스ID를 입력하세요.`,
            );

            return;
        }

        // Add confirmation dialog
        if (!confirm("선택한 테스트케이스를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testCase/message/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedMessages),
            });

            const result = await res.json();

            alert(`${result.count} 건의 테스트케이스가 저장되었습니다.`);

            await searchMessages(); // Reload to get generated IDs and clean status
        } catch (error) {
            console.error("테스트케이스 저장 실패:", error);
            alert("테스트케이스 저장 중 오류가 발생했습니다.");
        }
    }

    // 상단 테스트케이스 엑셀 업로드
    function handleExcelUpload() {
        messageListFileInput.click();
    }

    // 상단 테스트케이스 엑셀 업로드
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
                APP_ID: selectedJob,
                TC_ID: "", // 업로드 시 PK이므로 항상 비워둠
                TC_NAME: row["테스트케이스명"] || "",
                TC_GUBUN: row["테스트구분"] || "",
                TC_WRITER: row["작성자"] || "",
                TC_WRTDT: row["작성일자"] || "",
                TC_BUSMGR: row["업무담당자"] || "",
                TC_ITMGR: row["IT담당자"] || "",
                TC_SERVER: row["대상서버"] || "",
                TC_PORT: row["대상포트"] || 0,
                type: row["type"] || "",
                endDate: row["테스트종료일"] || "",
                tdir: row["tdir"] || "",
                encval: row["encval"] || "",
                pro: row["pro"] || "",
                svc_cnt: row["svc_cnt"] || 0,
                fsvc_cnt: row["fsvc_cnt"] || 0,
                data_cnt: row["data_cnt"] || 0,
                scnt: row["scnt"] || 0,
                fcnt: row["fcnt"] || 0,
                cmpCode: row["주비교테스트"] || "",
                tenv: row["환경파일위치"] || "",
                isChecked: true,
                status: "N", // New
            }));

            messages = [...messages, ...newMessages];

            alert(`${newMessages.length}건의 테스트케이스가 업로드되었습니다.`);

            messageListFileInput.value = ""; // Reset input
        };

        reader.readAsArrayBuffer(file);
    }

    // 상단 테스트케이스 엑셀 다운로드
    function handleExcelDownload() {
        const ws = utils.json_to_sheet(
            messages.map((msg) => ({
                업무ID: msg.APP_ID,
                업무명: msg.APPNM || "",
                테스트케이스ID: msg.TC_ID,
                테스트케이스명: msg.TC_NAME || "",
                테스트구분: msg.TC_GUBUN,
                작성자: msg.TC_WRITER || "",
                작성일자: msg.TC_WRTDT,
                업무담당자: msg.TC_BUSMGR || "",
                IT담당자: msg.TC_ITMGR || "",
                대상서버: msg.TC_SERVER || "",
                대상포트: msg.TC_PORT || 0,
                type: msg.type,
                테스트종료일: msg.endDate,
                tdir: msg.tdir,
                encval: msg.encval,
                pro: msg.pro,
                svc_cnt: msg.svc_cnt || 0,
                fsvc_cnt: msg.fsvc_cnt || 0,
                data_cnt: msg.data_cnt || 0,
                scnt: msg.scnt || 0,
                fcnt: msg.fcnt || 0,
                주비교테스트: msg.cmpCode,
                환경파일위치: msg.tenv,
            })),
        );

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "테스트케이스");

        writeFile(wb, "테스트케이스.xlsx");
    }
    ///////////////////////////////////////////////
    // 상단 테스트케이스 전문 변경 (상태 업데이트)
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

    // 싱단 테스트케이스 전체 선택/해제
    function toggleAllMessages(e) {
        const checked = e.target.checked;
        messages = messages.map((f) => ({ ...f, isChecked: checked }));
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 전문목록 드롭박스 리스트 조회
    async function searchMessagesList() {
        let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";

        try {
            const res = await fetch(
                $rooturl + "/jobs/message/list" + queryParams,
            );

            selectMessages = await res.json();
        } catch (error) {
            console.error("전문목록 로딩 실패:", error);
        }
    }

    // 하단 좌측 전문필드 드롭박스 리스트 조회
    async function searchFieldsList(seletmsg) {
        let selmsg = JSON.stringify(selectedMessage)
            .replace('"', "")
            .replace('"', "");

        if (!selmsg) return;

        try {
            let queryParams = selectedJob ? `?app_id=${selectedJob}` : "";
            queryParams += selmsg ? `&msg_id=${selmsg}` : "";

            // Add search keyword
            if (searchField01Keyword) {
                queryParams += `&search_keyword=${searchField01Keyword}`;
            }

            const res = await fetch(
                $rooturl + "/jobs/field/listMess" + queryParams,
            );

            selectMessagesField01 = await res.json();
            selectMessagesField02 = selectMessagesField01;
            selectMessagesField03 = selectMessagesField01;
            selectMessagesField04 = selectMessagesField01;
        } catch (error) {
            console.error("전문필드목록 로딩 실패:", error);

            searchField01Keyword = "";
            searchField02Keyword = "";
            searchField03Keyword = "";
            searchField04Keyword = "";

            selectedMessageField01 = "";
            selectedMessageField02 = "";
            selectedMessageField03 = "";
            selectedMessageField04 = "";

            selectMessagesField01 = [];
            selectMessagesField02 = [];
            selectMessagesField03 = [];
            selectMessagesField04 = [];

            dataList = [];
        }
    }
    ///////////////////////////////////////////////
    // 하단 검색조건 (전문 드롭박스 선택)
    async function messagesSearch(msg) {
        searchField01Keyword = "";
        searchField02Keyword = "";
        searchField03Keyword = "";
        searchField04Keyword = "";

        selectedMessageField01 = "";
        selectedMessageField02 = "";
        selectedMessageField03 = "";
        selectedMessageField04 = "";

        selectMessagesField01 = [];
        selectMessagesField02 = [];
        selectMessagesField03 = [];
        selectMessagesField04 = [];

        dataList = [];

        await searchFieldsList(msg);
    }

    // 하단 좌측 데이터 조회
    async function searchData(msg) {
        dataList = [];

        if (!msg.TC_ID || msg.TC_ID === "") {
            // 하단 좌측 조회건수
            searchCountKeyword = cnt;
            // 하단 좌측 전문
            selectedMessage = "";
            selectMessages = [];
            // 하단 좌측 전문필드 4개 순서대로
            selectedMessageField01 = "";
            selectMessagesField01 = [];
            searchField01Keyword = "";
            selectedMessageField02 = "";
            selectMessagesField02 = [];
            searchField02Keyword = "";
            selectedMessageField03 = "";
            selectMessagesField03 = [];
            searchField03Keyword = "";
            selectedMessageField04 = "";
            selectMessagesField04 = [];
            searchField04Keyword = "";
            // 하단 좌측 그리드
            dataList = [];

            return;
        }

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.TC_ID ? `&tc_id=${msg.TC_ID}` : "";

            if (searchCountKeyword) {
                queryParams += `&search_CountKeyword=${searchCountKeyword}`;
            }

            if (selectedMessage) {
                queryParams += `&search_selectedMessage=${selectedMessage}`;
            }

            if (selectedMessageField01) {
                queryParams += `&search_selectedField01=${selectedMessageField01}`;
            }

            if (selectedMessageField02) {
                queryParams += `&search_selectedField02=${selectedMessageField02}`;
            }

            if (selectedMessageField03) {
                queryParams += `&search_selectedField03=${selectedMessageField03}`;
            }

            if (selectedMessageField04) {
                queryParams += `&search_selectedField04=${selectedMessageField04}`;
            }

            if (searchField01Keyword) {
                queryParams += `&search_Field01Keyword=${searchField01Keyword}`;
            }

            if (searchField02Keyword) {
                queryParams += `&search_Field02Keyword=${searchField02Keyword}`;
            }

            if (searchField03Keyword) {
                queryParams += `&search_Field03Keyword=${searchField03Keyword}`;
            }

            if (searchField04Keyword) {
                queryParams += `&search_Field04Keyword=${searchField04Keyword}`;
            }

            const res = await fetch(
                `${$rooturl}/testCase/data/msgdatalist` + queryParams,
            );

            const data = await res.json();
            dataList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            dataList = [];
        }
    }

    // 하단 좌측 데이터 검색어 입력 후 조회
    function handleDataSearchTrigger() {
        if (selectedTestCase) {
            searchData(selectedTestCase);
        } else {
            alert("상단 테스트케이스를 선택해주세요.");
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

    // 반응형 선언: 값이 바뀔 때마다 범위를 체크하여 강제로 조정합니다.
    $: if (searchCountKeyword > MAX_VALUE) {
        searchCountKeyword = MAX_VALUE;
    } else if (searchCountKeyword < MIN_VALUE && searchCountKeyword !== null) {
        // 입력 중 비어있는 상태를 허용하기 위해 null 체크를 추가할 수 있습니다.
        searchCountKeyword = MIN_VALUE;
    }
    ///////////////////////////////////////////////
    // 하단 좌측 전문필드01 선택
    async function msgField01Search() {
        if (!selectedMessageField01) {
            searchField01Keyword = ""; // 선택이 해제되면 검색어도 초기화
        }
    }

    // 하단 좌측 전문필드02 선택
    async function msgField02Search() {
        if (!selectedMessageField02) {
            searchField02Keyword = ""; // 선택이 해제되면 검색어도 초기화
        }
    }

    // 하단 좌측 전문필드03 선택
    async function msgField03Search() {
        if (!selectedMessageField03) {
            searchField03Keyword = ""; // 선택이 해제되면 검색어도 초기화
        }
    }

    // 하단 좌측 전문필드04 선택
    async function msgField04Search() {
        if (!selectedMessageField04) {
            searchField04Keyword = ""; // 선택이 해제되면 검색어도 초기화
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 좌측 전문데이터 조건전송 버튼
    function handleNoChedkedSave() {
        if (selectedTestCase) {
            noChedkedSave(selectedTestCase);
        } else {
            alert("상단 테스트케이스를 선택해주세요.");
        }
    }

    // 하단 좌측 전문데이터 조건전송 버튼
    async function noChedkedSave(msg) {
        dataList = [];

        if (!msg.TC_ID || msg.TC_ID === "") {
            // 하단 좌측 조회건수
            searchCountKeyword = cnt;
            // 하단 좌측 전문
            selectedMessage = "";
            selectMessages = [];
            // 하단 좌측 전문필드 4개 순서대로
            selectedMessageField01 = "";
            selectMessagesField01 = [];
            searchField01Keyword = "";
            selectedMessageField02 = "";
            selectMessagesField02 = [];
            searchField02Keyword = "";
            selectedMessageField03 = "";
            selectMessagesField03 = [];
            searchField03Keyword = "";
            selectedMessageField04 = "";
            selectMessagesField04 = [];
            searchField04Keyword = "";
            // 하단 좌측 그리드
            dataList = [];

            return;
        }

        if (!confirm("전문 데이터 조건전송을 하시겠습니까?")) {
            return;
        }

        try {
            let queryParams = msg.APP_ID ? `?app_id=${msg.APP_ID}` : "";
            queryParams += msg.TC_ID ? `&tc_id=${msg.TC_ID}` : "";

            if (searchCountKeyword) {
                queryParams += `&search_CountKeyword=${searchCountKeyword}`;
            }

            if (selectedMessage) {
                queryParams += `&search_selectedMessage=${selectedMessage}`;
            }

            if (selectedMessageField01) {
                queryParams += `&search_selectedField01=${selectedMessageField01}`;
            }

            if (selectedMessageField02) {
                queryParams += `&search_selectedField02=${selectedMessageField02}`;
            }

            if (selectedMessageField03) {
                queryParams += `&search_selectedField03=${selectedMessageField03}`;
            }

            if (selectedMessageField04) {
                queryParams += `&search_selectedField04=${selectedMessageField04}`;
            }

            if (searchField01Keyword) {
                queryParams += `&search_Field01Keyword=${searchField01Keyword}`;
            }

            if (searchField02Keyword) {
                queryParams += `&search_Field02Keyword=${searchField02Keyword}`;
            }

            if (searchField03Keyword) {
                queryParams += `&search_Field03Keyword=${searchField03Keyword}`;
            }

            if (searchField04Keyword) {
                queryParams += `&search_Field04Keyword=${searchField04Keyword}`;
            }

            const res = await fetch(
                `${$rooturl}/testCase/data/oochedkedsave` + queryParams,
            );
            const result = await res.json();

            alert(`전문데이터의 조건전송이 완료되었습니다.`);

            await jobSelect(selectedTestCase);
        } catch (error) {
            console.error("전문데이터 저장 실패:", error);
            dataList = [];

            alert("전문데이터 저장 중 오류가 발생했습니다.");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 하단 중간(▶) 테스트케이스데이터 저장
    async function handleMsgDatasSave() {
        const checkedDataList = dataList.filter((m) => m.isChecked);

        if (checkedDataList.length === 0) {
            alert("저장할 전문 데이터를 선택해주세요.");
            return;
        }

        // 유효성 검사 (행 번호 포함)
        const errorRows = [];

        dataList.forEach((m, index) => {
            if (m.isChecked) {
                const hasJob = jobs.some((j) => j.APP_ID == m.APP_ID);

                if (!m.APP_ID || !hasJob) {
                    errorRows.push(index + 1); // 1-based index
                }
            }
        });

        if (errorRows.length > 0) {
            alert(
                `${errorRows.join(", ")} 행에 업무명이 없습니다.\n업무ID를 확인해주세요.`,
            );
            return;
        }

        if (!confirm("선택한 전문데이터를 저장하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testCase/msgDatas/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedDataList),
            });

            const result = await res.json();

            alert(`${result.count} 건의 전문데이터가 저장되었습니다.`);

            await jobSelect(selectedTestCase);
        } catch (error) {
            console.error("전문데이터 저장 실패:", error);
            alert("전문데이터 저장 중 오류가 발생했습니다.");
        }
    }

    // 하단 중간(◀) 테스트케이스데이터 삭제
    async function handleMsgDatasDelete() {
        const checkedFieldList = fieldList.filter((m) => m.isChecked);

        if (checkedFieldList.length === 0) {
            alert("삭제할 테스트케이스 데이터를 선택해주세요.");
            return;
        }

        if (!confirm("선택한 테스트케이스 데이터를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch($rooturl + "/testCase/msgDatas/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkedFieldList),
            });

            const result = await res.json();

            alert(`${result.count} 건의 테스트케이스 데이터가 삭제되었습니다.`);

            await jobSelect(selectedTestCase);
        } catch (error) {
            console.error("테스트케이스 데이터 삭제 실패:", error);
            alert("테스트케이스 데이터 삭제 중 오류가 발생했습니다.");
        }
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

            if (searchDataKeyword) {
                queryParams += `&search_keyword=${searchDataKeyword}`;
            }

            const res = await fetch(
                $rooturl + "/testCase/field/listdata" + queryParams,
            );

            const data = await res.json();
            fieldList = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("테스트케이스 데이터 조회 실패:", error);
            fieldList = [];
        }
    }

    // 하단 우측  테스트케이스 데이터 검색어 입력 후 조회
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
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
            <h2 class="text-xl font-bold text-gray-700">테스트케이스 등록</h2>
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
                    <button on:click={handleMessageDelete} class="btn-delete">
                        삭제
                    </button>
                    <button on:click={handleMessageSave}> 저장 </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button on:click={handleExcelUpload} class="btn-excel">
                        엑셀 업로드
                    </button>
                    <button on:click={handleExcelDownload} class="btn-excel">
                        엑셀 다운로드
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 overflow-auto">
            <table>
                <thead>
                    <tr>
                        <th class="w-8">
                            <input
                                type="checkbox"
                                bind:checked={isAllTestCaseChecked}
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
                            <td class="text-center">
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
                            <td class="text-center hidden">
                                <input
                                    type="text"
                                    class="w-full bg-transparent text-center focus:outline-none"
                                    value={msg.APP_ID}
                                    readonly={msg.status !== ""}
                                    title={msg.APP_ID}
                                    on:input={(e) => {
                                        msg.APP_ID = e.currentTarget.value;
                                        handleMessageChange(msg);
                                    }}
                                />
                            </td>
                            <td class="text-center hidden">
                                {jobs.find((p) => p.APP_ID == msg.APP_ID)
                                    ?.APPNM || ""}
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_ID}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-left"
                                contenteditable="true"
                                bind:textContent={msg.TC_NAME}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td class="text-center p-0">
                                <select
                                    bind:value={msg.TC_GUBUN}
                                    on:change={() => {
                                        handleMessageChange(msg);
                                        msg.isChecked = true;
                                    }}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]"
                                >
                                    <option value="">테스트구분 선택</option>
                                    <option value="0">단위테스트</option>
                                    <option value="1">통합테스트</option>
                                    <option value="2">성능테스트</option>
                                </select>
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_WRITER}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_WRTDT}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_BUSMGR}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_ITMGR}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_SERVER}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.TC_PORT}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td class="text-center p-0">
                                <select
                                    bind:value={msg.type}
                                    on:change={() => {
                                        handleMessageChange(msg);
                                        msg.isChecked = true;
                                    }}
                                    class="border border-gray-300 rounded-sm px-2 py-0 text-sm focus:outline-none focus:border-blue-500 min-w-[120px]"
                                >
                                    <option value="">type 선택</option>
                                    <option value="1">배치테스트</option>
                                    <option value="2">실시간</option>
                                </select>
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.endDate}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.tdir}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.encval}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.pro}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.svc_cnt}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.fsvc_cnt}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.data_cnt}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.scnt}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.fcnt}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.cmpCode}
                                on:input={() => {
                                    handleMessageChange(msg);
                                    msg.isChecked = true;
                                }}
                            >
                            </td>
                            <td
                                class="text-center"
                                contenteditable="true"
                                bind:textContent={msg.tenv}
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
    <div class="flex-none flex flex-row gap-0 h-[calc(54vh-20px)]">
        <div class="w-6/12 flex flex-row">
            <div class="w-11/12 flex flex-col">
                <div
                    class="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-2"
                    >
                        <div class="flex items-center gap-0">
                            <h3 class="text-xl font-bold text-gray-700">
                                전문 데이터
                            </h3>
                        </div>
                        <div class="flex gap-2 ml-3">
                            <span
                                class="w-36 text-sm font-bold text-center text-gray-600 bg-gray-100 px-0 py-1 border border-gray-300"
                                >서비스/URI 별 건수</span
                            >
                            <input
                                type="number"
                                bind:value={searchCountKeyword}
                                min={MIN_VALUE}
                                max={MAX_VALUE}
                                placeholder="{MIN_VALUE}~{MAX_VALUE} 입력"
                                class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm text-right"
                                style="width: 60px; min-width: 60px;"
                            />
                        </div>
                        <div class="flex gap-2 ml-3">
                            <select
                                bind:value={selectedMessage}
                                on:change={messagesSearch}
                                class="border border-gray-300 rounded-sm px-4 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
                            >
                                <option value="">전문 선택</option>
                                {#each selectMessages as seletmsg}
                                    <option value={seletmsg.MSG_ID}
                                        >{seletmsg.MSG_KR_NM}</option
                                    >
                                {/each}
                            </select>
                            <button on:click={handleDataSearchTrigger}>
                                조회
                            </button>
                            <button
                                class="btn-excel"
                                on:click={handleNoChedkedSave}
                            >
                                조건전송
                            </button>
                        </div>
                        <div class="flex gap-2 ml-6">
                            <select
                                bind:value={selectedMessageField01}
                                on:change={msgField01Search}
                                class="border border-gray-300 rounded-sm px-0 py-1 text-xs focus:outline-none focus:border-blue-500 min-w-[130px]"
                            >
                                <option value="">전문필드 선택</option>
                                {#each selectMessagesField01 as selectfld01}
                                    <option value={selectfld01.MSGFLD_ID}
                                        >{selectfld01.FLD_EN_NM}({selectfld01.FLD_KR_NM})</option
                                    >
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={searchField01Keyword}
                                placeholder="검색어 입력"
                                disabled={!selectedMessageField01}
                                class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                style="width: 150px; min-width: 130px;"
                            />
                            <select
                                bind:value={selectedMessageField02}
                                on:change={msgField02Search}
                                class="border border-gray-300 rounded-sm px-0 py-1 text-xs focus:outline-none focus:border-blue-500 min-w-[130px]"
                            >
                                <option value="">전문필드 선택</option>
                                {#each selectMessagesField02 as selectfld02}
                                    <option value={selectfld02.MSGFLD_ID}
                                        >{selectfld02.FLD_EN_NM}({selectfld02.FLD_KR_NM})</option
                                    >
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={searchField02Keyword}
                                placeholder="검색어 입력"
                                disabled={!selectedMessageField02}
                                class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                style="width: 150px; min-width: 130px;"
                            />
                        </div>
                        <div class="flex gap-2 ml-6">
                            <select
                                bind:value={selectedMessageField03}
                                on:change={msgField03Search}
                                class="border border-gray-300 rounded-sm px-0 py-1 text-xs focus:outline-none focus:border-blue-500 min-w-[130px]"
                            >
                                <option value="">전문필드 선택</option>
                                {#each selectMessagesField03 as selectfld03}
                                    <option value={selectfld03.MSGFLD_ID}
                                        >{selectfld03.FLD_EN_NM}({selectfld03.FLD_KR_NM})</option
                                    >
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={searchField03Keyword}
                                placeholder="검색어 입력"
                                disabled={!selectedMessageField03}
                                class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                style="width: 150px; min-width: 140px;"
                            />
                            <select
                                bind:value={selectedMessageField04}
                                on:change={msgField04Search}
                                class="border border-gray-300 rounded-sm px-0 py-1 text-xs focus:outline-none focus:border-blue-500 min-w-[130px]"
                            >
                                <option value="">전문필드 선택</option>
                                {#each selectMessagesField04 as selectfld04}
                                    <option value={selectfld04.MSGFLD_ID}
                                        >{selectfld04.FLD_EN_NM}({selectfld04.FLD_KR_NM})</option
                                    >
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={searchField04Keyword}
                                placeholder="검색어 입력"
                                disabled={!selectedMessageField04}
                                class="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-normal text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                style="width: 150px; min-width: 140px;"
                            />
                        </div>
                    </div>
                    <div class="flex-1 overflow-auto">
                        <table>
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
                                    <th class="text-center w-10 hidden">
                                        상태
                                    </th>
                                    <th class="text-center hidden"> 업무ID </th>
                                    <th class="text-center hidden">
                                        테스트케이스ID
                                    </th>
                                    <th class="text-center hidden">
                                        TCDT_ID
                                    </th>
                                    <th class="text-center hidden">
                                        SEARCH_ID
                                    </th>
                                    <th class="text-center hidden">count</th>
                                    <th class="text-center hidden">MSG</th>
                                    <th class="text-center hidden">Fld01</th>
                                    <th class="text-center hidden">Fld02</th>
                                    <th class="text-center hidden">Fld03</th>
                                    <th class="text-center hidden">Fld04</th>
                                    <th class="text-center hidden">Key01</th>
                                    <th class="text-center hidden">Key02</th>
                                    <th class="text-center hidden">Key03</th>
                                    <th class="text-center hidden">Key04</th>
                                    <th class="text-center hidden">전문ID</th>
                                    <th class="text-center">전문명</th>
                                    <th
                                        class="text-center"
                                        style="width: 100px; min-width: 100px;"
                                        >서비스/URI</th
                                    >
                                    <th class="text-center">프로토콜</th>
                                    <th class="text-center">Method</th>
                                    <th class="text-center hidden">
                                        전문데이터ID
                                    </th>
                                    <th
                                        class="text-left"
                                        style="width: 180px; min-width: 180px;"
                                        >전문데이터</th
                                    >
                                    <th
                                        class="text-left"
                                        style="width: 140px; min-width: 140px;"
                                        >Header</th
                                    >
                                    <th
                                        class="text-left"
                                        style="width: 140px; min-width: 140px;"
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
                                            {row.APP_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.TC_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.TCDT_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.SEARCH_ID}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_CountKeyword}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_selectedMessage}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_selectedField01}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_selectedField02}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_selectedField03}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_selectedField04}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_Field01Keyword}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_Field02Keyword}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_Field03Keyword}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.search_Field04Keyword}
                                        </td>
                                        <td class="text-center hidden">
                                            {row.MSG_ID}
                                        </td>
                                        <td class="text-center">
                                            {row.MSG_KR_NM}
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
                                        <td class="text-center hidden">
                                            {row.MSGDT_ID}
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
                            테스트케이스 데이터
                        </h3>
                    </div>
                    <div class="flex gap-1">
                        <input
                            type="text"
                            bind:value={searchDataKeyword}
                            placeholder="검색어 입력"
                            class="border border-gray-300 rounded-sm px-2 py-1 font-normal text-sm focus:outline-none focus:border-blue-500"
                            style="width: 250px; min-width: 150px;"
                        />
                        <button on:click={handleFieldSearchTrigger}>
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
                                        bind:checked={isAllFieldsChecked}
                                        on:click={toggleAllFields}
                                    />
                                </th>
                                <th
                                    class="text-center"
                                    style="width: 6px; min-width: 6px;">No</th
                                >
                                <th class="text-center hidden">상태</th>
                                <th class="text-center hidden">업무그룹ID</th>
                                <th class="text-center hidden">
                                    테스트케이스ID
                                </th>
                                <th class="text-center hidden">
                                    테스트케이스명
                                </th>
                                <th class="text-center hidden">
                                    테스트케이스데이터ID
                                </th>
                                <th class="text-center hidden">검색조건 ID</th>
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
                                <th class="text-center hidden">
                                    업무전문데이터PKEY
                                </th>
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
                                    class="text-left"
                                    style="width: 160px; min-width: 160px;"
                                    >Header</th
                                >
                                <th
                                    class="text-left"
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
