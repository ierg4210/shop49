CREATE TABLE categories (
catid
INTEGER PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(512) NOT NULL
) ENGINE=INNODB; 

CREATE TABLE products (
pid
INTEGER PRIMARY KEY AUTO_INCREMENT,
catid
INTEGER,
name VARCHAR(512) NOT NULL,
price double NOT NULL,
description text,
FOREIGN KEY
(
catid
)
REFERENCES categories(
catid
)
) ENGINE=INNODB; 

CREATE TABLE `users` (
`uid` int(11) NOT NULL AUTO_INCREMENT,
`username`varchar(512) NOT NULL, `salt` varchar(512) NOT NULL
, `saltedPassword` varchar(512) NOT NULL,`admin` int(1) DEFAULT NULL,
PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;