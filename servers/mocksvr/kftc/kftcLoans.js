import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';

const router = express.Router() ;

/* 대출.리스목록조회 /v2.0/loans */
router.get('/', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20220910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20220910",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "user_seq_no": "U123456789",
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "loan_cnt": "1",
    "loan_list": [
      { "account_num": "0001230000123",
        "account_num_seq": "001",
        "account_num_masked": "000-1230000-***",
        "prod_name": "오픈대출",
        "account_type": "3271",
        "account_status": "01" },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;

  res.json(rsps) ;
});

/* 대출,리스기본정보조회 /v2.0/loans/basic */
router.post('/basic', async function (req, res, next) {
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
    "user_seq_no": "U123456789",
    "account_num": "0001234567890123",
    "account_seq": "100",
    "repay_date": "20221205",
    "repay_method": "01",
    "repay_org_code": "097",
    "repay_account_num": "01220221205",
    "repay_account_num_masked": "01220***205",
    "next_repay_date": "20221205",
    "page_record_cnt ": "1",
    "next_page_yn": "Y",
    "befor_inquiry_trace_info" : "1T201806171",
    "res_list": [
      { 
      "trans_date": "20190910",
      "trans_time": "113000",
      "trans_type": "01",
      "trans_amt": "-450000"
      },
    ]
  }

  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;
  rsps.account_num = req.params.account_num ;
  rsps.befor_inquiry_trace_info = req.params.befor_inquiry_trace_info ;
  rsps.res_list[0].trans_date = req.params.from_date ;
  res.json(rsps) ;
});

export default router;
