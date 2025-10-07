import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import useLocalStorage from "./Hooks/use-local-storage";
import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  status: "to-do" | "in-progress" | "done";
}

const todos: Todo[] = [
  { id: 1, text: "buy milk", status: "to-do" },
  { id: 2, text: "wash bike", status: "in-progress" },
  { id: 3, text: "do the budget", status: "done" },
  { id: 4, text: "call jane", status: "to-do" },
];

function App() {
  return (
    <>
      <h1 className="row flex-center">ToDo List</h1>
      <TodoList />
    </>
  );
}

export default App;

function TodoList() {
  const [todos, setTodos] = useLocalStorage("todos");
  const todoTodos = todos.filter((todo) => todo.status === "to-do");
  const inProgressTodos = todos.filter((todo) => todo.status === "in-progress");
  const doneTodos = todos.filter((todo) => todo.status === "done");

  function changeTodoStatus(todoId: Todo["id"], newStatus: Todo["status"]) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      )
    );
  }
  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;

    if (!over) return;

    const todoId = Number(active.id);
    if (over.id === "trash") {
      removeTodo(todoId);
      return;
    }

    const newStatus = over.id as Todo["status"];
    if (!["to-do", "in-progress", "done"].includes(newStatus)) return;

    changeTodoStatus(todoId, newStatus);
  }

  function addTodo(text: string): void {
    const newTodo = {
      id: todos.length,
      text: text,
      status: "to-do" as Todo["status"],
    };
    setTodos([...todos, newTodo]);
  }

  function removeTodo(todoId: number) {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="row sm: col-3 flex-center md: col-6">
        <TodoInput addTodo={addTodo} />
        <DeleteArea />
      </div>

      <div className="row flex-center">
        <TodoColumn title="to-do" todos={todoTodos} />
        <TodoColumn title="in-progress" todos={inProgressTodos} />
        <TodoColumn title="done" todos={doneTodos} />
      </div>
    </DndContext>
  );
}

function TodoInput({ addTodo }: { addTodo: (text: string) => void }) {
  const [input, setInput] = useState("");

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput(event.currentTarget.value);
  }
  function onClick() {
    addTodo(input);
    setInput("");
  }
  return (
    <div className="row">
      <input type="text" value={input} onChange={onChange} />
      <button onClick={onClick}>Add Task</button>
    </div>
  );
}

function DeleteArea() {
  const { setNodeRef } = useDroppable({ id: "trash" });
  return (
    <>
      <p id="trash" ref={setNodeRef}>
        🗑️
      </p>
    </>
  );
}

function TodoColumn({ todos, title }: { todos: Todo[]; title: string }) {
  const { setNodeRef } = useDroppable({ id: title });

  return (
    <div className="col-3 border margin-small" ref={setNodeRef}>
      <h3 className="row flex-center">{title}</h3>
      <ul>
        {todos.map((todo) => (
          <Todo todo={todo} key={todo.id} />
        ))}
      </ul>
    </div>
  );
}

function Todo({ todo }: { todo: Todo }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: todo.id,
  });
  const style = { transform: CSS.Translate.toString(transform) };
  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {todo.text}
    </li>
  );
}
