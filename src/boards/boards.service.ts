import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { Repository } from 'typeorm';
import { BoardStatus } from './boards-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async getBoardById(id: number, user: User): Promise<Board> {
    const found = await this.boardsRepository.findOne({ where: { id, user } });
    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return found;
  }

  async getAllBoards(user: User): Promise<Board[]> {
    const query = this.boardsRepository.createQueryBuilder('board');
    query.where('board.userId = :userId', { userId: user.id });

    const boards = await query.getMany();
    return boards;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;

    const board = this.boardsRepository.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
      user,
    });

    await board.save();

    return board;
  }

  async updateBoard(
    id: number,
    status: BoardStatus,
    user: User,
  ): Promise<Board> {
    const board = await this.getBoardById(id, user);
    board.status = status;
    await this.boardsRepository.save(board);

    return board;
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    const result = await this.boardsRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
  }
}
