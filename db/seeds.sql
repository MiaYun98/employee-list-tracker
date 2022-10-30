INSERT INTO departments (department_name) 
VALUES 
("Marketing"),
("Software"),
("Human Resources"),
("Undefined");

INSERT INTO roles (title, salary, department_id) 
VALUES
("CEO", 1000000, 4),
("Marketing Manager", 100000, 1),
("Software Manager", 100000, 2),
("HR Manager", 100000, 3),
("Software Engineer", 700000, 2);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
("Dave", "Devine", 1, DEFAULT),
("Kate", "Spade", 3, DEFAULT),
("Levin", "Lococo", 2, DEFAULT),
("Soraka", "Healer", 3, 2);
