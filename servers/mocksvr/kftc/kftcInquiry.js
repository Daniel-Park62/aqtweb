import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';
const router = express.Router() ;
/* 계좌실명조회 /v2.0/inquiry/real_name */
router.post('/real_name', async function (req, res, next) {
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
    "bank_code_std": "097",
    "bank_code_sub": "1230001",
    "bank_name": "오픈은행",
    "account_num": "1101230000678",
    "account_holder_info_type": " ",
    "account_holder_info": "880101",
    "account_holder_name": "홍길동",
    "account_type": "1"
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.account_holder_info_type = req.body.account_holder_info_type ;
  rsps.account_holder_info = req.body.account_holder_info ;
  res.json(rsps) ;
});

/* 수취조회 /v2.0/inquiry/receive */
router.post('/receive', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_code_std": "097",
    "bank_code_sub": "1230001",
    "bank_name": "오픈은행",
    "account_num": "3001230000678",
    "account_num_masked": "300123-0000-***",
    "print_content": "홍길동송금",
    "account_holder_name": "허균",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190910",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "wd_bank_code_std": "097",
    "wd_bank_name": "오픈은행",
    "wd_account_num": "1101230000678",
    "tran_amt": "10000",
    "cms_num": "93848103221"
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.account_num = req.body.account_num ;
  rsps.bank_code_std = req.body.bank_code_std ;
  rsps.tran_amt = req.body.tran_amt ;
  rsps.cms_num = req.body.cms_num ;
  
  res.json(rsps) ;
});

/* 송금인정보조회 /inquiry/remit_list */
router.post('/remit_list', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190910",
    "bank_code_tran": "097",
    "bank_code_std": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "account_num": "3001230000678",
    "bank_name": "오픈은행",
    "balance_amt": "1000000",
    "total_record_cnt": "0",
    "page_record_cnt": "18",
    "next_page_yn": "Y",
    "befor_inquiry_trace_info": "12345678901234567890",
    "res_list": [
        { "tran_date": "20190910",
            "tran_time": "113000",
            "tran_type": "현금",
            "printed_content": "통장인자내용",
            "tran_amt": "450000",
            "after_balance_amt": "-1000000",
            "branch_name": "분당점",
            "remitter_name": "송금인",
            "remitter_bank_code": "097",
            "remitter_account_num": "5009870000321" },
        { "tran_date": "20190910",
            "tran_time": "143000",
            "tran_type": "현금",
            "printed_content": "통장인자내용",
            "tran_amt": "450000",
            "after_balance_amt": "-1450000",
            "branch_name": "분당점",
            "remitter_name": "송금인",
            "remitter_bank_code": "097",
            "remitter_account_num": "5009870000321" },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.account_num = req.body.account_num ;
  rsps.bank_code_std = req.body.bank_code_std ;
  rsps.befor_inquiry_trace_info = req.body.befor_inquiry_trace_info ;
  rsps.res_list[0].tran_date = req.body.from_date ;
  rsps.res_list[1].tran_date = req.body.from_date ;
  
  res.json(rsps) ;
});
export default router;
