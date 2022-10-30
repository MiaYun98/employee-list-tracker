const inquirer = require('inquirer');
const { up } = require('inquirer/lib/utils/readline');
const mysql = require("mysql2");
const { first } = require('rxjs');

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // Add MySQL password
    password: 'password',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);

// function that asking what you want to do? 
function firstPrompt() {
  inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'step',
      choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Roles', 'View All Departments', 'Add Department', 'Quit']
    }
  ]).then((ans) => {
    const next = ans.step;
    switch (next) {
      case 'View All Employees':
        viewemployees('employees');
        break;
      case 'Add Employee':
        addEmployee();
        break
      case 'Update Employee Role':
        updateRole('employees');
        break;
      case 'View All Roles':
        viewroles();
        break;
      case 'Add Roles':
        addRole();
        break;
      case 'View All Departments':
        viewdepartments('departments');
        break;
      case 'Add Department':
        addDepartment();
        break;
      case 'Quit':
        return console.log("byebye");
    }
  })
}

// view department
function viewdepartments() {
  db.query(`SELECT id, department_name AS name FROM departments`, function (err, results) {
    console.table(results);
    firstPrompt();
  })
}

// view roles using join method
function viewroles() {
  db.query(`SELECT roles.id, roles.title, departments.department_name AS department, roles.salary FROM departments JOIN roles ON departments.id = roles.department_id`, function (err, results) {
    console.table(results);
    firstPrompt();
  })
}

// view employees using join method
function viewemployees() {
  db.query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.department_name AS department, roles.salary, employees.manager_id AS manager FROM departments JOIN roles ON departments.id = roles.department_id JOIN employees ON roles.id = employees.role_id", function (err, results) {
    for(let i = 0 ; i < results.length; i++) {
      if(results[i].manager != null) {
        const findmanager = results.find(c => c.id === results[i].manager) 
        results[i].manager = findmanager.first_name + " " + findmanager.last_name;
      }
    }
    console.table(results);
    firstPrompt();
  })
}

// updating the role of the employee
function updateRole(employee) {
  db.query(`SELECT first_name, last_name FROM ${employee}`, function (err, results) {
    const employeeArr = []
    for (let i = 0; i < results.length; i++) {
      const currentName = results[i].first_name + ' ' + results[i].last_name;
      employeeArr.push(currentName);
    }
    inquirer.prompt([
      {
        type: 'list',
        message: 'Whose Role you want to update?',
        name: 'employeeName',
        choices: employeeArr
      }
    ]).then((ans) => {
      var chosedName = ans.employeeName;
      var currentNameArr = ans.employeeName.split(" ");
      db.query(`SELECT * FROM roles`, function (err, results) {
        const roleList = [];
        for (let i = 0; i < results.length; i++) {
          const currentRole = results[i].title;
          roleList.push(currentRole);
        }
        inquirer.prompt([
          {
            type: 'list',
            message: `Which role is the updated role for ${chosedName}`,
            name: 'updateRole',
            choices: roleList
          }
        ]).then((ans) => {
          const updateRole = results.find(c => c.title === (ans.updateRole));
          db.query(`UPDATE employees SET role_id = ${updateRole.id} WHERE first_name = "${currentNameArr[0]}" AND last_name = "${currentNameArr[1]}"`, function (err, results) {
            console.log("updated successfully")
            firstPrompt();
          })
        })
      })
    })
  })
}

// adding the role to the table
function addRole() {
  const departmentArr = [];
  db.query('SELECT * FROM departments', (err, results) => {
    const departmentResult = results;
    for (let i = 0; i < results.length; i++) {
      departmentArr.push(results[i].department_name);
    }
    inquirer.prompt([
      {
        type: 'input',
        message: 'What is the name of the role?',
        name: 'newRole'
      },
      {
        type: 'input',
        message: 'What is the salary of this role?',
        name: 'newSalary'
      },
      {
        type: 'list',
        message: 'Which department is it?',
        name: 'newId',
        choices: departmentArr
      }
    ]).then((ans) => {
      const choseDepartment = departmentResult.find(c => c.department_name === (ans.newId));
      db.query(`INSERT INTO roles (title, salary, department_id) VALUES ("${ans.newRole.trim()}", ${ans.newSalary.trim()}, ${choseDepartment.id})`, (err, results) => {
        console.log(`New Role ${ans.newRole.trim()} added`);
        firstPrompt();
      })
    })
  })
}

// adding department to the table
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the name of the Department',
      name: 'depName'
    }
  ]).then((ans) => {
    db.query(`INSERT INTO departments (department_name) VALUES ("${ans.depName.trim()}")`, (err, results) => {
      console.log(`New department ${ans.depName.trim()} added`)
      firstPrompt();
    })
  })
}

// adding employee to the table
function addEmployee() {

  db.query('SELECT * FROM roles', (err, results) => {
    const roleAddList = results;
    const rolesArr = [];
    for (let i = 0; i < results.length; i++) {
      rolesArr.push(results[i].title);
    }
    db.query('SELECT * FROM employees', (err, results) => {
      const employeeList = results;
      const managerArr = ['I am a Manager'];
      for (let i = 0; i < results.length; i++) {
        if (results[i].manager_id == null) {
          const currentManager = results[i].first_name + " " + results[i].last_name
          managerArr.push(currentManager);
        }
      }
      inquirer.prompt([
        {
          type: 'input',
          message: 'First name?',
          name: 'first'
        },
        {
          type: 'input',
          message: 'Last name',
          name: 'last'
        },
        {
          type: 'list',
          message: 'What is their role?',
          name: 'role',
          choices: rolesArr
        },
        {
          type: 'list',
          message: 'Who is thier manager?',
          name: 'manager',
          choices: managerArr
        }
      ]).then((ans) => {
        const choserole = roleAddList.find(c => c.title == (ans.role));
        if(ans.manager == 'I am a Manager') {
          db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("${ans.first.trim()}", "${ans.last.trim()}", ${choserole.id}, DEFAULT )`, (err, results) => {
            console.log(`New employee ${ans.first.trim()} ${ans.last.trim()} added`)
            firstPrompt();
          })
        } else {
          const emManager = ans.manager.split(" ");
          const choseManager = employeeList.find(c => c.first_name == (emManager[0]) && c.last_name == (emManager[1]));
          db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("${ans.first.trim()}", "${ans.last.trim()}", ${choserole.id}, ${choseManager.id})`, (err, results) => {
            console.log(`New employee ${ans.first.trim()} ${ans.last.trim()} added`)
            firstPrompt(); 
          })
        }
      })
    })
  })

}
//starting the inquirer
const init = async () => {
  try {
    console.log("Employee Manager");
    await firstPrompt();
  } catch (err) {
    console.log(err);
  }
}

init();