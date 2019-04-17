DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  department_id  INT NULL,
  product_name VARCHAR(45) NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(6, 2) NULL,
  stock_quantity INT NULL,
  product_sales  DECIMAL(8, 2) NULL DEFAULT 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  overhead_costs DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (department_id)
);