
export const imageValidation = (file: Express.Multer.File) => {
  // if (file.fieldname !== "image") {
  //   ResponseHandlerThrow.throw(
  //     HttpStatusCode.BAD_REQUEST,
  //     false,
  //     "image should be in valid field"
  //   );
  // }
  const allowedMimeTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    // ResponseHandlerThrow.throw(
    //   HttpStatusCode.BAD_REQUEST,
    //   false,
    //   "File should be png , jpg , jpeg , gif"
    // );
  }
  if (file.size > 10 * 1024 * 1024) {
    // ResponseHandlerThrow.throw(
    //   HttpStatusCode.BAD_REQUEST,
    //   false,
    //   `${file.originalname} file should be under 10mb.`
    // );
  }

  return true;
};
