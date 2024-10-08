import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from '../services/posts.service';
import { JwtService } from '@nestjs/jwt';
import { IPost } from '../entities/models/posts.interface';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

describe('PostsController', () => {
  let postController: PostsController;
  let postService: PostsService;

  const dto = {
    id: '1',
    title: 'first post',
    content: 'content from the first post',
    user_id: 1
  }
  
  let postsList = [] as IPost[];
  let singlePost = {} as IPost;
  let searchTerms = 'searchTerm';
  let postId = '123';

  const mockPostsService = {
    findAll: jest.fn(),
    findAllAdmin: jest.fn(),
    filter: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()

  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService, JwtService],
    }).overrideProvider(PostsService)
      .useValue(mockPostsService)
      .overrideProvider(JwtService)
      .useValue(JwtService)
      .compile();

    postController = app.get<PostsController>(PostsController);
    postService = app.get<PostsService>(PostsService);

    jest.clearAllMocks();
  });

  it('PostController should be defined', () => {
    expect(postController).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all posts when findAll() called', async () => {
      jest.spyOn(mockPostsService, 'findAll').mockResolvedValue(postsList);

      expect(await postController.findAll()).toEqual(postsList);
      expect(mockPostsService.findAll).toHaveBeenCalled();
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'findAll').mockRejectedValue(new Error('Service Error'));

      const result = postController.findAll();

      expect(result).rejects.toThrow(InternalServerErrorException);
      expect(result).rejects.toThrow ("Service Error");
    });
  });


  describe('findAllAdmin()', () => {
    it('should return all posts when findAllAdmin() called', async () => {
      jest.spyOn(mockPostsService, 'findAll').mockResolvedValue(postsList);

      expect(await postController.findAllAdmin()).toEqual(postsList);
      expect(mockPostsService.findAll).toHaveBeenCalled();
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'findAll').mockRejectedValue(new Error('Service Error'));

      const result = postController.findAllAdmin();

      expect(result).rejects.toThrow(InternalServerErrorException);
      expect(result).rejects.toThrow ("Service Error");
    });
  });

  describe('filter()', () => {
    it('should filter posts with a keyword when filter(searchTerms) called', async () => {
      jest.spyOn(mockPostsService, 'filter').mockResolvedValue(postsList);

      expect(await postController.filter(searchTerms)).toEqual(postsList);
      expect(mockPostsService.filter).toHaveBeenCalledWith(searchTerms);
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'filter').mockRejectedValue(new Error('Service Error'));

      const result = postController.filter(searchTerms);

     expect(result).rejects.toThrow(InternalServerErrorException);
     expect(result).rejects.toThrow ("Service Error");
    });
  });

  describe('findOne()', () => {
    it('should return a post with an id when findOne(postId) called', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(singlePost);
      
      expect(await postController.findOne(postId)).toEqual(singlePost);
      expect(mockPostsService.findOne).toHaveBeenCalledWith(postId);
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockRejectedValue(new Error('Service Error'));

      const result = postController.findOne(postId);

      await expect(result).rejects.toThrow(InternalServerErrorException);
      await expect(result).rejects.toThrow ("Service Error");
    });

    it('should throw QueryFailedError when findOne(postId) called with invalid id format', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockRejectedValue(new QueryFailedError('', [], Error()));

      const result = postController.findOne('invalid-id');

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow ('Formato inválido do ID.');
    })
  });

  describe('create()', () => {
    it('should create a post and return void when create(dto) called', async () => {
      expect(await postController.create(dto)).toEqual('Post criado com sucesso!');
      expect(mockPostsService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'create').mockRejectedValue(new Error('Service Error'));

      const result = postController.create(dto);

      expect(result).rejects.toThrow(InternalServerErrorException);
      expect(result).rejects.toThrow ("Service Error");
    });
  });

  describe('update()', () => {
    it('should update a post and return void when update(postId, dto) called', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(dto);
      
      expect(await postController.update(postId, {title: dto. title})).toEqual('Post atualizado com sucesso!');
      expect(mockPostsService.update).toHaveBeenCalledWith(postId, {title: dto. title});
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(dto);
      jest.spyOn(mockPostsService, 'update').mockRejectedValue(new Error('Service Error'));

      const result = postController.update(postId, {title: dto.title});
      
      expect(result).rejects.toThrow(InternalServerErrorException);
      expect(result).rejects.toThrow ("Service Error");
    });

    it('should throw a BadRequestException when update(postId, dto) called with invalid dto', () => {
      const result = postController.update(postId, {});
      
      expect(result).rejects.toThrow(BadRequestException);
      expect(result).rejects.toThrow ('Nenhum dado a ser atualizado. Confira as propriedades informadas.');
    });

    it('should throw a NotFoundException when update(postId, dto) called with invalid id', () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(null);
      expect(postController.update(postId, {title: dto.title})).rejects.toThrow(NotFoundException);
    });

    it('should throw QueryFailedError when update(postId, dto) called with invalid id format', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockRejectedValue(new QueryFailedError('', [], Error()));

      const result = postController.update('invalid-id', dto);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow ('Formato inválido do ID.');
    })
  
  });

  describe('remove()', () => {
    it('should remove a post and return void when remove(postId) called', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(dto);

      expect(await postController.remove(postId)).toEqual('Post excluído com sucesso!');
      expect(mockPostsService.remove).toHaveBeenCalledWith(postId);
    });

    it('should throw an InternalServerErrorException when the service throws an error', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(dto);
      jest.spyOn(mockPostsService, 'remove').mockRejectedValue(new Error('Service Error'));

      const result = postController.remove(postId);

      expect(result).rejects.toThrow(InternalServerErrorException);
      expect(result).rejects.toThrow ("Service Error");
    });

    it('should throw a NotFoundException when remove(postId) called with invalid id', () => {
      jest.spyOn(mockPostsService, 'findOne').mockResolvedValue(null);
      expect(postController.remove(postId)).rejects.toThrow(NotFoundException);
    });

    it('should throw QueryFailedError when remove(postId) called with invalid id format', async () => {
      jest.spyOn(mockPostsService, 'findOne').mockRejectedValue(new QueryFailedError('', [], Error()));

      const result = postController.remove('invalid-id');

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow ('Formato inválido do ID.');
    })
  });
});