from flask import Flask, render_template, request,  jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Y1012Jqkhkp'
app.config['MYSQL_DB'] = 'ganeshdb'

mysql = MySQL(app)

@app.route('/')
def index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM tasks_sample")
    tasks = cur.fetchall()
    cur.close()

    # Create a list of tasks with task_id, task_text, and iscompleted
    task_list  = [{"task_id": task[0], "task_text": task[1], "iscompleted": task[2]} for task in tasks]
    return render_template('file.html', tasks=task_list)


@app.route('/add_task', methods=['POST'])
def add_task():
    if request.method == 'POST':
        task_text = request.form['task_text']

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO tasks_sample (task_text, iscompleted) VALUES (%s, 0)", (task_text,))
        mysql.connection.commit()
        cur.close()



    # If the request is not an AJAX request or the method is not POST, return a generic response
    return jsonify({"success": False, "message": "Invalid request"})

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    # Retrieve tasks from the database (similar to what you do in the 'index' route)
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM tasks_sample")
    tasks = cur.fetchall()
    cur.close()
    
    # Create a list of tasks
    task_list = [{"task_text": task[1],"task_id": task[0]} for task in tasks]
    
    # Return the list of tasks as JSON
    return jsonify({"tasks": task_list})

@app.route('/delete_task', methods=['POST'])
def delete_task():
    if request.method == 'POST':
        try:
            task_id = request.form['task_id']  # Assuming the task_id is sent as form data

            # Connect to the database and delete the task
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM tasks_sample WHERE task_id = %s", (task_id,))
            mysql.connection.commit()
            cur.close()

            # Return a success message or status
            return jsonify({"success": True, "message": "Task deleted successfully"})
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            return jsonify({"success": False, "message": str(e)})

    # If the request method is not POST or if task_id is not provided, return an error response
    return jsonify({"success": False, "message": "Invalid request"})

@app.route('/update_task_status', methods=['POST'])
def update_task_status():
    if request.method == 'POST':
        try:
            task_id = request.form['task_id']
            is_completed = request.form['iscompleted']

            # Connect to the database and update the 'iscompleted' status
            cur = mysql.connection.cursor()
            cur.execute("UPDATE tasks_sample SET iscompleted = %s WHERE task_id = %s", (is_completed, task_id))
            mysql.connection.commit()
            cur.close()

            # Return a success message or status
            return jsonify({"success": True, "message": "Task status updated successfully"})
        except Exception as e:
            # Handle any exceptions (e.g., database errors)
            return jsonify({"success": False, "message": str(e)})

    # If the request method is not POST or if task_id and iscompleted are not provided, return an error response
    return jsonify({"success": False, "message": "Invalid request"})


if __name__ == '__main__':
    app.run(debug=True)





