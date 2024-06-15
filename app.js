const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

var myconnection = mysql.createConnection({
    host: 'localhost',
    database: 'hammad',
    user: 'root',
    password: '27042019'
});

const app = express();



app.use(session({
    secret: '1234', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Wrap a query in a promise
const myQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        myconnection.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

app.get('/', (req, res) => {
    res.redirect('login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/login', (req, res) => {
    console.log("working");
    const { email, password, userType } = req.body;
    console.log(`${email} ${password} ${userType}`);
    const query = `SELECT * FROM actors WHERE email='${email}' AND password='${password}'`;
    myconnection.query(query, (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.user = { email: email, userType: userType };
            if(userType == 'Manager of Invitation Team'){
                res.json({ success: true, redirect: '/manager_invitation' });
            }
            else 
            if(userType == 'student'){
                res.json({ success: true, redirect: '/welcome' });
            }
            else
            if(userType == 'Manager of Dinner Menu Team'){
                res.json({ success: true, redirect: '/Dinner_manager' });
            }
            else
            if(userType == 'Budget Manager'){
                res.json({ success: true, redirect: '/Budget_Manager' });
            }
            else
            if(userType == 'Manager of Performance Team'){
                res.json({ success: true, redirect: '/perfromance_Manager' });
            }
            else
            if(userType == 'Task Manager'){
                res.json({ success: true, redirect: '/Task_Manager' });
            }
            else
            if(userType == 'teacher'){
                res.json({ success: true, redirect: '/teacher' });
            }

            
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/Budget_Manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Budget-manager.html'));
});

app.get('/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher_welcome.html'));
});


app.get('/Task_Manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

app.get('/perfromance_Manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'performance-manager.html'));
});

app.get('/manager_invitation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manager_invitation.html'));
});


app.get('/Dinner_manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Dinner-manager.html'));
});

app.post('/add_suggestion', async (req, res) => {
    const { name } = req.body;
    try {
        const insertQuery = 'INSERT INTO finalize_performance (name, duration) SELECT name, duration FROM student_perfromer_suggestions WHERE name = ?';
        await myQuery(insertQuery, [name]);
        const deleteQuery = 'DELETE FROM student_perfromer_suggestions WHERE name = ?';
        await myQuery(deleteQuery, [name]);
        res.json({ success: true, message: "Suggestion added and deleted successfully." });
    } catch (err) {
        console.error('Error adding and deleting suggestion:', err);
        res.status(500).json({ success: false, message: err.message || 'Database error' });
    }
});

app.post('/create_task', (req, res) => {
    const { defineTask, assignTo } = req.body;
    const query = `
        INSERT INTO tasks (assigned_to, define_task) 
        VALUES (?, ?)
    `;

    myconnection.query(query, [assignTo, defineTask], (err, result) => {
        if (err) {
            console.error('Error inserting task:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.status(200).json({ success: true, message: 'Task created successfully' });
    });
});

app.get('/get_tasks', (req, res) => {
    const query = 'SELECT assigned_to, define_task, status FROM tasks';
    myconnection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ tasks: results });
    });
});

app.get('/get_my_tasks', (req, res) => {
    const userEmail = req.session.user.email; // Ensure you have session management setup
    const query = 'SELECT assigned_to , define_task FROM tasks WHERE assigned_to = ? AND status = 0';
    myconnection.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ tasks: results });
    });
});

app.post('/complete_task', (req, res) => {
    const userEmail = req.session.user.email;
    
    
    const query = 'UPDATE tasks SET status = 1 ,assigned_to = ?';
    myconnection.query(query, [userEmail], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ success: true, message: 'Task completed successfully' });
    });
});




// API endpoint to fetch expenses data
app.get('/expenses_data', (req, res) => {
    const query = 'SELECT name, type, amount FROM expenses';
    myconnection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching expenses data:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ expenses: results });
    });
});

// API endpoint to insert new expense
app.post('/add_expense', (req, res) => {
    const { name, type, amount } = req.body;

    const query = 'CALL InsertExpense(?, ?, ?)';
    myconnection.query(query, [name, type, amount], (err, results) => {
        if (err) {
            console.error('Error inserting expense:', err);
            return res.status(400).json({ success: false, message: err.sqlMessage || 'Error inserting expense.' });
        }
        res.json({ success: true });
    });
});

app.post('/manager_invitation', (req, res) => {
    const {inviteeName , sendMethod} = req.body;
    const data = req.body;
    console.log(data);

    const sql = `insert into invitations values ('${req.session.user.email}','${inviteeName}','${sendMethod}');`;

    myconnection.query(sql, (err, results) => {
        if (err) throw err;

        res.json({ success: false, message: 'inviation has been sent' });
        
    });

});

app.post('/menu_select', (req, res) => {
    const items = req.body;
    const email = req.session.user.email;

    const checkMenue = `SELECT * FROM student_selection_menue WHERE email = ?;`;
    const checkPoll = `SELECT * FROM menu_poll WHERE email = ?;`;

    const insertMenue = `INSERT INTO student_selection_menue (email) VALUES (?);`;
    const insertPoll = `INSERT INTO menu_poll (email) VALUES (?);`;

    const inner_sql1 = `UPDATE student_selection_menue SET item1 = 'not', item2 = 'not', item3 = 'not', item4 = 'not', item5 = 'not', item6 = 'not', item7 = 'not', item8 = 'not', item9 = 'not', item10 = 'not' WHERE email = ?;`;
    const inner_sql2 = `UPDATE menu_poll SET Biryani = 0, Karahi = 0, Nihari = 0, Qorma = 0, Haleem = 0, Paya = 0, Saag = 0, PalakPaneer = 0, Daal = 0, ChapliKebab = 0, TandooriChicken = 0, ChickenHandi = 0, BhindiMasala = 0, AlooGobi = 0, ShamiKebab = 0, SeekhKebab = 0, CholeBhature = 0, Keema = 0, KadhiPakora = 0, MuttonCurry = 0, GulabJamun = 0, Jalebi = 0, Kheer = 0, RasMalai = 0, Barfi = 0, Rabri = 0, Laddu = 0, Phirni = 0, Halwa = 0 WHERE email = ?;`;

    // Wrap a query in a promise
    const myQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            myconnection.query(query, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };

    // Promises for checking and inserting/updating tables
    const checkAndUpdateMenue = myQuery(checkMenue, [email]).then(results => {
        if (results.length === 0) {
            return myQuery(insertMenue, [email]);
        } else {
            return myQuery(inner_sql1, [email]);
        }
    });

    const checkAndUpdatePoll = myQuery(checkPoll, [email]).then(results => {
        if (results.length === 0) {
            return myQuery(insertPoll, [email]);
        } else {
            return myQuery(inner_sql2, [email]);
        }
    });

    // Function to create promises for each item update
    const createUpdatePromises = () => {
        const updateQueries = [];
        let count = 1;

        for (const key in items) {
            if (items.hasOwnProperty(key)) {
                const value = items[key];
                const itemField = `item${count}`;

                const updatePoll = `UPDATE menu_poll SET ${value} = 1 WHERE email = ?;`;
                updateQueries.push(myQuery(updatePoll, [email]));

                const updateMenue = `UPDATE student_selection_menue SET ${itemField} = ? WHERE email = ?;`;
                updateQueries.push(myQuery(updateMenue, [value, email]));

                count += 1;
            }
        }

        return updateQueries;
    };

    // Execute all promises
    Promise.all([checkAndUpdateMenue, checkAndUpdatePoll])
        .then(() => Promise.all(createUpdatePromises()))
        .then(() => {
            res.json({ success: true, redirect: '/welcome' });
        })
        .catch(err => {
            console.error('Error:', err);
            res.json({ success: false, message: 'Database error' });
        });
});

app.get('/menu_items', (req, res) => {
    const email = req.session.user.email; // Replace with the actual session user email
    const query = `SELECT item1, item2, item3, item4, item5, item6, item7, item8, item9, item10 FROM student_selection_menue WHERE email = ?;`;

    myconnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ items: [] });
        }

        const items = Object.values(results[0]).filter(item => item !== 'not');
        res.json({ items });
    });
});

app.get('/menu_items1', (req, res) => {
    const columnsQuery = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'menu_poll' AND TABLE_SCHEMA = 'hammad' AND COLUMN_NAME != 'email'
    `;

    myQuery(columnsQuery)
        .then(columnNames => {
            const sumQueries = columnNames.map(column => 
                `SELECT '${column.COLUMN_NAME}' AS item, SUM(${column.COLUMN_NAME}) AS total_votes FROM menu_poll`
            ).join(' UNION ALL ');

            if (sumQueries.length === 0) {
                console.error("No valid columns found for summing votes.");
                res.status(500).json({ success: false, message: 'No valid columns found in menu_poll table.' });
                return;
            }

            const getMenuItemsQuery = `
                SELECT 
                    am.item_name, am.price, COALESCE(votes.total_votes, 0) AS total_votes
                FROM 
                    all_menu am
                LEFT JOIN (
                    ${sumQueries}
                ) votes ON am.item_name = votes.item
                ORDER BY COALESCE(votes.total_votes, 0) DESC;
            `;

            return myQuery(getMenuItemsQuery);
        })
        .then(results => {
            res.json({ items: results });
        })
        .catch(err => {
            console.error('Error fetching menu items:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});




// Fetch budget details
app.get('/budget_details', (req, res) => {
    const query = 'SELECT name, total_amount, left_amount FROM budget WHERE name = "food"';
    myQuery(query, [])
        .then(results => {
            res.json({ budgets: results });
        })
        .catch(err => {
            console.error('Error fetching budget details:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});


app.get('/performance_poll', (req, res) => {
    const columnsQuery = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'performance_poll' AND TABLE_SCHEMA = 'hammad' AND COLUMN_NAME != 'email'
    `;

    myQuery(columnsQuery)
        .then(columnNames => {
            const sumQueries = columnNames.map(column =>
                `SELECT '${column.COLUMN_NAME}' AS name, SUM(${column.COLUMN_NAME}) AS total_votes FROM performance_poll`
            ).join(' UNION ALL ');

            if (sumQueries.length === 0) {
                console.error("No valid columns found for summing votes.");
                res.status(500).json({ success: false, message: 'No valid columns found in performance_poll table.' });
                return;
            }

            const getPerformanceQuery = `
                SELECT 
                    ap.name, COALESCE(poll.total_votes, 0) as count
                FROM 
                    all_performers ap
                LEFT JOIN (
                    ${sumQueries}
                ) poll ON ap.name = poll.name
                ORDER BY COALESCE(poll.total_votes, 0) DESC;
            `;

            return myQuery(getPerformanceQuery);
        })
        .then(results => {
            res.json({ items: results });
        })
        .catch(err => {
            console.error('Error fetching performance polls:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});


app.post('/add_performance', (req, res) => {
    const { name ,} = req.body;
    const checkExistsQuery = 'SELECT * FROM finalize_performance WHERE name = ?';
    const insertQuery = 'INSERT INTO finalize_performance (name) VALUES (?)';

    myQuery(checkExistsQuery, [name])
        .then(result => {
            if (result.length > 0) {
                throw new Error('Performance already exists.');
            }
            return myQuery(insertQuery, [name]);
        })
        .then(() => {
            res.json({ success: true, message: 'Performance added successfully.' });
        })
        .catch(err => {
            console.error('Error in adding performance:', err);
            res.status(500).json({ success: false, message: err.message || 'Database error' });
        });
});

app.delete('/delete_performance', (req, res) => {
    const { name } = req.body;
    const checkExistsQuery = 'SELECT * FROM finalize_performance WHERE name = ?';
    const deleteQuery = 'DELETE FROM finalize_performance WHERE name = ?';

    myQuery(checkExistsQuery, [name])
        .then(result => {
            if (result.length === 0) {
                throw new Error('Performance does not exist.');
            }
            return myQuery(deleteQuery, [name]);
        })
        .then(() => {
            res.json({ success: true, message: 'Performance deleted successfully.' });
        })
        .catch(err => {
            console.error('Error in deleting performance:', err);
            res.status(500).json({ success: false, message: err.message || 'Database error' });
        });
});
app.post('/add_performance_details', (req, res) => {
    console.log(req.body);
    const { name, time, venue, rehearsal } = req.body;
    const updateQuery = `UPDATE finalize_performance SET time = ?, duration = ? , venue = ?, rehersal = ? WHERE name = ?`;

    // Assuming `db` is your database connection object
    myconnection.query(updateQuery, [time,'50 mints',venue, rehearsal, name], (err, result) => {
        if (err) {
            console.error('Error updating performance details:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        } else {
            res.json({ success: true, message: 'Performance details updated successfully.' });
        }
    });
});


app.get('/get_performance_details', (req, res) => {
    const query = 'SELECT name, time, duration, rehersal, venue FROM finalize_performance;';
    myQuery(query, [])
        .then(results => {
            res.json({ performances: results });
        })
        .catch(err => {
            console.error('Error fetching performances:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});

app.get('/get_finalize_menu', (req, res) => {
    const query = 'SELECT name, time, duration, venue, rehersal FROM finalize_performance';
    myconnection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching finalize menu:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ menu: results });
    });
});


app.post('/set_access', (req, res) => {
    const { access } = req.body;  // access should be 1 or 0
    const updateQuery = 'UPDATE access_table SET access = ? WHERE name = ?';  // Assuming you have a specific row to update

    myconnection.query(updateQuery, [access, 'performance'], (err, result) => {
        if (err) {
            console.error('Error setting access:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ success: true, message: 'Access updated successfully.' });
    });
});


app.post('/set_access1', (req, res) => {
    const { access } = req.body;  // access should be 1 or 0
    const updateQuery = 'UPDATE access_table SET access = ? WHERE name = ?';  // Assuming you have a specific row to update

    myconnection.query(updateQuery, [access, 'menu'], (err, result) => {
        if (err) {
            console.error('Error setting access:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ success: true, message: 'Access updated successfully.' });
    });
});


app.get('/check_access', (req, res) => {
    const nameToCheck = 'SpecificName';  // This should match your access name
    const query = 'SELECT access FROM access_table WHERE name = ?';
    myconnection.query(query, ['performance'], (err, results) => {
        if (err) {
            console.error('Error checking access:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        if (results.length > 0) {
            res.json({ access: results[0].access });
        } else {
            res.status(404).json({ success: false, message: 'No access data found' });
        }
    });
});

app.get('/check_access1', (req, res) => {
    const nameToCheck = 'SpecificName';  // This should match your access name
    const query = 'SELECT access FROM access_table WHERE name = ?';
    myconnection.query(query, ['menu'], (err, results) => {
        if (err) {
            console.error('Error checking access:', err);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        if (results.length > 0) {
            res.json({ access: results[0].access });
        } else {
            res.status(404).json({ success: false, message: 'No access data found' });
        }
    });
});





// Add a selected menu item to expenses and decrement the food budget
app.post('/add_menu_item', (req, res) => {
    const { item_name, price } = req.body;

    const checkFinalMenuQuery = `
        SELECT COUNT(*) AS count FROM final_menu WHERE item_name = ?
    `;
    const addFinalMenuQuery = `
        INSERT INTO final_menu (item_name, price)
        VALUES (?, ?)
    `;
    const addExpenseQuery = `
        INSERT INTO expenses (name, type, amount)
        VALUES (?, 'food', ?)
    `;
    const updateBudgetQuery = `
        UPDATE budget 
        SET left_amount = left_amount - ?
        WHERE name = 'food' AND left_amount >= ?
    `;

    myQuery(checkFinalMenuQuery, [item_name])
        .then(results => {
            if (results[0].count > 0) {
                throw new Error(`Item "${item_name}" already exists in the final menu.`);
            }
            return myQuery('START TRANSACTION', []);
        })
        .then(() => myQuery(updateBudgetQuery, [price, price]))
        .then(results => {
            if (results.affectedRows === 0) {
                throw new Error('Budget constraints: Insufficient funds.');
            }
            return myQuery(addFinalMenuQuery, [item_name, price]);
        })
        .then(() => myQuery(addExpenseQuery, [item_name, price]))
        .then(() => myQuery('COMMIT', []))
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            myQuery('ROLLBACK', [])
                .then(() => {
                    console.error('Error in transaction:', err);
                    res.status(500).json({ success: false, message: err.message || 'Database error' });
                });
        });
});

// Fetch the final menu items
// Fetch the final menu items
app.get('/final_menu', (req, res) => {
    const query = 'SELECT item_name FROM final_menu';
    myQuery(query, [])
    .then(results => {
        if (results.length > 0) {
            res.json({ finalMenu: results });
        } else {
            res.json({ finalMenu: [] });
        }
    })
    .catch(err => {
        console.error('Error fetching final menu:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    });
});


// Delete an item from final_menu and expenses, and increment the food budget
app.delete('/delete_menu_item', (req, res) => {
    const { item_name, price } = req.query;

    const checkFinalMenuQuery = `
        SELECT COUNT(*) AS count FROM final_menu WHERE item_name = ?
    `;
    const deleteFinalMenuQuery = `
        DELETE FROM final_menu
        WHERE item_name = ?
    `;
    const deleteExpenseQuery = `
        DELETE FROM expenses
        WHERE name = ? AND type = 'food'
    `;
    const updateBudgetQuery = `
        UPDATE budget 
        SET left_amount = left_amount + ?
        WHERE name = 'food'
    `;

    myQuery(checkFinalMenuQuery, [item_name])
        .then(results => {
            if (results[0].count === 0) {
                throw new Error(`Item "${item_name}" does not exist in the final menu.`);
            }
            return myQuery('START TRANSACTION', []);
        })
        .then(() => myQuery(deleteFinalMenuQuery, [item_name]))
        .then(() => myQuery(deleteExpenseQuery, [item_name]))
        .then(() => myQuery(updateBudgetQuery, [price]))
        .then(() => myQuery('COMMIT', []))
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            myQuery('ROLLBACK', [])
                .then(() => {
                    console.error('Error in transaction:', err);
                    res.status(500).json({ success: false, message: err.message || 'Database error' });
                });
        });
});




// Route to get all menu items
app.get('/items', (req, res) => {
    const query = 'SELECT item_name FROM all_menu';
    myQuery(query)
        .then(results => res.json(results))
        .catch(err => res.status(500).json({ success: false, message: 'Database error', error: err }));
});

app.delete('/delete_expense', (req, res) => {
    const { name, type, amount } = req.query;

    const deleteExpenseQuery = 'DELETE FROM expenses WHERE name = ? AND type = ? AND amount = ?';
    const updateBudgetQuery = 'UPDATE budget SET left_amount = left_amount + ? WHERE name = ?';

    myQuery('START TRANSACTION', [])
        .then(() => myQuery(deleteExpenseQuery, [name, type, amount]))
        .then(() => myQuery(updateBudgetQuery, [amount, type]))
        .then(() => myQuery('COMMIT', []))
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            myQuery('ROLLBACK', [])
                .then(() => {
                    console.error('Error in transaction:', err);
                    res.status(500).json({ success: false, message: 'Database error' });
                });
        });
});

// API endpoint to increase the budget
app.post('/increase_budget', (req, res) => {
    const { name, increaseAmount } = req.body;

    const updateBudgetQuery = `
        UPDATE budget
        SET total_amount = total_amount + ?, left_amount = left_amount + ?
        WHERE name = ?
    `;

    myQuery(updateBudgetQuery, [increaseAmount, increaseAmount, name])
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error('Error increasing budget:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});

// API endpoint to add a new budget item
app.post('/add_budget', (req, res) => {
    const { name, totalAmount } = req.body;

    const insertBudgetQuery = 'INSERT INTO budget (name, total_amount, left_amount) VALUES (?, ?, ?)';

    myQuery(insertBudgetQuery, [name, totalAmount, totalAmount])
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error('Error adding budget:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});

// API endpoint to adjust the budget
// API endpoint to adjust the budget (increase or decrease)
app.post('/adjust_budget', (req, res) => {
    const { name, adjustType, amount } = req.body;

    const updateBudgetQueryIncrease = `
        UPDATE budget
        SET total_amount = total_amount + ?, left_amount = left_amount + ?
        WHERE name = ?
    `;

    const updateBudgetQueryDecrease = `
        UPDATE budget
        SET total_amount = total_amount - ?, left_amount = left_amount - ?
        WHERE name = ? AND left_amount >= ?
    `;

    const query = adjustType === 'increase' ? updateBudgetQueryIncrease : updateBudgetQueryDecrease;
    const params = adjustType === 'increase' ? [amount, amount, name] : [amount, amount, name, amount];

    myQuery(query, params)
        .then(results => {
            if (adjustType === 'decrease' && results.affectedRows === 0) {
                throw new Error('Not enough funds to decrease.');
            }
            res.json({ success: true });
        })
        .catch(err => {
            console.error('Error adjusting budget:', err);
            res.status(500).json({ success: false, message: err.message || 'Database error' });
        });
});

// API endpoint to delete a budget item
app.delete('/delete_budget', (req, res) => {
    const { name } = req.query;

    const deleteBudgetQuery = 'DELETE FROM budget WHERE name = ?';

    myQuery(deleteBudgetQuery, [name])
        .then(results => {
            if (results.affectedRows === 0) {
                throw new Error('No such budget item found.');
            }
            res.json({ success: true });
        })
        .catch(err => {
            console.error('Error deleting budget item:', err);
            res.status(500).json({ success: false, message: err.message || 'Database error' });
        });
});



// Route to add a new item
app.post('/add-item', (req, res) => {
    const { itemName } = req.body;
    const insertAllMenu = 'INSERT INTO all_menu (item_name) VALUES (?)';
    const addColumnMenuPoll = `ALTER TABLE menu_poll ADD COLUMN ${itemName} int DEFAULT 0`;

    Promise.all([myQuery(insertAllMenu, [itemName]), myQuery(addColumnMenuPoll)])
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: 'Database error', error: err });
        });
});

// Route to delete an item
app.post('/delete-item', (req, res) => {
    const { itemName } = req.body;
    const deleteAllMenu = 'DELETE FROM all_menu WHERE item_name = ?';
    const dropColumnMenuPoll = `ALTER TABLE menu_poll DROP COLUMN ${itemName}`;

    Promise.all([myQuery(deleteAllMenu, [itemName]), myQuery(dropColumnMenuPoll)])
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: 'Database error', error: err });
        });
});


app.get('/invitation_items', (req, res) => {
    const email = req.session.user.email; // Replace with the actual session user email
    const query = `SELECT name, type FROM invitations WHERE email = ?;`;

    myconnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching invitation items:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ items: [] });
        }

        const items = results.map(invitation => `${invitation.name} - ${invitation.type}`);
        res.json({ items });
    });
});

// Fetch all performers with details
app.get('/get_performers', (req, res) => {
    const query = `
        SELECT name, type, duration, requirments
        FROM all_performers;
    `;
    myQuery(query, [])
        .then(results => {
            res.json({ performers: results });
        })
        .catch(err => {
            console.error('Error fetching performers:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});


// Submit a performer suggestion
app.post('/submit_suggestion', (req, res) => {
    email = req.session.user.email;
    const { name, type, duration, requirements} = req.body;
    const insertQuery = `
        INSERT INTO student_perfromer_suggestions (name, type, duration, requirments, email)
        VALUES (?, ?, ?, ?, ?);
    `;
    myQuery(insertQuery, [name, type, duration, requirements, email])
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error('Error submitting performer suggestion:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});

// Delete a suggestion
// Delete a suggestion based on email
app.delete('/delete_suggestion', (req, res) => {
    const email = req.session.user.email;  // Make sure session is properly configured and used
    const { name } = req.body;  // Assuming you're passing the name of the performance to identify which to delete

    const deleteQuery = 'DELETE FROM student_perfromer_suggestions WHERE email = ? AND name = ?';
    myQuery(deleteQuery, [email, name])
        .then(result => {
            if (result.affectedRows === 0) {
                throw new Error('No suggestion found with the provided name for this user.');
            }
            res.json({ success: true, message: "Suggestion deleted successfully." });
        })
        .catch(err => {
            console.error('Error deleting suggestion:', err);
            res.status(500).json({ success: false, message: err.message || 'Database error' });
        });
});

app.get('/performer_suggestions', (req, res) => {
    const query = 'SELECT name, type, duration, requirments FROM student_perfromer_suggestions';
    myQuery(query, [])
        .then(results => {
            res.json({ suggestions: results });
        })
        .catch(err => {
            console.error('Error fetching suggestions:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});

app.get('/performer_suggestions1', (req, res) => {
    const query = 'SELECT name, type, duration, requirments FROM student_perfromer_suggestions';
    myQuery(query, [])
        .then(results => {
            if (results.length === 0) {
                console.log('No data found');
            }
            res.json({ suggestions: results });
        })
        .catch(err => {
            console.error('Error fetching suggestions:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});


// Endpoint to handle performance selection
app.post('/performance_select', (req, res) => {

    // Wrap a query in a promise
    const myQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            myconnection.query(query, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };

    const items = req.body;
    const email = req.session.user.email; // Replace with the actual session user email

    const checkPerformer = `SELECT * FROM student_selection_performer WHERE email = ?;`;
    const checkPoll = `SELECT * FROM performance_poll WHERE email = ?;`;

    const insertPerformer = `INSERT INTO student_selection_performer (email) VALUES (?);`;
    const insertPoll = `INSERT INTO performance_poll (email) VALUES (?);`;

    const inner_sql1 = `UPDATE student_selection_performer SET performance1 = 'not', performance2 = 'not', performance3 = 'not', performance4 = 'not' WHERE email = ?;`;
    const inner_sql2 = `UPDATE performance_poll SET MusicalPerformance = 0, DanceShow = 0, StandUpComedy = 0, PoetryRecital = 0 WHERE email = ?;`;

    // Promises for checking and inserting/updating tables
    const checkAndUpdatePerformer = myQuery(checkPerformer, [email]).then(results => {
        if (results.length === 0) {
            return myQuery(insertPerformer, [email]);
        } else {
            return myQuery(inner_sql1, [email]);
        }
    });

    const checkAndUpdatePoll = myQuery(checkPoll, [email]).then(results => {
        if (results.length === 0) {
            return myQuery(insertPoll, [email]);
        } else {
            return myQuery(inner_sql2, [email]);
        }
    });

    // Function to create promises for each item update
    const createUpdatePromises = () => {
        const updateQueries = [];
        let count = 1;

        for (const key in items) {
            if (items.hasOwnProperty(key)) {
                const value = items[key];
                const performanceField = `performance${count}`;

                const updatePoll = `UPDATE performance_poll SET ${value} = 1 WHERE email = ?;`;
                updateQueries.push(myQuery(updatePoll, [email]));

                const updatePerformer = `UPDATE student_selection_performer SET ${performanceField} = ? WHERE email = ?;`;
                updateQueries.push(myQuery(updatePerformer, [value, email]));

                count += 1;
            }
        }

        return updateQueries;
    };

    // Execute all promises
    Promise.all([checkAndUpdatePerformer, checkAndUpdatePoll])
        .then(() => Promise.all(createUpdatePromises()))
        .then(() => {
            res.json({ success: true, redirect: '/welcome' });
        })
        .catch(err => {
            console.error('Error:', err);
            res.json({ success: false, message: 'Database error' });
        });
});

app.get('/performer_items', (req, res) => {
    const email = req.session.user.email; // Replace with the actual session user email
    const query = `SELECT performance1, performance2, performance3, performance4 FROM student_selection_performer WHERE email = ?;`;

    myconnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching performer items:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ items: [] });
        }

        const items = Object.values(results[0]).filter(item => item !== 'not');
        res.json({ items });
    });
});

app.get('/budget_data', (req, res) => {
    const query = 'SELECT name, total_amount, left_amount FROM budget';

    myconnection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching budget data:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ budgets: results });
    });
});


app.get('/student_info', (req, res) => {
    const email = req.session.user.email; // Replace with the actual session user email

    const studentQuery = `SELECT name, address, contact FROM students WHERE email = ?;`;
    const familyQuery = `SELECT fmembername, fmembercontact FROM student_family WHERE email = ?;`;

    // Execute both queries in parallel
    Promise.all([
        new Promise((resolve, reject) => {
            myconnection.query(studentQuery, [email], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return reject('Student not found');
                resolve(results[0]);
            });
        }),
        new Promise((resolve, reject) => {
            myconnection.query(familyQuery, [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        })
    ])
        .then(([student, family]) => {
            res.json({ student, family });
        })
        .catch(err => {
            console.error('Error fetching student info:', err);
            res.status(500).json({ success: false, message: 'Database error' });
        });
});




app.post('/signup', (req, res) => {

    const { userType } = req.body;

    if (userType === 'teacher') {
        const { name, email, password, userType, family } = req.body;
        let check = 0;
        let checkdata_sql = `SELECT * FROM actors WHERE email='${email}'`;
        myconnection.query(checkdata_sql, (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                res.json({
                    success: false,
                    message: `Error: Email '${email}' already exists.`
                });
            } else {
                let insert_teacher = `INSERT INTO teachers (name, email,no_family_members) VALUES ('${name}', '${email}', '${password}')`;
                let insert_actor = `INSERT INTO actors (email, password, roll) VALUES ('${email}', '${password}', 'teacher')`;

                myconnection.query(insert_actor, (err, results) => {
                    if (err) throw err;
                    check = check + 1;
                    if (check === 2) {
                        req.session.user = { email: email, userType: userType };
                        req.session.message = 'Signup successful. Please log in.';
                        res.json({ success: true, redirect: '/welcome' });
                    }
                });

                myconnection.query(insert_teacher, (err, results) => {
                    if (err) throw err;
                    check = check + 1;
                    if (check === 2) {
                        req.session.user = { email: email, userType: userType };
                        req.session.message = 'Signup successful. Please log in.';
                        res.json({ success: true, redirect: '/welcome' });
                    }
                });
            }
        });
    }
    else if (userType == 'student') {
        const { name, email, password, userType, studentAddress, studentContact, family } = req.body;
        const familyCount = parseInt(req.body.family);


        let checkdata_sql = `SELECT * FROM actors WHERE email='${email}'`;
        myconnection.query(checkdata_sql, (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                res.json({
                    success: false,
                    message: `Error: Email '${email}' already exists.`
                });
            } else {
                let insert_student = `INSERT INTO students (name, address,contact,email) VALUES ('${name}', '${studentAddress}', '${studentContact}','${email}')`;
                let insert_actor = `INSERT INTO actors (email, password, roll) VALUES ('${email}', '${password}', 'student')`;
                let check = 0

                myconnection.query(insert_actor, (err, results) => {
                    if (err) throw err;
                    check = check + 1;
                    if (check === 3) {
                        req.session.user = { email: email, userType: userType };
                        req.session.message = 'Signup successful. Please log in.';
                        res.json({ success: true, redirect: '/welcome' });
                    }
                });

                myconnection.query(insert_student, (err, results) => {
                    if (err) throw err;
                    check = check + 1;
                    if (check === 3) {
                        req.session.user = { email: email, userType: userType };
                        req.session.message = 'Signup successful. Please log in.';
                        res.json({ success: true, redirect: '/welcome' });
                    }
                });

                if (familyCount === 1) {
                    familyMember1 = req.body.familyMember1;
                    contactMember1 = req.body.contactMember1;
                    let insertfamily_sql = `insert into student_family(email, fmembername , fmembercontact) values ('${email}','${familyMember1}','${contactMember1}')`;
                    myconnection.query(insertfamily_sql, (err, results) => {
                        if (err) throw err;
                        check = check + 1;
                        if (check === 3) {
                            req.session.user = { email: email, userType: userType };
                            req.session.message = 'Signup successful. Please log in.';
                            res.json({ success: true, redirect: '/welcome' });
                        }
                    });
                }
                else
                    if (familyCount === 2) {
                        familyMember1 = req.body.familyMember1;
                        contactMember1 = req.body.contactMember1;
                        familyMember2 = req.body.familyMember2;
                        contactMember2 = req.body.contactMember2;

                        let insertfamily_sql = `insert into student_family(email, fmembername , fmembercontact) values ('${email}','${familyMember1}','${contactMember1}'),
                    ('${email}','${familyMember2}','${contactMember2}')`;
                        myconnection.query(insertfamily_sql, (err, results) => {
                            if (err) throw err;
                            check = check + 1;
                            if (check === 3) {
                                req.session.user = { email: email, userType: userType };
                                req.session.message = 'Signup successful. Please log in.';
                                res.json({ success: true, redirect: '/welcome' });
                            }
                        });
                    }
                    else
                        if (familyCount === 3) {
                            familyMember1 = req.body.familyMember1;
                            contactMember1 = req.body.contactMember1;
                            familyMember2 = req.body.familyMember2;
                            contactMember2 = req.body.contactMember2;
                            familyMember3 = req.body.familyMember3;
                            contactMember3 = req.body.contactMember3;


                            let insertfamily_sql = `insert into student_family(email, fmembername , fmembercontact) values ('${email}','${familyMember1}','${contactMember1}'),
                    ('${email}','${familyMember2}','${contactMember2}'),
                    ('${email}','${familyMember3}','${contactMember3}')`;
                            myconnection.query(insertfamily_sql, (err, results) => {
                                if (err) throw err;
                                check = check + 1;
                                if (check === 3) {
                                    req.session.user = { email: email, userType: userType };
                                    req.session.message = 'Signup successful. Please log in.';
                                    res.json({ success: true, redirect: '/welcome' });
                                }
                            });
                        }
            }
        });








    }
});

app.get('/welcome', (req, res) => {
    console.log("welocome working");
    if (req.session.user) {
        console.log("check inner");
        res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

myconnection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database.');
});

app.listen(3000, () => {
    console.log("App is listening on port 3000");
});
