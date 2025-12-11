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
import { cacheMiddleware } from "../../infrastructure/cache/cacheMiddleware";
import {
  CacheGroups,
  cacheKeys,
} from "../../infrastructure/cache/utils/cacheKeys";
import { invalidateCacheMiddleware } from "../../infrastructure/cache/invalidCacheMiddleware";

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
router
  .route(blog.create)
  .post(
    veryfyJWT,
    upload.single("photo"),
    invalidateCacheMiddleware([CacheGroups.BLOG_LIST]),
    createBlog
  );
// update blog
router.route(blog.update).patch(
  veryfyJWT,
  (req, res, next) => {
    invalidateCacheMiddleware([
      CacheGroups.BLOG(req.params.blogId),
      CacheGroups.BLOG_LIST,
    ])(req, res, next);
  },
  updateBlog
);
// update blog photo
router.route(blog.updatePhoto).patch(
  veryfyJWT,
  upload.single("photo"),
  (req, res, next) => {
    invalidateCacheMiddleware([
      CacheGroups.BLOG(req.params.blogId),
      CacheGroups.BLOG_LIST,
    ]);
  },
  updateBlogPhoto
);
// update publish status
router.route(blog.publishStatus).patch(
  veryfyJWT,
  (req, res, next) => {
    invalidateCacheMiddleware([
      CacheGroups.BLOG(req.params.blogId),
      CacheGroups.BLOG_LIST,
    ]);
  },
  blogPublish
);
// get all blogs
router.route(blog.getAll).get(
  cacheMiddleware({
    key: cacheKeys.blogList,
    ttl: 120,
    groups: [CacheGroups.BLOG_LIST],
  }),
  getAllBlogs
);
// manage blogs
router.route(blog.manage).get(
  veryfyJWT,
  cacheMiddleware({
    key: cacheKeys.blogList,
    ttl: 60,
    groups: [CacheGroups.BLOG_LIST],
  }),
  manageBlogs
);
// get blog details
router.route(blog.details).get((req, res, next) => {
  cacheMiddleware({ key: cacheKeys.blogDetails(req.params.blogId) })(
    req,
    res,
    next
  );
}, blogDetails);

export default router;
