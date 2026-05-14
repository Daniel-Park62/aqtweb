import mondb from '../db/dbconn.js';

const companyManagement = {
    /**
     * Create tcompany table if it doesn't exist
     */
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS tcompany (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                company_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await mondb.query(sql);
    },

    /**
     * Get all companies with optional search
     */
    getCompanyList: async (searchType, keyword) => {
        let sql = `SELECT * FROM tcompany`;
        let params = [];

        if (keyword) {
            if (searchType === 'company_name') {
                sql += ` WHERE company_name LIKE ?`;
                params.push(`%${keyword}%`);
            } else if (searchType === 'company_description') {
                sql += ` WHERE company_description LIKE ?`;
                params.push(`%${keyword}%`);
            }
        }

        sql += ` ORDER BY id DESC`;

        return await mondb.query(sql, params);
    },

    /**
     * Insert a new company
     */
    insertCompany: async (company_name, company_description) => {
        const sql = `INSERT INTO tcompany (company_name, company_description) VALUES (?, ?)`;
        const result = await mondb.query(sql, [company_name, company_description]);
        return result;
    },

    /**
     * Update an existing company
     */
    updateCompany: async (id, company_name, company_description) => {
        const sql = `UPDATE tcompany SET company_name = ?, company_description = ? WHERE id = ?`;
        const result = await mondb.query(sql, [company_name, company_description, id]);
        return result;
    },

    /**
     * Delete a company
     */
    deleteCompany: async (id) => {
        const sql = `DELETE FROM tcompany WHERE id = ?`;
        const result = await mondb.query(sql, [id]);
        return result;
    }
};

// Auto-create table on import (or call explicitly if preferred)
companyManagement.createTable().catch(err => console.error("Error creating tcompany table:", err));

export default companyManagement;
