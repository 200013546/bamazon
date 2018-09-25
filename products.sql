DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `item_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(10) unsigned NOT NULL,
  `product_sales` decimal(10,2) NOT NULL,
  `department_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`item_id`)
);
