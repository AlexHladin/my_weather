/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE IF NOT EXISTS `weather` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `weather`;

CREATE TABLE IF NOT EXISTS `City` (
  `cityId` int(11) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `CityName` varchar(50) NOT NULL,
  PRIMARY KEY (`cityId`,`CityName`),
  KEY `IdNameInd` (`CityName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `CurrentWeather` (
  `cityId` int(11) NOT NULL,
  `UpdateTime` timestamp NOT NULL,
  `Additional` varchar(1000) NOT NULL,
  PRIMARY KEY (`cityId`,`UpdateTime`),
  CONSTRAINT `currentweather_ibfk_1` FOREIGN KEY (`cityId`) REFERENCES `City` (`cityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ForecastWeather` (
  `cityId` int(11) NOT NULL,
  `UpdateTime` timestamp NOT NULL,
  `Additional` varchar(1000) NOT NULL,
  PRIMARY KEY (`cityId`,`UpdateTime`),
  CONSTRAINT `forecastweather_ibfk_1` FOREIGN KEY (`cityId`) REFERENCES `City` (`cityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
