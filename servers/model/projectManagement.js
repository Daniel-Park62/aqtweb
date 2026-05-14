import mondb from '../db/dbconn.js';

const projectManagement = {
    /**
     * Search a project
     */
    getProjectList: async (searchType, keyword) => {
        let sql = `select P.PRJ_ID                                          AS PRJ_ID
                        , P.PRJ_NM                                          AS PRJ_NM
                        , P.ENC_VAL                                         AS ENC_VAL
                        , P.TCODE                                           AS TCODE
                        , P.PROTO_COL                                       AS PROTO_COL
                        , P.COMPR_YN                                        AS COMPR_YN
                        , (SELECT max(generation_expression) sflagc 
                                FROM information_schema.COLUMNS
                                -- where table_schema  = database() 
                                where table_schema  = 'aqtdb' 
                                and TABLE_NAME = 'ttcppacket' 
                                AND COLUMN_NAME = 'sflag')                  as FAIL_COND
                        , P.DIFFC_COND                                      AS DIFFC_COND
                        , P.VIRT_COL1                                       AS VIRT_COL1
                        , P.VIRT_COL2                                       AS VIRT_COL2
                        , (select column_type as virt_type1 
                                        from information_schema.columns
                                        -- where table_schema  = database() 
                                        where table_schema  = 'aqtdb' 
                                        and table_name = 'ttcppacket' 
                                        and  column_name = 'COL1'
                                    )                                       as VIRT_TYPE1 
                        , (select column_type as virt_type2
                                        from information_schema.columns
                                        -- where table_schema  = database() 
                                        where table_schema  = 'aqtdb' 
                                        and table_name = 'ttcppacket' 
                                        and  column_name = 'COL2'
                                    )                                       as VIRT_TYPE2
                        , (select generation_expression as virt_expr1
                                        from information_schema.columns
                                        -- where table_schema  = database() 
                                        where table_schema  = 'aqtdb' 
                                        and table_name = 'ttcppacket' 
                                        and  column_name = 'COL1'
                                    )                                       as VIRT_EXPR1 
                        , (select generation_expression as virt_expr2
                                        from information_schema.columns
                                        -- where table_schema  = database() 
                                        where table_schema  = 'aqtdb' 
                                        and table_name = 'ttcppacket' 
                                        and  column_name = 'COL2'
                                    )                                       as VIRT_EXPR2
                        , P.CRT_ID                                          AS CRT_ID   
                        , P.CRT_DT                                          AS CRT_DT
                        , P.UDT_ID                                          AS UDT_ID
                        , P.UDT_DT                                          AS UDT_DT
                    from aqt_project_tb P 
                    where 1=1
            `;
        sql += ` ORDER BY 1 DESC`;

        let params = [];

        //console.log("##############################################################");
        //console.log("getProjectList sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, params);
        //console.log("Debug: getProjectList rows:", rows);
        
        return rows;
    },
    saveProject: async (projectData) => {
        let projectId = projectData.prj_id;
        const no_rcv_val = (projectData.norcv == '1' || projectData.norcv === 1) ? 1 : 0;
        let max_cnt_val = parseInt(projectData.maxcnt);
        
        if (isNaN(max_cnt_val)) 
                max_cnt_val = null;

        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            //console.log("##############################################################");
            //console.log("projectId : " + projectId);
            //console.log("prj_nm : " + projectData.prj_nm);
            //console.log("enc_val : " + projectData.enc_val);
            //console.log("tcode : " + projectData.tcode);
            //console.log("proto_col : " + projectData.proto_col);
            //console.log("compr_yn : " + projectData.compr_yn);
            //console.log("diffc_cond : " + projectData.diffc_cond);
            //console.log("##############################################################");

            if (projectId && projectId !== '자동생성' && projectId !== '') {
                // UPDATE
                await conn.query(`
                        UPDATE aqt_project_tb 
	                    SET PRJ_NM = ?
                          , ENC_VAL = ?
                          , TCODE = ?
                          , PROTO_COL = ?
                          , COMPR_YN = ?
                          , DIFFC_COND = ?
                        WHERE PRJ_ID = ?
                    `, [  projectData.prj_nm, projectData.enc_val
                        , projectData.tcode, projectData.proto_col
                        , projectData.compr_yn
                        , projectData.diffc_cond
                        , projectData.virtual_col1, projectData.virtual_col2
                        , projectId
                    ]);
            } else {
                // INSERT
                const resProject = await conn.query(`
                        alter table aqtdb.ttcppacket CHANGE COLUMN sflag sflag char(1) as ( ? ) ;
                        INSERT INTO aqt_project_tb(PRJ_NM, ENC_VAL, DIFFC_COND,TCODE, PROTO_COL, COMPR_YN) 
                        VALUES(?, ?, ?, ?, ?, ?)
                 `,  [projectData.fail_cond
                    , projectData.prj_nm, projectData.enc_val, projectData.diffc_cond
                    , projectData.tcode, projectData.proto_col, projectData.compr_yn
                ]);
            }

            if (projectData.fail_cond && projectData.fail_cond !== '') {
                await conn.query(`
                        alter table aqtdb.ttcppacket CHANGE COLUMN sflag sflag char(1) as ( ${projectData.fail_cond} );
                    `);
            }

            await conn.commit();
            return { affectedRows: 1, insertId: projectId };
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    saveVirtCol1: async (projectData) => {
        let projectId = projectData.prj_id;
        const no_rcv_val = (projectData.norcv == '1' || projectData.norcv === 1) ? 1 : 0;
        let max_cnt_val = parseInt(projectData.maxcnt);
        
        if (isNaN(max_cnt_val)) 
                max_cnt_val = null;

        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            //console.log("##############################################################");
            //console.log("projectId : " + projectId);
            //console.log("virtual_col1 : " + projectData.virtual_col1);
            //console.log("##############################################################");

            // UPDATE
            await conn.query(`
                    UPDATE aqt_project_tb 
                    SET VIRT_COL1 = ?
                    WHERE PRJ_ID = ?
                `, [  projectData.virtual_col1, projectId ]);

            if (projectData.virtual_col1 && projectData.virtual_col1 !== '') {
                await conn.query(`
                        alter table aqtdb.ttcppacket CHANGE COLUMN col1 col1 ${projectData.virtual_type1} AS ( ${projectData.virtual_expr1} );
                    `);
            }

            await conn.commit();
            return { affectedRows: 1, insertId: projectId };
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    saveVirtCol2: async (projectData) => {
        let projectId = projectData.prj_id;
        const no_rcv_val = (projectData.norcv == '1' || projectData.norcv === 1) ? 1 : 0;
        let max_cnt_val = parseInt(projectData.maxcnt);
        
        if (isNaN(max_cnt_val)) 
                max_cnt_val = null;

        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            //console.log("##############################################################");
            //console.log("projectId : " + projectId);
            //console.log("virtual_col2 : " + projectData.virtual_col2);
            //console.log("##############################################################");

            // UPDATE
            await conn.query(`
                    UPDATE aqt_project_tb 
                    SET VIRT_COL2 = ?
                    WHERE PRJ_ID = ?
                `, [  projectData.virtual_col2, projectId ]);

            if (projectData.virtual_col2 && projectData.virtual_col2 !== '') {
                await conn.query(`
                        alter table aqtdb.ttcppacket CHANGE COLUMN col2 col2 ${projectData.virtual_type2} AS ( ${projectData.virtual_expr2} );
                    `);
            }

            await conn.commit();
            return { affectedRows: 1, insertId: projectId };
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    deleteProject: async (id) => {
        const sql = `DELETE FROM aqt_project_tb WHERE PRJ_ID = ? `;
        const result = await mondb.query(sql, [id]);

        return result;
    },
    getNextAppId: async () => {
        const sql = `
            select case concat('APP'+max(substr(APP_ID, 5, 14))) when 0 then concat('APP_','0000000001')
                   else replace(concat('APP', max(substr(APP_ID, 5, 14)) + 100000000001),'APP1', 'APP') end as APP_ID 
            from aqt_business_tb
        `;
        const res = await mondb.query(sql);
        return res[0]?.APP_ID || 'APP00000000001';
    },
    getBusinessList: async (searchType, keyword, projectId) => {
        let sql = `
           SELECT 'U'           as state
                , APP_ID        as APP_ID
                , APPNM         as APPNM
                , MAIN_MGR      as MAIN_MGR
                , GUBUN         as GUBUN
                , SCNT          as SCNT
                , HOST_IP       as HOST_IP
                , HOST_PORT     as HOST_PORT
                , CRT_ID        as CRT_ID
                , CRT_DT        as CRT_DT
                , UDT_ID        as UDT_ID
                , UDT_DT        as UDT_DT
 			FROM aqt_business_tb
            WHERE 1=1
        `;
        
        let params = [];

        if (keyword) {
            if (searchType === 'all') {
                sql += ` AND (APPNM LIKE ? OR MAIN_MGR LIKE ? OR HOST_IP LIKE ? OR HOST_PORT LIKE ?) `;
                params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
            } else if (['APPNM', 'MAIN_MGR', 'HOST_IP', 'HOST_PORT'].includes(searchType)) {
                sql += ` AND ${searchType} LIKE ? `;
                params.push(`%${keyword}%`);
            } else {
                sql += ` AND APPNM LIKE ? `;
                params.push(`%${keyword}%`);
            }
        }
        sql += ` ORDER BY APP_ID DESC`;

        //console.log("##############################################################");
        //console.log("getBusinessList sql : " + sql);
        //console.log("##############################################################");

        return await mondb.query(sql, params);
    },
    saveBusiness: async (data) => {
        //console.log("##############################################################");
        //console.log("data.state : " + data.state);
        //console.log("data.app_id : " + data.app_id);
        //console.log("data.appnm : " + data.appnm);
        //console.log("data.main_mgr : " + data.main_mgr);
        //console.log("data.gubun : " + data.gubun);
        //console.log("data.scnt : " + data.scnt);
        //console.log("data.host_ip : " + data.host_ip);
        //console.log("data.host_port : " + data.host_port);
        //console.log("##############################################################");

        if (data.state === "U") {
            // UPDATE
            const sql = `
                UPDATE aqt_business_tb 
                SET APPNM = ?
                  , MAIN_MGR = ?
                  , GUBUN = ?
                  , SCNT = ?
                  , HOST_IP = ?
                  , HOST_PORT = ?
                WHERE APP_ID = ?
            `;

            const params = [data.appnm, data.main_mgr, data.gubun, data.scnt
                          , data.host_ip, data.host_port
                          , data.app_id
            ];

            //console.log("##############################################################");
            //console.log("saveBusiness update sql : " + sql);
            //console.log("##############################################################");

            await mondb.query(sql, params);

            return { affectedRows: 1 };
        } else {
            // INSERT
            const sql = `
                INSERT INTO aqt_business_tb(APP_ID, APPNM, MAIN_MGR, GUBUN, SCNT, HOST_IP, HOST_PORT) 
                VALUES(?, ?, ?, ?, ?, ?, ?)
            `;

            //console.log("##############################################################");
            //console.log("saveBusiness insert sql : " + sql);
            //console.log("##############################################################");

            const params = [data.app_id, data.appnm, data.main_mgr, data.gubun, data.scnt, data.host_ip, data.host_port];
            const res = await mondb.query(sql, params);

            return { insertId: res.insertId };
        }
    },
    deleteBusiness: async (app_id) => {
        const sql = `DELETE FROM aqt_business_tb WHERE APP_ID = ? `;

        //console.log("##############################################################");
        //console.log("app_id : " + app_id);
        //console.log("deleteBusiness sql : " + sql);
        //console.log("##############################################################");

        return await mondb.query(sql, [app_id]);
    },
};

export default projectManagement;
