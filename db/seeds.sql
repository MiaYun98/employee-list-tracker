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
("Dave", "Devine", 1, null),
("Kate", "Spade", 3, null),
("Levin", "Lococo", 2, null),
("Soraka", "Healer", 3, 2);
