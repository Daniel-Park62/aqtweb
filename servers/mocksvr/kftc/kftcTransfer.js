import express from 'express';
import { getYmd } from '../../lib/aqtComm.js';
const router = express.Router() ;
/* 입금이체 핀테크번호사용  /v2.0/transfer/deposit/fin_num */
router.post('/deposit/fin_num', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "wd_bank_code_std": "097",
    "wd_bank_code_sub": "1230001",
    "wd_bank_name": "오픈은행",
    "wd_account_num_masked": "000-1230000-***",
    "wd_print_content": "환불금액",
    "wd_account_holder_name": "허균",
    "res_cnt": "1",
    "res_list": [
            {
            "tran_no": "1",
            "bank_tran_id": "F123456789U4BC34239Z",
            "bank_tran_date": "20190910",
            "bank_code_tran": "097",
            "bank_rsp_code": "000",
            "bank_rsp_message": "",
            "fintech_use_num": "123456789012345678901234",
            "account_alias": "급여계좌",
            "bank_code_std": "097",
            "bank_code_sub": "1230001",
            "bank_name": "오픈은행",
            "account_num_masked": "000-1230000-***",
            "print_content": "쇼핑몰환불",
            "account_holder_name": "홍길동",
            "tran_amt": "10000",
            "cms_num": "93848103221"
            }
        ]
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.res_list[0].bank_tran_date = toymd.substring(0,8);
  rsps.res_list[0].fintech_use_num = req.body.req_list[0].fintech_use_num ;
  rsps.res_list[0].cms_num = req.body.req_list[0].cms_num ;
  res.json(rsps) ;
});

/* 입금이체 계좌번호 사용 /v2.0/transfer/deposit/acnt_num */
router.post('/deposit/acnt_num', async function (req, res, next) {
  const rsps = {
   "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "wd_bank_code_std": "097",
    "wd_bank_code_sub": "1230001",
    "wd_bank_name": "오픈은행",
    "wd_account_num_masked": "000-1230000-***",
    "wd_print_content": "출금계좌인자내역",
    "wd_account_holder_name": "허균",
    "res_cnt": "1",
    "res_list": [
        {
            "tran_no": "1",
            "bank_tran_id": "F123456789U4BC34239Z",
            "bank_tran_date": "20190910",
            "bank_code_tran": "097",
            "bank_rsp_code": "000",
            "bank_rsp_message": "",
            "bank_code_std": "097",
            "bank_code_sub": "1230001",
            "bank_name": "오픈은행",
            "account_num": "1101230000678",
            "account_num_masked": "000-1230000-***",
            "print_content": "입금계좌인자내역",
            "account_holder_name": "홍길동",
            "tran_amt": "10000",
            "cms_num": "93848103221"
        }
    ]  
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.res_list[0].bank_tran_id = req.body.req_list[0].bank_tran_id
  rsps.res_list[0].bank_tran_date = toymd.substring(0,8);
  rsps.res_list[0].bank_code_std = req.body.req_list[0].bank_code_std ;
  rsps.res_list[0].account_num = req.body.req_list[0].account_num ;
  rsps.res_list[0].account_holder_name = req.body.req_list[0].account_holder_name ;
  rsps.res_list[0].print_content = req.body.req_list[0].print_content ;
  rsps.res_list[0].tran_amt = req.body.req_list[0].tran_amt ;
  rsps.res_list[0].cms_num = req.body.req_list[0].cms_num ;
  
  res.json(rsps) ;
});

/* 출금이체 /v2.0/transfer/withdraw/fin_num */
router.post('/withdraw/fin_num', async function (req, res, next) {
  const rsps = {
    "api_tran_id": "2ffd133a-d17a-431d-a6a5",
    "api_tran_dtm": "20190910101921567",
    "rsp_code": "A0000",
    "rsp_message": "",
    "dps_bank_code_std": "097",
    "dps_bank_code_sub": "1230001",
    "dps_bank_name": "오픈은행",
    "dps_account_num_masked": "000-1230000-***",
    "dps_print_content": "입금계좌인자내역",
    "dps_account_holder_name": "허균",
    "bank_tran_id": "F123456789U4BC34239Z",
    "bank_tran_date": "20190910",
    "bank_code_tran": "097",
    "bank_rsp_code": "000",
    "bank_rsp_message": "",
    "fintech_use_num": "123456789012345678901234",
    "account_alias": "급여계좌",
    "bank_code_std": "097",
    "bank_code_sub": "1230001",
    "bank_name": "오픈은행",
    "account_num_masked": "000-1230000-***",
    "print_content": "출금계좌인자내역",
    "account_holder_name": "홍길동",
    "tran_amt": "10000",
    "wd_limit_remain_amt": "9990000"
  }
  const toymd = getYmd(new Date()) ;
  rsps.api_tran_dtm = toymd;
  rsps.bank_tran_date = toymd.substring(0,8);
  rsps.fintech_use_num = req.body.fintech_use_num ;
  rsps.tran_amt = req.body.tran_amt ;
  
  res.json(rsps) ;
});

export default router;
