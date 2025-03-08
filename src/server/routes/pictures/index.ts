import listPictures from "../../controllers/listPicture";
import takePicture from "../../controllers/takePicture";

import { Router } from "express";

export const pictureRoutes = (router: Router) => {
  router.get('/capture', takePicture);
  router.get('/list', listPictures);
}

export default pictureRoutes;