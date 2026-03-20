import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';

const router = express.Router() ;

/* 잔액조회 /v2.0/account/balance/fin_num */
router.get('/balance/fin_num', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190910",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "bank_name": "오픈은행",
    "fintech_use_num": "123456789012345678901234",
    "balance_amt": "1000000",
    "available_amt": "1000000",
    "account_type": "2",
    "product_name": "알뜰살뜰적금",
    "account_issue_date": "20190110",
    "maturity_date": "20290109",
    "last_tran_date": "20191010",    
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.last_tran_date = toymd.substring(0,8);
  rsps.fintech_use_num = req.params.fintech_use_num ;
  res.json(rsps) ;
});

/* 거래내역 조회 */
router.get('/transaction_list/fin_num', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190910",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "bank_name": "오픈은행",
    "fintech_use_num": "123456789012345678901234",
    "balance_amt": "1000000",
    "page_record_cnt ": "25",
    "next_page_yn": "Y",
    "befor_inquiry_trace_info" : "1T201806171",
    "res_list": [
      {
      "tran_date": "20190910",
      "tran_time": "113000",
      "inout_type": "입금",
      "tran_type": "현금",
      "printed_content": "통장인자내용",
      "tran_amt": "450000",
      "after_balance_amt": "1000000",
      "branch_name": "분당점"
      },
      {
      "tran_date": "20190910",
      "tran_time": "133000",
      "inout_type": "입금",
      "tran_type": "현금",
      "printed_content": "통장인자내용",
      "tran_amt": "950000",
      "after_balance_amt": "1950000",
      "branch_name": "분당점"
      },
    ]

  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.fintech_use_num = req.params.fintech_use_num ;
  rsps.res_list[0].tran_date = req.params.from_date ;
  rsps.res_list[1].tran_date = req.params.from_date ;
  res.json(rsps) ;
});

export default router;
