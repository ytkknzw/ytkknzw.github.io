"use strict";

var dat = [
  {"id":20,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"\u95a2\u897f\u7269\u6d41","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600312","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b \u95a2\u897f\u7269\u6d41\u30bb\u30f3\u30bf\u30fc","responsive_cost_center":"E160","serial_number":"600312","inventory_number":"600312 0000","quantity":"0","unit":"PC","inventory":"\u95a2\u897f\u7269\u6d41\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2000-08-31","inventory_date":null},
  {"id":21,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"","structure_text":"","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"","municipality_text":"","place":"","room":"\u4f7f\u7528\u4e0d\u53ef","asset_class_code":"AFTOOL1","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u539f\u4fa1)","asset_code":"600118","asset_sub":"0000","asset_text":"\u4f7f\u7528\u4e0d\u53ef","responsive_cost_center":"E160","serial_number":"600118","inventory_number":"600118 0000","quantity":"0","unit":"PC","inventory":"","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":"2015-07-27"},
  {"id":22,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"","structure_text":"","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"","municipality_text":"","place":"","room":"\u4f7f\u7528\u4e0d\u53ef","asset_class_code":"AFTOOL1","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u539f\u4fa1)","asset_code":"600119","asset_sub":"0000","asset_text":"\u4f7f\u7528\u4e0d\u53ef","responsive_cost_center":"E160","serial_number":"600119","inventory_number":"600119 0000","quantity":"0","unit":"PC","inventory":"","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":"2015-07-27"},
  {"id":23,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"","structure_text":"","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"","municipality_text":"","place":"","room":"\u4f7f\u7528\u4e0d\u53ef","asset_class_code":"AFTOOL1","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u539f\u4fa1)","asset_code":"600120","asset_sub":"0000","asset_text":"\u4f7f\u7528\u4e0d\u53ef","responsive_cost_center":"E160","serial_number":"600120","inventory_number":"600120 0000","quantity":"0","unit":"PC","inventory":"","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":null},
  {"id":24,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"","structure_text":"","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"","municipality_text":"","place":"","room":"\u4f7f\u7528\u4e0d\u53ef","asset_class_code":"AFTOOL1","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u539f\u4fa1)","asset_code":"600121","asset_sub":"0000","asset_text":"\u4f7f\u7528\u4e0d\u53ef","responsive_cost_center":"E160","serial_number":"600121","inventory_number":"600121 0000","quantity":"0","unit":"PC","inventory":"","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":"2015-07-27"},
  {"id":25,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"\u65b0\u6f5f\u8ca9\u58f2","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600310","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b \u65b0\u6f5f\u8ca9\u58f2","responsive_cost_center":"E160","serial_number":"600310","inventory_number":"600310 0000","quantity":"0","unit":"PC","inventory":"\u65b0\u6f5f\u8ca9\u58f2","shelf":"X","checked":"","char30k":"","capitalize_date":"2000-08-31","inventory_date":"2015-07-27"},
  {"id":26,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"\u4e2d\u90e8\u8ca9\u58f2","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600315","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b \u4e2d\u90e8\u8ca9\u58f2","responsive_cost_center":"E160","serial_number":"600315","inventory_number":"600315 0000","quantity":"0","unit":"PC","inventory":"\u4e2d\u90e8\u8ca9\u58f2","shelf":"X","checked":"","char30k":"","capitalize_date":"2000-08-31","inventory_date":"2015-07-27"},
  {"id":27,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600714","asset_sub":"0000","asset_text":"\u751f\u7523BO\u5411\u3051\u958b\u767a\u30b5\u30fc\u30d0\u30fc (DL320)","responsive_cost_center":"E160","serial_number":"600714","inventory_number":"600714 0000","quantity":"1","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-02-28","inventory_date":null},
  {"id":28,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600715","asset_sub":"0000","asset_text":"ILF\u30b5\u30fc\u30d0\u30fc\u30ea\u30d7\u30ec\u30fc\u30b9\u672c\u756a\u6a5f HW","responsive_cost_center":"E160","serial_number":"600715","inventory_number":"600715 0000","quantity":"1","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-02-28","inventory_date":"2015-07-27"},
  {"id":29,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600727","asset_sub":"0000","asset_text":"\uff32\uff13\u30b5\u30fc\u30d0\u30fc","responsive_cost_center":"E160","serial_number":"600727","inventory_number":"600727 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-04-30","inventory_date":null},
  {"id":30,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600767","asset_sub":"0000","asset_text":"\u30a6\u30a4\u30eb\u30b9\u30d0\u30b9\u30bf\u30fc\u7528\u30b5\u30fc\u30d0 \uff12\u5f0f","responsive_cost_center":"E160","serial_number":"600767","inventory_number":"600767 0000","quantity":"0","unit":"PC","inventory":"NRI\u3068\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-09-30","inventory_date":"2016-01-29"},
  {"id":31,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600768","asset_sub":"0000","asset_text":"\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u6a5f\u5668 Catalyst3750 \uff12\u53f0","responsive_cost_center":"E160","serial_number":"600768","inventory_number":"600768 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-09-30","inventory_date":"2015-07-27"},
  {"id":32,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600769","asset_sub":"0000","asset_text":"\u5370\u7ae0\u6a5f\u30fb\u958b\u767a\u6a5f TS3200 \uff83\uff70\uff8c\uff9f\uff65\uff97\uff72\uff8c\uff9e\uff97\uff98\uff70 AS400\u7528","responsive_cost_center":"E160","serial_number":"600769","inventory_number":"600769 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-09-30","inventory_date":"2015-07-27"},
  {"id":33,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z008","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600770","asset_sub":"0000","asset_text":"\u5370\u7ae0\u6a5f\u30b5\u30fc\u30d0 \u5370\u7ae0\u7528AS400","responsive_cost_center":"E160","serial_number":"600770","inventory_number":"600770 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-09-30","inventory_date":"2015-07-27"},
  {"id":34,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z008","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600771","asset_sub":"0000","asset_text":"\u958b\u767a\u6a5f\u30b5\u30fc\u30d0 \u958b\u767a\u7528AS400","responsive_cost_center":"E160","serial_number":"600771","inventory_number":"600771 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-09-30","inventory_date":"2015-07-27"},
  {"id":35,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600780","asset_sub":"0000","asset_text":"\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\u30e9\u30c3\u30af(NRI\uff83\uff9e\uff70\uff80\uff7e\uff9d\uff80\uff70\u8a2d\u7f6e)","responsive_cost_center":"E160","serial_number":"600780","inventory_number":"600780 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-10-31","inventory_date":"2015-07-27"},
  {"id":36,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600804","asset_sub":"0000","asset_text":"\u30cf\u30fc\u30c9\u30a6\u30a7\u30a2\u6a5f\u5668 [73P8022]\uff83\uff9e\uff68\uff7d\uff78\uff65\uff84\uff9e\uff97\uff72\uff8c\uff9e 10\u5f0f","responsive_cost_center":"E160","serial_number":"600804","inventory_number":"600804 0000","quantity":"10","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-03-31","inventory_date":"2015-07-27"},
  {"id":37,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600820","asset_sub":"0000","asset_text":"KEL\uff84\uff9e\uff6f\uff84\uff72\uff9d\uff8a\uff9f\uff78\uff84\uff8c\uff9f\uff98\uff9d\uff80\uff70 CD180FI \u2461","responsive_cost_center":"E160","serial_number":"600820","inventory_number":"600820 0000","quantity":"0","unit":"PC","inventory":"\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-06-30","inventory_date":"2015-07-27"},
  {"id":38,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600936","asset_sub":"0000","asset_text":"\uff32\uff13\u672c\u756a\u6a5f CPU \uff92\uff93\uff98\uff70\u8ffd\u52a0","responsive_cost_center":"E160","serial_number":"600936","inventory_number":"600936 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-06-30","inventory_date":null},
  {"id":39,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600937","asset_sub":"0000","asset_text":"\uff32\uff13\u672c\u756a\u6a5f Disk\u8ffd\u52a0","responsive_cost_center":"E160","serial_number":"600937","inventory_number":"600937 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-06-30","inventory_date":"2015-05-22"},
  {"id":40,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z010","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236  \u5e73\u621020\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600938","asset_sub":"0000","asset_text":"\uff32\uff13\u958b\u767a\u6a5f","responsive_cost_center":"E160","serial_number":"600938","inventory_number":"600938 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-06-30","inventory_date":"2015-07-27"},
  {"id":41,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600998","asset_sub":"0000","asset_text":"\uff7e\uff9d\uff80\uff70\uff88\uff6f\uff84\uff9c\uff70\uff78\u901a\u4fe1\u6a5f\u5668 Catalyst3750,Cisco2851","responsive_cost_center":"E160","serial_number":"600998","inventory_number":"600998 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e\u3001NRI\uff83\uff9e\uff70\uff80","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-12-31","inventory_date":"2015-07-27"},
  {"id":42,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601299","asset_sub":"0000","asset_text":"\u751f\u7523\u7cfb\u30b5\u30fc\u30d0\u30fc\u3000\u4e00\u5f0f","responsive_cost_center":"E160","serial_number":"601299","inventory_number":"601299 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-12-31","inventory_date":null},
  {"id":43,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601300","asset_sub":"0000","asset_text":"\u751f\u7523\u7cfb\u30b5\u30fc\u30d0\u30fc Flex-10\uff93\uff7c\uff9e\uff6d\uff70\uff99","responsive_cost_center":"E160","serial_number":"601300","inventory_number":"601300 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-12-31","inventory_date":null},
  {"id":44,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"626171","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601262","asset_sub":"0000","asset_text":"\u65b0\u8ca9\u58f2\u7cfb\u30b5\u30fc\u30d0\u30ea\u30d7\u30ec\u30fc\u30b9\u672c\u756a\u6a5f","responsive_cost_center":"E160","serial_number":"601262","inventory_number":"601262 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-02-29","inventory_date":"2016-01-29"},
  {"id":45,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"626174","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601272","asset_sub":"0000","asset_text":"\u4eee\u60f3\u5316Notes\u30b5\u30fc\u30d0\u30fc","responsive_cost_center":"E160","serial_number":"601272","inventory_number":"601272 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-04-30","inventory_date":null},
  {"id":46,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"626440","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601251","asset_sub":"0000","asset_text":"\u8ca9\u58f2\u30b5\u30fc\u30d0\u30ea\u30d7\u30ec\u30fc\u30b9\u958b\u767a\u6a5f\u30cf\u30fc\u30c9\u30a6\u30a7\u30a2","responsive_cost_center":"E160","serial_number":"601251","inventory_number":"601251 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2011-12-31","inventory_date":"2016-01-29"},
  {"id":47,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"627200","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601295","asset_sub":"0000","asset_text":"\uff32\uff13\u30b5\u30fc\u30d0\u30ea\u30d7\u30ec\u30a4\u30b9\u30cf\u30fc\u30c9\u30a6\u30a8\u30a2","responsive_cost_center":"E160","serial_number":"601295","inventory_number":"601295 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-09-30","inventory_date":null},
  {"id":48,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"627280","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601287","asset_sub":"0000","asset_text":"\uff32\uff13 \u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u958b\u767a\u6a5f\u5897\u5f37","responsive_cost_center":"E160","serial_number":"601287","inventory_number":"601287 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-08-31","inventory_date":null},
  {"id":49,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"627361","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601291","asset_sub":"0000","asset_text":"SPIRIT\u751f\u7523\u30ea\u30d7\u30ec\u30a4\u30b9\u30d7\u30ea\u30f3\u30bf\u30fc RICOH 5577-H05","responsive_cost_center":"E160","serial_number":"601291","inventory_number":"601291 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2012-09-30","inventory_date":null},
  {"id":50,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"H101","lend_to_text":"\u4e09\u83f1\u925b\u7b46\u6771\u4eac\u8ca9\u58f2(\u682a)","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600871","asset_sub":"0000","asset_text":"\u30e2\u30d0\u30a4\u30eb\u30d1\u30bd\u30b3\u30f3\u6771\u8ca9 CF-W5WDAXS\u677e\u4e0bLet's noteCF-W5","responsive_cost_center":"E160","serial_number":"600871","inventory_number":"600871 0000","quantity":"0","unit":"PC","inventory":"\u6771\u4eac\u8ca9\u58f2","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-11-30","inventory_date":null},
  {"id":51,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"H101","lend_to_text":"\u4e09\u83f1\u925b\u7b46\u6771\u4eac\u8ca9\u58f2(\u682a)","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"624789","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601240","asset_sub":"0000","asset_text":"\u4e09\u83f1\u925b\u7b46\u6771\u4eac\u8ca9\u58f2\u5411\u3051 Panasonic Let's note CF-S9","responsive_cost_center":"E160","serial_number":"601240","inventory_number":"601240 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2011-11-30","inventory_date":null},
  {"id":52,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"H401","lend_to_text":"\u4e09\u83f1\u925b\u7b46\u4e2d\u56fd\u8ca9\u58f2(\u682a)","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"\u4e2d\u56fd\u8ca9\u58f2","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600311","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b \u4e2d\u56fd\u8ca9\u58f2","responsive_cost_center":"E160","serial_number":"600311","inventory_number":"600311 0000","quantity":"0","unit":"PC","inventory":"\u4e2d\u56fd\u8ca9\u58f2","shelf":"X","checked":"","char30k":"","capitalize_date":"2000-08-31","inventory_date":null},
  {"id":53,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z008","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"","office_text":"","lend_to_code":"J720","lend_to_text":"(\u682a)\u30e6\u30cb\u7269\u6d41","municipality_code":"10","municipality_text":"\u6771\u4eac\u90fd\u6c5f\u6771\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600778","asset_sub":"0000","asset_text":"\uff34\uff32\uff23\u30b5\u30fc\u30d0","responsive_cost_center":"E160","serial_number":"600778","inventory_number":"600778 0000","quantity":"0","unit":"PC","inventory":"\uff34\uff32\uff23","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-10-31","inventory_date":null},
  {"id":54,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600125","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b BL3000\u5de5\u4e8b\u8cbb\uff08\u6a2a\u6d5c\u4e8b\u696d\u6240)","responsive_cost_center":"E160","serial_number":"600125","inventory_number":"600125 0000","quantity":"0","unit":"PC","inventory":"\u6a2a\u6d5c\u4e8b\u696d\u6240","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":null},
  {"id":55,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z005","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621016\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"","lend_to_text":"","municipality_code":"1","municipality_text":"\u6a2a\u6d5c\u5e02\u795e\u5948\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600620","asset_sub":"0000","asset_text":"xSeries236  2\u53f0 (IT\u7a0e\u5236\u9069\u7528)","responsive_cost_center":"E160","serial_number":"600620","inventory_number":"600620 0000","quantity":"2","unit":"PC","inventory":"\u7fa4\u99ac\u3068\u6a2a\u6d5c\uff11\u53f0","shelf":"X","checked":"","char30k":"","capitalize_date":"2004-12-31","inventory_date":null},
  {"id":56,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"","lend_to_text":"","municipality_code":"1","municipality_text":"\u6a2a\u6d5c\u5e02\u795e\u5948\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600686","asset_sub":"0000","asset_text":"HP NAS\uff7b\uff70\uff8a\uff9e\uff70(\u6a2a\u6d5c) [371124-B21]Proliant DL380","responsive_cost_center":"E160","serial_number":"600686","inventory_number":"600686 0000","quantity":"0","unit":"PC","inventory":"\u6a2a\u6d5c\u4e8b\u696d\u6240","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-01-31","inventory_date":null},
  {"id":57,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"","lend_to_text":"","municipality_code":"1","municipality_text":"\u6a2a\u6d5c\u5e02\u795e\u5948\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600708","asset_sub":"0000","asset_text":"SPIRIT\u751f\u7523\uff98\uff8c\uff9f\uff9a\uff70\uff7d FaxPress SBE\u672c\u4f53","responsive_cost_center":"E160","serial_number":"600708","inventory_number":"600708 0000","quantity":"0","unit":"PC","inventory":"\u6a2a\u6d5c\u4e8b\u696d\u6240","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-02-28","inventory_date":null},
  {"id":58,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"","lend_to_text":"","municipality_code":"1","municipality_text":"\u6a2a\u6d5c\u5e02\u795e\u5948\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600728","asset_sub":"0000","asset_text":"\u751f\u7523\u7cfb\uff26\uff21\uff38\u30b5\u30fc\u30d0\u30fc","responsive_cost_center":"E160","serial_number":"600728","inventory_number":"600728 0000","quantity":"0","unit":"PC","inventory":"\u6a2a\u6d5c\u4e8b\u696d\u6240","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-04-30","inventory_date":null},
  {"id":59,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z006","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621017\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"A","office_text":"\u6a2a\u6d5c\u4e8b\u52d9\u6240","lend_to_code":"4517","lend_to_text":"\uff08\u682a\uff09\u91ce\u6751\u7dcf\u5408\u7814\u7a76\u6240","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600663","asset_sub":"0000","asset_text":"\u95a2\u9023\u5b50\u4f1a\u793eNotes\u30b5\u30fc\u30d0\u30fc[8840PJS]xSeries346","responsive_cost_center":"E160","serial_number":"600663","inventory_number":"600663 0000","quantity":"0","unit":"PC","inventory":"NRI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf","shelf":"X","checked":"","char30k":"","capitalize_date":"2005-06-30","inventory_date":null},
  {"id":60,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"B","office_text":"\u5c71\u5f62\u5de5\u5834","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600123","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b BL3000\u5de5\u4e8b\u8cbb\uff08\u5c71\u5f62\u5de5\u5834\uff09","responsive_cost_center":"E160","serial_number":"600123","inventory_number":"600123 0000","quantity":"0","unit":"PC","inventory":"\u5c71\u5f62\u5de5\u5834","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":null},
  {"id":61,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z008","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"B","office_text":"\u5c71\u5f62\u5de5\u5834","lend_to_code":"","lend_to_text":"","municipality_code":"2","municipality_text":"\u5c71\u5f62\u770c\u5ddd\u897f\u753a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600777","asset_sub":"0000","asset_text":"\u5c71\u5f62\u30d5\u30a1\u30a4\u30eb\u30b5\u30fc\u30d0[AE437A]DL100 G2 SS 1TB","responsive_cost_center":"E160","serial_number":"600777","inventory_number":"600777 0000","quantity":"0","unit":"PC","inventory":"\u5c71\u5f62\u5de5\u5834","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-10-31","inventory_date":null},
  {"id":62,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z009","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621019\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"B","office_text":"\u5c71\u5f62\u5de5\u5834","lend_to_code":"","lend_to_text":"","municipality_code":"2","municipality_text":"\u5c71\u5f62\u770c\u5ddd\u897f\u753a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600855","asset_sub":"0000","asset_text":"\u5c71\u5f62Notes\u30b5\u30fc\u30d0\u30fc","responsive_cost_center":"E160","serial_number":"600855","inventory_number":"600855 0000","quantity":"0","unit":"PC","inventory":"\u5c71\u5f62\u5de5\u5834","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-09-30","inventory_date":null},
  {"id":63,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"C","office_text":"\u7fa4\u99ac\u5de5\u5834","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600124","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b BL3000\u5de5\u4e8b\u8cbb\uff08\u7fa4\u99ac\u5de5\u5834\uff09","responsive_cost_center":"E160","serial_number":"600124","inventory_number":"600124 0000","quantity":"0","unit":"PC","inventory":"\u7fa4\u99ac\u5de5\u5834","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":null},
  {"id":64,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z007","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"C","office_text":"\u7fa4\u99ac\u5de5\u5834","lend_to_code":"","lend_to_text":"","municipality_code":"3","municipality_text":"\u7fa4\u99ac\u770c\u85e4\u5ca1\u5e02","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600687","asset_sub":"0000","asset_text":"HP NAS\uff7b\uff70\uff8a\uff9e\uff70(\u7fa4\u99ac) [371124-B21]Proliant DL380","responsive_cost_center":"E160","serial_number":"600687","inventory_number":"600687 0000","quantity":"0","unit":"PC","inventory":"\u7fa4\u99ac\u5de5\u5834","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-01-31","inventory_date":null},
  {"id":65,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5B","structure_text":"\u5668\u5177\u96fb\u5b50\u8a08\u7b97\u6a5f\u30fb\uff2c\uff21\uff2e\u8a2d\u50996\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600126","asset_sub":"0000","asset_text":"\uff2c\uff21\uff2e\u5de5\u4e8b BL3000\u5de5\u4e8b\u8cbb\uff08\u672c\u793e\uff09","responsive_cost_center":"E160","serial_number":"600126","inventory_number":"600126 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"1999-04-30","inventory_date":null},
  {"id":66,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z006","structure_text":"IT\u4fc3\u9032\u7a0e\u5236\u9069\u7528 \u5e73\u621017\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600684","asset_sub":"0000","asset_text":"AS400\u707d\u5bb3\u5bfe\u7b56\u7528\u30b5\u30fc\u30d0\u30fc\uff12\u53f0","responsive_cost_center":"E160","serial_number":"600684","inventory_number":"600684 0000","quantity":"2","unit":"PC","inventory":"\u672c\u793e\u5185","shelf":"X","checked":"","char30k":"","capitalize_date":"2005-12-31","inventory_date":null},
  {"id":67,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z008","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621018\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600776","asset_sub":"0000","asset_text":"\u672c\u793e\u30d5\u30a1\u30a4\u30eb\u30b5\u30fc\u30d0[AE450A]DL380 G4 SS 1.2TB-SCSI","responsive_cost_center":"E160","serial_number":"600776","inventory_number":"600776 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e\uff12\u53f7\u68df\uff11\u968e","shelf":"X","checked":"","char30k":"","capitalize_date":"2006-10-31","inventory_date":"2016-01-29"},
  {"id":68,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5F","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u901a\u4fe1\u8a2d\u50995\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600814","asset_sub":"0000","asset_text":"\u30b5\u30fc\u30d0\u30fc\u30b3\u30f3\u30bd\u30fc\u30eb (\uff75\uff8c\uff9e\uff98\uff95\uff86\uff8b\uff9e\uff99)","responsive_cost_center":"E160","serial_number":"600814","inventory_number":"600814 0000","quantity":"0","unit":"PC","inventory":"\uff75\uff8c\uff9e\uff98\uff95\uff86\uff8b\uff9e\uff99 ITC","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-05-31","inventory_date":null},
  {"id":69,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600847","asset_sub":"0000","asset_text":"\u8ca9\u58f2\u4f1a\u793e\u30eb\u30fc\u30bf Catalyst2960.Cisco2801.Cisco1841","responsive_cost_center":"E160","serial_number":"600847","inventory_number":"600847 0000","quantity":"0","unit":"PC","inventory":"\u8ca9\u58f2\u4f1a\u793e\uff15\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-08-31","inventory_date":null},
  {"id":70,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z009","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621019\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600854","asset_sub":"0000","asset_text":"\uff33\uff33\uff11\u7528\u30b5\u30fc\u30d0\u30fc","responsive_cost_center":"E160","serial_number":"600854","inventory_number":"600854 0000","quantity":"0","unit":"PC","inventory":"\uff75\uff8c\uff9e\uff98\uff95\uff86\uff8b\uff9e\uff992\u968e","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-09-30","inventory_date":null},
  {"id":71,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600869","asset_sub":"0000","asset_text":"SPIRIT\u8ca9\u58f2\u7528\u30c9\u30c3\u30c8\u30d7\u30ea\u30f3\u30bf\u30fcCD180FI \uff15\uff11\u53f0","responsive_cost_center":"E160","serial_number":"600869","inventory_number":"600869 0000","quantity":"0","unit":"PC","inventory":"\u8ca9\u58f2\u4f1a\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-11-30","inventory_date":null},
  {"id":72,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600870","asset_sub":"0000","asset_text":"SPIRIT\u30a4\u30f3\u30d1\u30af\u30c8\u30d7\u30ea\u30f3\u30bf\u30fcCD180 \uff14\uff15\u53f0","responsive_cost_center":"E160","serial_number":"600870","inventory_number":"600870 0000","quantity":"0","unit":"PC","inventory":"\u8ca9\u58f2\u4f1a\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-11-30","inventory_date":null},
  {"id":73,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"0","municipality_text":"\u7533\u544a\u5bfe\u8c61\u5916","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600880","asset_sub":"0000","asset_text":"SPIRIT\u8ca9\u58f2\u7528CD180I\uff8c\uff9f\uff98\uff9d\uff80\uff70 1\u53f0","responsive_cost_center":"E160","serial_number":"600880","inventory_number":"600880 0000","quantity":"0","unit":"PC","inventory":"","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-12-31","inventory_date":null},
  {"id":74,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600881","asset_sub":"0000","asset_text":"\u30d1\u30bd\u30b3\u30f3 Lets Note CF-W5 (\u55b6\u696d\u4f01\u753b\uff13\u53f0)","responsive_cost_center":"E160","serial_number":"600881","inventory_number":"600881 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e\u55b6\u696d\u4f01\u753b","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-12-31","inventory_date":null},
  {"id":75,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600882","asset_sub":"0000","asset_text":"\u30d1\u30bd\u30b3\u30f3 Lets Note CF-W5 (\uff8e\uff8b\uff9e\uff70\uff97 \uff11\u53f0)","responsive_cost_center":"E160","serial_number":"600882","inventory_number":"600882 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e\uff8e\uff8b\uff9e\uff70\uff97","shelf":"X","checked":"","char30k":"","capitalize_date":"2007-12-31","inventory_date":null},
  {"id":76,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z010","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236  \u5e73\u621020\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600972","asset_sub":"0000","asset_text":"Notes Domino \uff7b\uff70\uff8a\uff9e\uff70 HP DL-380G5","responsive_cost_center":"E160","serial_number":"600972","inventory_number":"600972 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-11-30","inventory_date":null},
  {"id":77,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"R5C","structure_text":"\u5668\u5177\u305d\u306e\u4ed6\u4e8b\u52d9\u6a5f\u56685\u5e74","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600997","asset_sub":"0000","asset_text":"\u4eba\u4e8bSOCIA CD570\uff97\uff72\uff9d\uff8c\uff9f\uff98\uff9d\uff80","responsive_cost_center":"E160","serial_number":"600997","inventory_number":"600997 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e\uff12\u53f7\u68df\uff11\u968e","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-12-31","inventory_date":null},
  {"id":78,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z011","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236\u3000\u5e73\u621021\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"601100","asset_sub":"0000","asset_text":"\u30af\u30ec\u30fc\u30e0\u30b7\u30b9\u30c6\u30e0\u7528\u30b5\u30fc\u30d0\u30fc DL380G6","responsive_cost_center":"E160","serial_number":"601100","inventory_number":"601100 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2009-12-31","inventory_date":"2016-01-29"},
  {"id":79,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z010","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236  \u5e73\u621020\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"620326","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600992","asset_sub":"0000","asset_text":"SOCIA WEB\uff7b\uff70\uff8a\uff9e HP DL380G5 DC XX5260","responsive_cost_center":"E160","serial_number":"600992","inventory_number":"600992 0000","quantity":"0","unit":"PC","inventory":"\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-11-30","inventory_date":"2015-12-04"},
  {"id":80,"pic":"pic01","ym":"201512","cost_center":"E160","plant":"","profit_center":"","structure_code":"Z010","structure_text":"\u60c5\u5831\u57fa\u76e4\u5f37\u5316\u7a0e\u5236  \u5e73\u621020\u5e74\u53d6\u5f97","product_category_code":"","product_category_txet":"","office_code":"E","office_text":"\u672c\u793e\u30fb\u30e6\u30cb\u30d3\u30eb","lend_to_code":"","lend_to_text":"","municipality_code":"5","municipality_text":"\u6771\u4eac\u90fd\u54c1\u5ddd\u533a","place":"","room":"620326","asset_class_code":"AFTOOL2","asset_class_text":"\u6709:\u5de5\u5177\u5668\u5177\u5099\u54c1(\u8ca9\u58f2)","asset_code":"600992","asset_sub":"0001","asset_text":"SOCIA DB \uff7b\uff70\uff8a\uff9e HP DL380G5 DC XX5260","responsive_cost_center":"E160","serial_number":"600992","inventory_number":"600992 0001","quantity":"0","unit":"PC","inventory":"\u672c\u793e","shelf":"X","checked":"","char30k":"","capitalize_date":"2008-11-30","inventory_date":"2015-12-04"}]

var texts = {
  'en': {
    'shared.btn-back': 'Back',
    'shared.btn-ok': 'OK',
    'shared.btn-yes': 'Yes',
    'shared.btn-no': 'No',
    'shared.btn-cancel': 'Cancel',
    'shared.btn-close': 'Close',
    'shared.btn-login': 'Log In',
    'shared.btn-add': 'Add',
    'shared.btn-save': 'Save',
    'login.title': 'Fixed Assets Check',
    'home.title': 'Home',
    'home.ym': 'Period',
    'home.progress': 'Progress',
    'home.signature': 'Signature',
    'home.lbl-done': 'Done',
    'home.lbl-notyet': 'Not Yet',
    'home.lbl-added': 'Added',
    'home.btn-list': 'Data List',
    'home.btn-addition': 'Addition',
    'home.btn-settings': 'Settings',
    'home.dlg-title': 'Log Out',
    'home.dlg-message': 'Are you sure?',
    'list.title': 'Data List (#)',
    'detail.title': 'Detail',
    'detail.d-01': 'Asset Class Code',
    'detail.d-02': 'Asset Class Text',
    'detail.d-03': 'Asset Code',
    'detail.d-04': 'Asset Text',
    'detail.d-05': 'Inventory Number',
    'detail.d-06': 'Inventory Date',
    'detail.d-07': 'Inventory Note',
    'detail.d-08': 'Quantity',
    'detail.d-09': 'Serial Number',
    'detail.d-10': 'Room',
    'detail.d-11': 'Description',
    'detail.dlg-title': 'Save Data',
    'detail.dlg-message': ' ',
    'detail.dlg-btn-reg': 'Done',
    'addition.title': 'Addition',
    'add-detail.title': 'Addition Detail',
    'add-detail.memo': 'Memo',
    'add-detail.picture': 'Picture',
    'add-detail.': '',
    'signature.title': 'Signature',
  },
  'ja': {
    'shared.btn-back': '戻る',
    'shared.btn-yes': 'はい',
    'shared.btn-no': 'いいえ',
    'shared.btn-ok': 'OK',
    'shared.btn-cancel': 'キャンセル',
    'shared.btn-close': '閉じる',
    'shared.btn-login': 'ログイン',
    'shared.btn-add': '追加',
    'shared.btn-save': '保存',
    'login.title': '固定資産管理',
    'home.title': 'ホーム',
    'home.ym': '期間',
    'home.progress': '進捗',
    'home.signature': 'サイン',
    'home.lbl-done': '完了',
    'home.lbl-notyet': '未完了',
    'home.lbl-added': '追加',
    'home.btn-list': 'データ一覧',
    'home.btn-addition': '追加データ',
    'home.btn-settings': '設定',
    'home.dlg-title': 'ログアウト',
    'home.dlg-message': 'よろしいですか?',
    'list.title': 'テータリスト (#)',
    'detail.title': 'データ詳細',
    'detail.d-01': '資産クラス',
    'detail.d-02': '資産クラス名',
    'detail.d-03': '資産',
    'detail.d-04': '資産テキスト',
    'detail.d-05': '棚卸資産番号',
    'detail.d-06': '最終棚卸日',
    'detail.d-07': '棚卸ノート',
    'detail.d-08': '数量',
    'detail.d-09': 'シリアル番号',
    'detail.d-10': '部屋',
    'detail.d-11': 'フリーテキスト',
    'detail.dlg-title': 'データ登録',
    'detail.dlg-message': ' ',
    'detail.dlg-btn-reg': '確認完了',
    'addition.title': '追加データ',
    'add-detail.title': '追加データ詳細',
    'add-detail.memo': 'メモ',
    'add-detail.picture': '写真',
    'add-detail.': '',
    'signature.title': 'サイン',
  }
};
var el = function(key){ return document.getElementById(key); };

var app = {

  data_root : 'https://localhost',
  locale : 'ja',
  texts  : {},
  pic : '',
  periods: ['201612', '201512', '201412'],
  period : '',
  data   : dat, //[],
  data_index: -1,
  addition_data: [],
  addition_index : -1,

  pages : ['login'],
  current : 'login',
  isAnimating : false,
  endCurrPage : false,
  endNextPage : false,

  gotoPage : function (pageId) {
    if(pageId == 'period') app.initPeriod();
    else if(pageId == 'list') app.initList();
    else if(pageId == 'detail') app.initDetail();
    var current = app.pages[app.pages.length - 1];
    app.moveTo(current, pageId, false);
    app.pages.push(pageId);
  },
  goBack : function() {
    var currPage = app.pages[app.pages.length - 1];
    var nextPage = app.pages[app.pages.length - 2];
    app.moveTo(currPage, nextPage, true);
    app.pages.pop();
  },

  moveTo : function(currPage, nextPage, isBack) {
    if( app.isAnimating ) return;
    app.isAnimating = true;
    var $currPage = $('#' + currPage);
    var $nextPage = $('#' + nextPage).addClass('page-current');
    var onEndAnimation = function ( $outpage, $inpage ) {
      app.endCurrPage = false;
      app.endNextPage = false;
      $outpage.attr('class', $outpage.data('originalClassList'));
      $inpage .attr('class', $inpage .data('originalClassList') + ' page-current');
      app.isAnimating = false;
    };
    $currPage.addClass(isBack ? 'to-right' : 'to-left').on('animationend', function() {
      $currPage.off('animationend');
      app.endCurrPage = true;
      if(app.endNextPage) onEndAnimation($currPage, $nextPage);
    });
    $nextPage.addClass(isBack ? 'from-left' : 'from-right').on('animationend', function() {
      $nextPage.off('animationend');
      app.endNextPage = true;
      if(app.endCurrPage) onEndAnimation($currPage, $nextPage);
    });
  },

  changeLocale : function(locale) {
    app.locale = locale;
    app.texts = texts[locale];
    app.setTexts();
  },
  setTexts : function() {
    $('[text]').each(function(){
      var $el = $(this);
      var key = $el.attr('text');
      $el.html(app.texts[key]);
      // console.log(key, app.texts[key]);
    });
  },
  showDialog  : function(id) {
    $('#dialog-base')
      .html(el(id).innerHTML)
      .css({'display': 'block'});
  },
  closeDialog : function() {
    $('#dialog-base')
      .html('')
      .css({'display': 'none'});
  },
  // login page
  login : function() {
    alert();
    app.gotoPage('home');
    // $.ajax({
    //   url: app.data_root + '/api/fac/client/authenticate',
    //   method: 'POST',
    //   data: {
    //     account: $('#pic input').val(),
    //     password: $('#password input').val()
    //   }
    // })
    // .done(function(dat, b, c){
    //   app.periods = [];
    //   dat.forEach(function(row){
    //     app.periods.push(row.ym);
    //   });
    //   app.pic = $('#pic input').val();
    //   app.gotoPage('home');
    // })
    // .fail(function(a, b, c){
    //   console.log(a, b, c);
    //   ons.notification.alert({
    //     title: 'Log in Failed',
    //     message: 'check account and/or password again'
    //   });
    // })
    // .always(function(){

    // });
  },
  // period list page
  initPeriod : function() {
    var h = '', p;
    for(var i=0, ii=app.periods.length; i<ii; i++){
      p = app.periods[i];
      h +='<li class="item" tappable onclick="app.changePeriod(' + p + ')">' + p + '</li>';
    }
    el('list-period').innerHTML = h;
  },
  changePeriod : function(p) {
    app.period = p;
    console.log(app.period, app.pic);
    $.ajax(app.data_root + '/api/fac/' + app.period + '/' + app.pic)
    .fail(function(err, dat) {
      console.log('load page error', err, dat);
    })
    .done(function(html, res, req) {
      console.log('data', html);
      app.data = html;
      $('#ym').html(app.period);
      app.drawChart();
      app.goBack();
    })
    .always(function() {
      // for dev and demo
      app.drawChart();
      app.goBack();
    });
  },
  // home page
  logout : function() {
    app.closeDialog();
    app.goBack();
  },
  drawChart : function() {
    var conf = {
        type: ['bar','line','pie','doughnut'][3],
        data: {
            labels: [
              app.texts['home.lbl-done'],
              app.texts['home.lbl-notyet'],
              app.texts['home.lbl-added']
            ],
            datasets: [{
                label: 'data count',
                data: [
                  Math.ceil(app.data.length*2/3),
                  Math.floor(app.data.length/3),
                  app.addition_data.length
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54,162,235,1)',
                    'rgba(255,206,86,1)'
                ],
                borderWidth: 1
            }]
        }
    };
    new Chart(document.getElementById("myChart"), conf);
  },
  after_decode : function() {
    var len = el('decoded-str').value.length;
    console.log(len);
    if(len > 11) {
      var key = 'K830451-0000';
      app.searchData(key);
    }
  },
  // list page
  initList : function () {
    var h = '';
    for(var i=0, ii=app.data.length; i<ii; i++){
      var d = app.data[i];
      h+='<li class="item">' + 
        '<b>' + d.inventory_number + '</b>&nbsp; &nbsp; ' +
        '<span>' + d.quantity + ' ' + d.unit + '</span> &nbsp;' +
        '<span>' + (d.inventory_date ? d.inventory_date : '') + '</span>' +
        '<span style="color: #999;">' + d.asset_class_code + ' </span>' +
        '<span>&nbsp; &nbsp;' + d.char30k + '</span>' +
      '</li>';
    }
    el('list-data').innerHTML = h;
    $('.item').on('click', function(a,b,c){
      var index = $('.item').index(this);
      console.log(a,this,index);
      app.data_index = index;
      app.gotoPage('detail');
    });

    var $target = $('#list-title');
    console.log($target);
    var str = $target.html();
    $target.html(str.replace('#', app.data.length));
  },
  updateList : function() {
    var index = app.data_index;
    var d = app.data[index];
    var h = '<b>' + d.inventory_number + '</b>&nbsp; &nbsp; ' +
        '<span>' + d.quantity + ' ' + d.unit + '</span> &nbsp;' +
        '<span>' + (d.inventory_date ? d.inventory_date : '') + '</span>' +
        '<span style="color: #999;">' + d.asset_class_code + ' </span>' +
        '<span>&nbsp; &nbsp;' + d.char30k + '</span>';
    $('#list-data').children().eq(index).html(h);
    console.log(index, d, h);
  },
  searchData : function() {
    var key = 'K830451-0000';
    var i;
    // search data that matches the decoded text
    var found = app.data.filter(function(dat, index){
      if (key == dat.asset_code + '-' + dat.asset_sub){
        i = index;
        return true;
      }
      return false;
    });
    console.log(found);
    // navigate to detail page
    if(found.length == 1) {
      app.data_index = i;
      nav.pushPage('detail.html', {data:app.data[i]});
    } else {
      ons.notification.alert({
        title : 'Data Search',
        message : (found.length == 0 ? 'Not Found' : 'Multiple Data')
      });
    }
  },
  showDetail: function(i) {
    app.data_index = i;
    app.data_target = JSON.parse(JSON.stringify(app.data[i]));
    app.gotoPage('detail');
  },
  // detail page
  initDetail : function() {
    var d = app.data[app.data_index];
    el('d-01').innerHTML = d.asset_class_code;
    el('d-02').innerHTML = d.asset_class_text;
    el('d-03').innerHTML = d.asset_code;
    el('d-04').innerHTML = d.asset_text;
    el('d-05').innerHTML = d.inventory_number;
    el('d-06').innerHTML = d.inventory_date;
    el('d-07').innerHTML = d.inventory;
    el('d-08').innerHTML = d.quantity + ' ' + d.unit;
    el('d-09').innerHTML = d.serial_number;
    el('d-10').innerHTML = d.room;
    el('d-11').innerHTML = d.char30k;
  },
  showFreeText : function() {
    app.showDialog('dialog-free-text');
    $('#dialog-base #free-text').val(el('d-11').innerHTML);
  },
  copyFreeText : function() {
    el('d-11').innerHTML = $('#dialog-base #free-text').val();
    app.closeDialog();
  },
  confirmData : function() {
    var getISODate = function(){
      var t = new Date(),
        y = t.getFullYear(),
        m = t.getMonth() + 1,
        d = t.getDate();
      return '' + y + '-' + (m<10 ? '0' : '') + m + '-' + (d<10 ? '0' : '') + d;
    };
    var target = app.data[app.data_index];
    target.inventory_date = getISODate();
    target.char30k = el('d-11').innerHTML;
    console.log(target);
    app.updateList();
    app.closeDialog();
    // app.initList();
    app.goBack();
  },
  // addition page
  handlePicture : function(file) {
    console.log(file);
    if(file){
      var name = file.name,
          size = Math.round(file.size/1024) + ' kb',
          demension = '',
          str = 'Name: ' + name + '<br/>Size: ' + size + '<br/>Demension: ';
      el('btn-take-photo').style.display = 'none';
      el('btn-remove-photo').style.display = 'block';
      var img = el('picture');
      img.onload = function () {
        str += 'w:' + img.width + " h:" + img.height;
        el('picture-prop').innerHTML = str;
      };
      img.src = URL.createObjectURL(file);
    }
  },
  removePhoto : function() {
      el('file').value = '';
      el('btn-take-photo').style.display = 'block';
      el('btn-remove-photo').style.display = 'none';
      el('picture-prop').innerHTML = '';
      el('picture').src = '';
  },
  saveAddition : function() {
    // format request body
    var file = null;
    var fd = new FormData();
    fd.append('memo', el('memo').value);
    fd.append('file', file);
    // send data to server then get thumbnail in callback
    $.ajax({
      url: '',
      method: 'POST',
      dataType : 'text',
      data : fd,
      processData : false,
      contentType : false,
    })
    .fail(function(err, b, c) {
      console.log(err,b,c);
      ons.notification.alert({
        title: 'Error',
        message: '' + err.status + ' ' + c
      });
    })
    .done(function(a, b, c) {
      app.removePhoto();
      app.goBack();
    })
    .always(function(a, b, c) {
    });
  },
  compressImage : function(img) {
    var tmp = {}
    tmp.canvas = document.createElement('canvas');
    var MAX_WIDTH = 800;
    var MAX_HEIGHT = 600;
    var width = img.width;
    var height = img.height;
    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    tmp.canvas.width = width;
    tmp.canvas.height = height;
    // el_scale.innerHTML = 'w:' + width + ' h:' + height;

    var ctx = tmp.canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    var imgData = ctx.createImageData(width, height);
    var pixels  = ctx.getImageData(0, 0, width, height);
    var data = imgData.data;

    for (var i = 0, l = pixels.data.length; i < l; i += 4) {
      var r = pixels.data[i + 0];
      var g = pixels.data[i + 1];
      var b = pixels.data[i + 2];
      data[i + 0] = (r * .393) + (g *.769) + (b * .189);
      data[i + 1] = (r * .349) + (g *.686) + (b * .168);
      data[i + 2] = (r * .272) + (g *.534) + (b * .131);
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    var dataurl = tmp.canvas.toDataURL("image/png");
    // console.log(imgData, pixels, dataurl);
    delete tmp.canvas;
    return dataurl;
    // e = Date.now();
    // el_time.innerHTML = (e-s) + ' ms';
    // el_resize.innerHTML = Math.round(dataurl.length/1024) + ' kb';
  }
};



app.changeLocale('ja');

var $pages = $('section');
$pages.each( function() {
  var $page = $( this );
  $page.data('originalClassList', $page.attr('class'));
  if($page.attr('id')==app.current) $page.addClass('page-current');
});

var $backBtns = $('.btn-back');
$backBtns.each(function(){
  console.log(this);
  $(this).on('click', app.goBack);
});

// for demo
// var h = '';
// for(var i=0; i<999; i++) {
//   h += '<li class="item">' + i + '</li>';
// }
// $('#list-data').html(h);
// $('.item').on('click', function(a,b,c){
//   var index = $('.item').index(this);
//   console.log(a,this,index);
//   app.gotoPage('detail');
// });

// function addEL(event, target, func) {
//   el(target).addEventListener(event, func, false);
// }

// addEL('click', 'locale', app.changeLocale);
// addEL('click', 'shared.btn-login', app.login);
// addEL('click', 'locale', app.changeLocale);
// addEL('click', 'locale', app.changeLocale);
// addEL('click', 'locale', app.changeLocale);





