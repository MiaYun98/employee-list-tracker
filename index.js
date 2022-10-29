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
      choices: ['View All Employees', 'Update Employee Role', 'View All Roles','Add Roles', 'View All Departments', 'Add Department', 'Quit']
    }
  ]).then((ans) => {
    const next = ans.step;
    switch(next) {
      case 'View All Employees': 
        viewAll('employees');
        break;
      case 'Update Employee Role': 
        updateRole('employees');
        break; 
      case 'View All Roles': 
        viewAll('roles');
        break;
      case 'Add Roles': 
        console.log('Add Roles');
        break;
      case 'View All Departments': 
        viewAll('departments');
        break;
      case 'Add Department': 
        console.log('Add Department');
        break;
      case 'Quit': 
        return console.log("byebye")
    }
  })
}

function viewAll(table) {
  db.query(`SELECT * FROM ${table}`, function (err, results) {
    console.table(results);
    firstPrompt();
  })
}

function updateRole(employee) {
  db.query(`SELECT first_name, last_name FROM ${employee}`, function (err, results) {
    const employeeArr = []
    for(let  i = 0; i < results.length; i++) {
      const currentName = results[i].first_name + ' '+ results[i].last_name;
      employeeArr.push(currentName);
    }
    inquirer.prompt ([
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
        console.log(results);
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
          console.log(ans.updateRole)
          const updateRole = results.find(c => c.title === (ans.updateRole));
          console.log(updateRole.id);
          db.query(`UPDATE employees SET role_id = ${updateRole.id} WHERE first_name = "${currentNameArr[0]}" AND last_name = "${currentNameArr[1]}"`, function (err, results) {
            console.log("updated successfully")
            firstPrompt();
          })
        })
      })
    })
  })
}

//starting the inquirer
const init = async () => {
  try {
    console.log("Employee Manager");
    await firstPrompt();
  } catch(err) {
    console.log(err);
  }
}

init();