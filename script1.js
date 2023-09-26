$(document).ready(function() 
{// Function to fetch and update the task list
    function updateTaskList(callback) {
        $.ajax({
            url: '/get_tasks', // Create a new Flask route to fetch tasks
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                // Clear the existing task list
                $('#taskList').empty();

                // Add tasks to the list
                data.tasks.forEach(function(task) 
                {
                   
                   var listItem = $('<li>');
                   //listItem.append('<span>' + task.task_text + '</span>');
                   var taskText = $('<span class="task-text">').text(task.task_text);
                   console.log("Task ID:", task.task_id);
                   var deleteButton = $('<button class="deleteTask" data-task-id="' + task.task_id + '">Delete</button>');
                   listItem.append(taskText);
                   listItem.append(deleteButton);
                   // Check Local Storage for task completion status
                   var isCompleted = localStorage.getItem('task_' + task.task_id);
                   if (isCompleted === '1') {
                   listItem.addClass('completed'); // Add the 'completed' class for strikethrough
                }
                     // Add a click event handler to toggle the 'completed' class
                   taskText.click(function() {
                   listItem.toggleClass('completed');
                      // Update the task completion status in Local Storage
                      if (listItem.hasClass('completed')) 
                      {
                        localStorage.setItem('task_' + task.task_id, '1');
                      } 
                    else 
                      {
                        localStorage.setItem('task_' + task.task_id, '0');
                      }
                   // Update the task completion status in the database via Flask
                   $.ajax({
                        url: '/update_task_status', // Flask route to update the status
                        method: 'POST',
                        data: { task_id: task.task_id, iscompleted: listItem.hasClass('completed') ? 1 : 0 },
                        success: function(response) {
                            // Handle success if needed
                        },
                        error: function(error) {
                            // Handle error if needed
                            console.error('Error updating task status:', error);
                        }
                    });

                   });
                   $('#taskList').append(listItem);
                });
                if (typeof callback === 'function') {
               callback();
            }
            },
            error: function() {
                console.error('Error fetching tasks.');
            }
        });
    }
    updateTaskList();
    // Call the function to update the task list on page load
    // Handle the form submission to add a task
    $('#addTaskForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting in the traditional way

        // Get the task text from the input field
        var taskText = $('#taskInput').val().trim();

        if (taskText !== '') {
            // Send the task to the server using AJAX
            $.ajax({
                url: '/add_task', // Use the existing Flask route to add a task
                method: 'POST',
                data: { task_text: taskText },
                dataType: 'json',
                success: function(data) {
                    if (data.success) {
                        // Clear the input field
                        $('#taskInput').val('');
                        // Update the task list on the page
                        updateTaskList();
                    } else {
                        console.error('Error adding task.');
                    }
                },
                error: function() {
                    console.error('Error adding task.');
                }
            });
        }
        else {
            // Display a custom pop-up message
            var errorMessage = 'Task cannot be empty. Please enter a task.';
            showErrorDialog(errorMessage);
        }
    });

    function showErrorDialog(message) {
        // Display the error message in a dialog box
        window.alert(message);
    }

   //Add a click event handler for the delete buttons
  $(document).on('click', '.deleteTask', function() {
    var taskId = $(this).data('task-id'); // Get the task_id from the data attribute
    var confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete)
    {
    // Send an AJAX request to delete the task
    $.ajax({
        url: '/delete_task', // Create a new Flask route for deleting tasks
        method: 'POST',
        data: { task_id: taskId }, // Send the task_id to the server
        dataType: 'json',
       success: function(data) {
            if (data.success) {
                // Task deleted successfully, update the task list
                updateTaskList();
            } else {
                console.error('Error deleting task.');
            }
        },
        error: function() {
            console.error('Error deleting task.');
        }
    });
}
  });
    }
);

