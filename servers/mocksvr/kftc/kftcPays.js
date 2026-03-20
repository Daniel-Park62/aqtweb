import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';

const router = express.Router() ;

/* 선불목록조회 /v2.0/pays */
router.get('/', async function (req, res, next) {
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
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "faceofbill_cnt": "1",
    "faceofbill_list": [
      { "faceofbill_id": "feceofbillID0123456789",
        "faceofbill_name": "선불권면 01",
        "register_date": "20210101",
        "faceofbill_status": "01",
        "linked_info_yn": "Y"
      }, 
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;

  res.json(rsps) ;
});

/* 선불연계정보조회 /v2.0/pays/reload */
router.get('/reload', async function (req, res, next) {
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
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "reload_cnt": "1",
    "reload_list": [
      {
        "reload_org_code": "097",
        "reload_account_num": "123000456098",
        "reload_account_num_masked": "123-0004-56***",
        "primary_account_yn": "Y",
        "reload_option": "01",
        "reload_day": "01",
        "reload_amt": "10000"
      },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  res.json(rsps) ;
});

/* 선불잔액조회 /v2.0/pays/balances */
router.get('/balances', async function (req, res, next) {
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
    "limit_amt": "200",
    "total_balance_amt": "20000",
    "charge_balance_amt": "10000",
    "reserve_balance_amt": "10000",
    "reserve_due_amt": "10000",
    "expire_due_amt": "10000"
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  res.json(rsps) ;
});

/* 선불거래내역조회 /v2.0/pays/transactions */
router.get('/transactions', async function (req, res, next) {
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
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "trans_cnt": "1",
    "trans_list": [
      { "trans_type": "5102",
        "trans_dtime": "20201201101010",
        "trans_no": "TRANSNO1234567890",
        "trans_amt": "10000",
        "after_balance_amt": "90000",
        "trans_org_code": "097",
        "trans_key": "12345678********",
        "additional_info": "거래부가정보",
        "merchant_name": "가맹점명",
        "trans_title": "상품명",
        "trans_category": "L1",
        "pay_method": "01"
      },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;
  rsps.trans_list[0].trans_dtime = req.params.from_date + toymd.substring(8,17) ;
  res.json(rsps) ;
});

export default router;
