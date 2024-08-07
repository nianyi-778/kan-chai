import { Quadrant } from "../../../ipc/todoCurd";
import { TodoServices } from "../services/Todo";
export class TodoController {
  static async addOrUpdate({
    id,
    title,
    priority,
    description,
    status,
  }: {
    status?: 0 | 1;
    id?: number;
    title: string;
    description: string;
    priority: Quadrant;
  }) {
    const res = id
      ? await TodoServices.updateUser({ id, title, description, priority, status })
      : TodoServices.addUser({ description, title, priority });
    return res;
  }

  static getTodoList() {
    return TodoServices.getTodoList();
  }

  static getTodo(id: number) {
    return TodoServices.getTodo(id);
  }
}
