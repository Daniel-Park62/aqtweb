import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';

const router = express.Router() ;

/* 보험목록조회 /v2.0/insurances */
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
    "insu_cnt": "5",
    "insu_list": [
      { "insu_num": "abcABC123abcABC123ab",
        "prod_name": "오픈암보험",
        "insu_type": "03",
        "insu_status": "02",
        "issue_date": "20020202",
        "exp_date": "20520202" },
    ]  
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;

  res.json(rsps) ;
});

/* 보험납입정보조회 /v2.0/insurances/payment */
router.post('/payment', async function (req, res, next) {
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
    "pay_due": "01",
    "pay_cycle": "99",
    "pay_date": "01",
    "pay_end_date": "20551231",
    "pay_amt": "1000000",
    "pay_org_code": "097",
    "pay_account_num": "0001230000123",
    "pay_account_num_masked": "000-1230000-***"
  }

  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;

  res.json(rsps) ;
});

export default router;
