import mondb from '../db/dbconn.js';

const jobs = {
    /**
     * Get list of projects (Mock Data)
     */
    getProjectList: async () => {
        let sql = `
            SELECT '1' as id, '프로젝트 A' as name
            UNION ALL
            SELECT '2' as id, '프로젝트 B' as name
        `;
        return await mondb.query(sql);
    },

    /**
     * Get list of jobs (Mock Data)
     */
    getJobList: async () => {
        let sql = `
            SELECT '1' as id, '1' as projectId, '업무 1' as name
            UNION ALL
            SELECT '2' as id, '1' as projectId, '업무 2' as name
            UNION ALL
            SELECT '3' as id, '2' as projectId, '업무 3' as name
        `;
        return await mondb.query(sql);
    },
};

export default jobs;
