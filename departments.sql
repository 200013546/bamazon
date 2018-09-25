DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `department_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `department_name` varchar(45) NOT NULL,
  `over_head_costs` int(10) unsigned NOT NULL,
  PRIMARY KEY (`department_id`)
);

