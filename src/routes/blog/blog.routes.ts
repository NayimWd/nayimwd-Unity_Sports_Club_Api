import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import {
  createBlog,
  updateBlog,
  updateBlogPhoto,
  blogPublish,
  getAllBlogs,
  manageBlogs,
  blogDetails,
} from "../../controller/blogs";

const router = Router();

// blog types
type Blog = {
  create: "/create";
  update: "/update/:blogId";
  updatePhoto: "/updatPhoto/:blogId";
  publishStatus: "/publishStatus/:blogId";
  getAll: "/getAll";
  manage: "/manage";
  details: "/details/:blogId";
};

// blog routes
const blog: Blog = {
  create: "/create",
  update: "/update/:blogId",
  updatePhoto: "/updatPhoto/:blogId",
  publishStatus: "/publishStatus/:blogId",
  getAll: "/getAll",
  manage: "/manage",
  details: "/details/:blogId",
};

// create blog
router.route(blog.create).post(veryfyJWT, upload.single("photo"), createBlog);
// update blog
router.route(blog.update).patch(veryfyJWT, updateBlog);
// update blog photo
router
  .route(blog.updatePhoto)
  .patch(veryfyJWT, upload.single("photo"), updateBlogPhoto);
// update publish status
router.route(blog.publishStatus).patch(veryfyJWT, blogPublish);
// get all blogs
router.route(blog.getAll).get(getAllBlogs);
// manage blogs
router.route(blog.manage).get(veryfyJWT, manageBlogs);
// get blog details
router.route(blog.details).get(blogDetails);

export default router;
