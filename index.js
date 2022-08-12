


 
 //SELECTORS


function saveLocalTodos(todo){
    //CHECK---HEY Do I already have thing in there?
    let todos;
    if(localStorage.getItem('todos')===null){
        todos=[];
    }
    else{
        todos=JSON.parse(localStorage.getItem('todos'));
    }
    todos.push(todo);
    localStorage.setItem('todos',JSON.stringify(todos));
}