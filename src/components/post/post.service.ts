class PostService {
  private postDao: PostDao;

  constructor() {
    this.postDao = new PostDao();
  }
}

export default  PostService;
