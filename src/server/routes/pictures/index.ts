import listPictures from "../../controllers/listPicture";
import takePicture from "../../controllers/takePicture";
import uploadPictures from "../../controllers/uploadPictures";
import { Router } from "express";

export const pictureRoutes = (router: Router) => {
  router.get('/capture', takePicture);
  router.get('/list', listPictures);
  router.post('/upload', uploadPictures);
}

export default pictureRoutes;