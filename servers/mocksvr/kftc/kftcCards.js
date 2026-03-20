import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';

const router = express.Router() ;

/* 카드목록조회 /v2.0/cards */
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
    "user_seq_no": "U123456789",
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "card_cnt": "1",
    "card_list": [
      { "card_id": "abcABC123abcABC123abcABC",
        "card_num_masked": "123456******3456",
        "card_name": "카드상품명",
        "card_member_type": "1" },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;

  res.json(rsps) ;
});

/* 카드기본정보조회 /v2.0/cards/issue_info */
router.get('/issue_info', async function (req, res, next) {
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
    "card_type": "01",
    "settlement_bank_code": "097",
    "settlement_account_num": "0001230000123",
    "settlement_account_num_masked": "000-1230000-***",
    "issue_date": "20191210"
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  res.json(rsps) ;
});

/* 카드청구기본정보조회 //v2.0/cards/bills */
router.get('/bills', async function (req, res, next) {
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
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "bill_cnt": "1",
    "bill_list": [
    { "charge_month": "201912",
      "settlement_seq_no": "001",
      "card_id": "abcABC123abcABC123abcABC",
      "charge_amt": "456000",
      "settlement_day": "25",
      "settlement_date": "20191226",
      "card_type": "01" },
    ]  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;
  rsps.bill_list[0].charge_month = req.params.from_month ;
  res.json(rsps) ;
});

/* 카드청구상세정보조회 //v2.0/cards/bills/detail */
router.get('/bills/detail', async function (req, res, next) {
  const rsps = {
   "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190901101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190901",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "user_seq_no": "U123456789",
    "next_page_yn": "N",
    "befor_inquiry_trace_info": "",
    "bill_detail_cnt": "1",
    "bill_detail_list": [
    { "card_value": "abcABC123abcABC123abcABC",
    "paid_date": "20190110",
    "paid time": "102030",
    "paid_amt": "456000",
    "merchant_name": "오픈**",
    "credit_fee_amt": "456",
    "product_type": "01" },
    ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd ;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.bank_tran_id = req.params.bank_tran_id ;
  rsps.user_seq_no = req.params.user_seq_no ;
  rsps.bill_detail_list[0].paid_date = req.params.from_month ;
  res.json(rsps) ;
});

export default router;
