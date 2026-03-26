import { BoardMemberRole } from "../enum/board-member-role";
import { Board } from "./board.model";
import { User } from "./user.model";

export interface BoardMember{
  board: Board;

  user: User;

  role: BoardMemberRole;
}
