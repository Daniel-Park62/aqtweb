import mondb from '../db/dbconn.js';

const tuser = {
    /**
     * 사용자 관리 전체 리스트
     */
    ttuserlist: async (args) => {
        let rows = await mondb.query(`   select ''			as flag     -- flag
                                              , ''	    	as checked  -- checked
                                              , pkey		as pkey		-- pkey
                                              , Host		as host		-- 접속가능 IP or Host (%:all)
                                              , usrid		as usrid	-- 사용자ID
                                              , usrdesc		as usrdesc	-- 사용자설명
                                              , pass1		as pass1	-- 비밀번호 (select password('monadmin1!'))
                                              , admin		as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                              , apps		as apps		-- 접근가능 페이지
                                              , lastin		as lastin	-- 최종로그인 일시
                                              , lcnt		as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                              , regdt		as regdt	-- 등록일
                                            from tuser
                                    `);
        return (rows);
    },
    /**
     * 사용자 관리 검색
     */
    ttusersearch: async (args) => {
        let gubun = 1;
        let searchtxt = '';
        let rows = 0;

        gubun = args.gubun;
        searchtxt = args.searchtxt;

        if (gubun == 1) {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''    		as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where usrid like concat(concat('%',?),'%')
                                    `, [searchtxt]);
        } else if (gubun == 2) {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''	    	as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where Host like concat(concat('%',?),'%')
                                    `, [searchtxt]);
        } else if (gubun == 3) {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''	    	as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where usrdesc like concat(concat('%',?),'%')
                                    `, [searchtxt]);
        } else if (gubun == 4) {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''    		as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where admin like concat(concat('%',?),'%')
                                    `, [searchtxt]);
        } else if (gubun == 5) {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''	    	as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where apps like concat(concat('%',?),'%') 
                                    `, [searchtxt]);
        } else {
            rows = await mondb.query(` select ''			as flag     -- flag
                                            , ''	    	as checked  -- checked
                                            , pkey			as pkey		-- pkey
                                            , Host			as host		-- 접속가능 IP or Host (%:all)
                                            , usrid		    as usrid	-- 사용자ID
                                            , usrdesc		as usrdesc	-- 사용자설명
                                            , pass1		    as pass1	-- 비밀번호 (select password('monadmin1!'))
                                            , admin		    as admin	-- 관리자여부 (0:사용자, 1:관리자)
                                            , apps			as apps		-- 접근가능 페이지
                                            , lastin		as lastin	-- 최종로그인 일시
                                            , lcnt			as lcnt		-- 로그인실패횟수 (5회 초과시 잠금)
                                            , regdt		    as regdt	-- 등록일
                                        from tuser
                                        where usrid like concat(concat('%',?),'%')
                                    `, [searchtxt]);
        }
        return (rows);
    },
    /**
     * 사용자 관리 삭제
     * 
     */
    ttuserdel: async (args) => {
        var contact = JSON.parse(args);

        let msg = { message: 'post :' };
        let qstr = '';
        let r = 0;

        try {
            let pkey = 0;

            for (var i = 0; i < contact.length; i++) {
                pkey = contact[i].pkey;
                qstr = `delete from tuser where pkey = ?`;

                r = mondb.query(qstr, [pkey]);
            }
        } catch (e) {
            console.log(e.message);
            return (0);
        }

        return (1);
    },
    /**
     * 사용자 관리 저장
     * 
     */
    ttusersave: async (args) => {
        var contact = JSON.parse(args);

        let msg = { message: 'post :' };
        let qstr = '';
        let r = 0;

        let pkey = '';
        let host = '';
        let usrid = '';
        let usrdesc = '';
        let pass1 = '';
        let admin = 0;
        let apps = '';
        let lastin = '';
        let lcnt = 0;

        try {
            let pkey = 0;

            for (var i = 0; i < contact.length; i++) {
                pkey = contact[i].pkey;
                host = contact[i].host;
                usrid = contact[i].usrid;
                usrdesc = contact[i].usrdesc;
                pass1 = contact[i].pass1;
                admin = contact[i].admin;
                apps = contact[i].apps;
                lastin = contact[i].lastin;
                lcnt = contact[i].lcnt;

                if (pkey === 0) {
                    qstr = ` insert into tuser(host,usrid,usrdesc,pass1,admin,apps,lcnt,regdt) 
                             value (nvl(?,'%'),nvl(?,'default'),nvl(?,'default'),password(nvl(?,?)),nvl(?,0),nvl(?,'default'),nvl(?,0),sysdate())
                   ` ;

                    r = mondb.query(qstr, [host, usrid, usrdesc, pass1, usrid, admin, apps, lcnt]);
                } else {
                    qstr = ` update tuser
                             set   host = nvl(?,'%')
                                 , usrid = nvl(?,'default')
                                 , usrdesc = nvl(?,'default')
                                 , pass1 = password(nvl(?,?))
                                 , admin = nvl(?,0)
                                 , apps = nvl(?,'default')
                                 , lcnt = nvl(?,0)
                                 , regdt = sysdate()
                             where pkey = ?
                    ` ;

                    r = mondb.query(qstr, [host, usrid, usrdesc, pass1, usrid, admin, apps, lcnt, pkey]);
                }

            }
        } catch (e) {
            console.log(e.message);
            return (0);
        }

        return (1);
    },
}

export default tuser;